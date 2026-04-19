from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv() # Load .env before other imports
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import os

import models, schemas, database
from ai_engine import extract_universal, extract_mixed, generate_negotiation_prep, chat_with_strategist, generate_company_intelligence
from mail_poller import sync_zoho_inbox
from auth import authenticate_user, create_access_token, get_current_active_user, get_current_admin_user, get_password_hash, verify_password

def get_now_str(include_time: bool = False, include_seconds: bool = False) -> str:
    """Standardized date/time string generator."""
    if include_seconds:
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if include_time:
        return datetime.now().strftime('%Y-%m-%d %H:%M')
    return datetime.now().strftime('%Y-%m-%d')


# Auto-create tables for LOCAL SQLite ONLY.
# IMPORTANT (Phase 17): DO NOT run create_all or DDL against Supabase Transaction Pooler (port 6543).
# It causes Vercel 10s timeout crashes on cold start. Cloud schema is managed via Supabase dashboard.
_db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING") or "sqlite"
if _db_url.startswith("sqlite"):
    models.Base.metadata.create_all(bind=database.engine)


app = FastAPI(title="AI-BD Tracker API", version="1.0.3")

# ==========================================
# PHASE 7: SQLADMIN BACK-OFFICE PORTAL
# (Phase 28 Update): Force-enabled on Vercel at user request.
# Note: May cause Vercel cold-start timeouts (10s) with Supabase pooler.
# ==========================================
try:
    from sqladmin import Admin, ModelView

    admin = Admin(app, database.engine)

    class DealAdmin(ModelView, model=models.Deal):
        column_list = [models.Deal.id, models.Deal.company, models.Deal.pipeline, models.Deal.stage, models.Deal.nextFollowUp, models.Deal.status]
        name = "BD Deal"
        name_plural = "BD Deals"
        icon = "fa-solid fa-briefcase"

    class TaskAdmin(ModelView, model=models.Task):
        column_list = [models.Task.id, models.Task.deal_id, models.Task.type, models.Task.desc, models.Task.date]
        name = "Task / Event"
        name_plural = "Tasks & Events"
        icon = "fa-solid fa-list-check"

    class AssetAdmin(ModelView, model=models.Asset):
        column_list = [models.Asset.id, models.Asset.name, models.Asset.type, models.Asset.indication, models.Asset.phase]
        name = "Asset"
        name_plural = "Assets"
        icon = "fa-solid fa-dna"

    class CatalystAdmin(ModelView, model=models.Catalyst):
        column_list = [models.Catalyst.id, models.Catalyst.competitor, models.Catalyst.asset, models.Catalyst.type, models.Catalyst.date, models.Catalyst.impact]
        name = "Competitor Catalyst"
        name_plural = "Competitor Catalysts"
        icon = "fa-solid fa-microscope"

    class ContactAdmin(ModelView, model=models.Contact):
        column_list = [models.Contact.id, models.Contact.name, models.Contact.currentCompany, models.Contact.currentTitle, models.Contact.email]
        name = "Key Contact"
        name_plural = "Key Contacts"
        icon = "fa-solid fa-users"

    class DealHistoryAdmin(ModelView, model=models.DealHistory):
        column_list = [models.DealHistory.id, models.DealHistory.deal_id, models.DealHistory.type, models.DealHistory.title, models.DealHistory.date]
        name = "Deal History"
        name_plural = "Deal Histories"
        icon = "fa-solid fa-clock-rotate-left"

    class AttachmentAdmin(ModelView, model=models.Attachment):
        column_list = [models.Attachment.id, models.Attachment.deal_id, models.Attachment.name, models.Attachment.file_type, models.Attachment.category]
        name = "Deal Document"
        name_plural = "Deal Documents"
        icon = "fa-solid fa-file-pdf"

    class UserAdmin(ModelView, model=models.User):
        column_list = [models.User.id, models.User.name, models.User.email, models.User.job_title, models.User.role, models.User.is_active]
        form_columns = [models.User.name, models.User.email, models.User.job_title, models.User.role, models.User.hashed_password, models.User.is_active]
        form_choices = {
            "role": [("admin", "Administrator"), ("guest", "Guest / Read-Only")]
        }
        name = "User Account"
        name_plural = "User Accounts"
        icon = "fa-solid fa-user-gear"

        async def on_model_change(self, data, model, is_created, request):
            """Automatically hash plain-text passwords entered via admin panel."""
            if "hashed_password" in data and data["hashed_password"]:
                # Check if it looks like a plain password (not an existing bcrypt hash)
                if not data["hashed_password"].startswith("$2b$"):
                    data["hashed_password"] = get_password_hash(data["hashed_password"])
            return await super().on_model_change(data, model, is_created, request)

    class CareerHistoryAdmin(ModelView, model=models.CareerHistory):
        column_list = [models.CareerHistory.id, models.CareerHistory.contact_id, models.CareerHistory.company, models.CareerHistory.title]
        name = "Career Track"
        name_plural = "Career Tracks"
        icon = "fa-solid fa-graduation-cap"

    admin.add_view(UserAdmin)
    admin.add_view(DealAdmin)
    admin.add_view(AssetAdmin)
    admin.add_view(TaskAdmin)
    admin.add_view(CatalystAdmin)
    admin.add_view(ContactAdmin)
    admin.add_view(DealHistoryAdmin)
    admin.add_view(AttachmentAdmin)
    admin.add_view(CareerHistoryAdmin)
except Exception as _sqladmin_err:
    print(f"[Warning] sqladmin failed to initialize (non-critical): {_sqladmin_err}")

# Simplified CORS for trouble-shooting local dev issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI-BD Tracker Backend is running"}

@app.post("/api/v1/extract", response_model=dict)
def ai_extract_bd_data(request: schemas.AIParsingRequest, current_user: models.User = Depends(get_current_admin_user)):
    """
    接收长文本，根据类型 (Deal, Contact, Meeting Note) 调用大模型提取结构化数据
    """
    try:
        parsed_data = extract_universal(request.raw_text, request.type)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

@app.post("/api/v1/smart-input/universal")
def process_universal_smart_input(request: schemas.AIParsingRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Universal AI extraction and auto-persistence for multi-module updates."""
    # 1. AI Extraction
    parsed = extract_mixed(request.raw_text)
    
    results = {"deal": None, "contacts": [], "assets": [], "history": None}
    
    # 2. Update/Create Deal
    deal_data = parsed.get("update_deal")
    if deal_data:
        company = deal_data.get("company")
        db_deal = db.query(models.Deal).filter(
            models.Deal.company.ilike(company)
        ).first()
        
        if db_deal:
            if deal_data.get("stage"): db_deal.stage = deal_data["stage"]
            if deal_data.get("details"):
                existing_details = db_deal.details or {}
                for k, v in deal_data["details"].items():
                    existing_details[k] = v
                db_deal.details = existing_details
            
            db_deal.source_text = request.raw_text
            results["deal"] = {"id": db_deal.id, "action": "updated"}
        else:
            db_deal = models.Deal(
                company=company,
                pipeline=deal_data.get("pipeline") or "Unknown Pipeline",
                stage=deal_data.get("stage") or "Initial Contact",
                lastContactDate=get_now_str(),
                owner_id=current_user.id,
                details=deal_data.get("details", {}),
                source_text=request.raw_text,
                status="active"
            )
            db.add(db_deal)
            db.flush()
            results["deal"] = {"id": db_deal.id, "action": "created", "company": company}

        # Handle Assets associated with the Deal
        assets_data = deal_data.get("assets", [])
        for asset in assets_data:
            if not asset.get("name"): continue
            # Check if asset exists
            existing_asset = db.query(models.Asset).filter(models.Asset.name.ilike(asset["name"])).first()
            if not existing_asset:
                new_asset = models.Asset(
                    name=asset["name"],
                    type=asset.get("type"),
                    indication=asset.get("indication"),
                    phase=asset.get("phase"),
                    moa=asset.get("moa")
                )
                db.add(new_asset)
                db.flush()
                db_deal.assets.append(new_asset)
                results["assets"].append({"name": asset["name"], "action": "created_and_linked"})
            else:
                if existing_asset not in db_deal.assets:
                    db_deal.assets.append(existing_asset)
                    results["assets"].append({"name": asset["name"], "action": "linked_existing"})

    # 3. Upsert Contacts
    contacts_data = parsed.get("upsert_contacts", [])
    for c in contacts_data:
        if not c.get("name"): continue
        existing_c = db.query(models.Contact).filter(
            (models.Contact.name.ilike(c["name"])) | 
            (models.Contact.email == c.get("email"))
        ).first()
        
        if existing_c:
            if c.get("currentTitle"): existing_c.currentTitle = c["currentTitle"]
            if c.get("functionArea"): existing_c.functionArea = c["functionArea"]
            existing_c.source_text = request.raw_text
            results["contacts"].append({"name": c["name"], "action": "updated"})
        else:
            new_c = models.Contact(
                name=c["name"],
                currentCompany=c.get("currentCompany") or (deal_data.get("company") if deal_data else "Unknown"),
                currentTitle=c.get("currentTitle"),
                functionArea=c.get("functionArea"),
                email=c.get("email"),
                profile=c.get("profile"),
                source_text=request.raw_text
            )
            db.add(new_c)
            results["contacts"].append({"name": c["name"], "action": "created"})

    # 4. Add Timeline Event (History)
    hist_data = parsed.get("add_timeline_event")
    if hist_data and results["deal"] and results["deal"].get("id"):
        db_history = models.DealHistory(
            deal_id=results["deal"]["id"],
            type=hist_data.get("type", "meeting"),
            title=hist_data.get("title"),
            date=hist_data.get("date") or get_now_str(),
            desc=hist_data.get("desc"),
            details=hist_data.get("details", {}),
            source_text=request.raw_text
        )
        db.add(db_history)
        results["history"] = {"id": db_history.id, "action": "created"}
        
        attendees = hist_data.get("details", {}).get("attendees", [])
        for att in attendees:
            if isinstance(att, dict) and att.get("name"):
                name = att["name"]
                existing_c = db.query(models.Contact).filter(models.Contact.name.ilike(name)).first()
                if not existing_c:
                    new_c = models.Contact(
                        name=name,
                        currentCompany=att.get("company") or (deal_data.get("company") if deal_data else "Unknown"),
                        currentTitle=att.get("title"),
                        functionArea=att.get("functionArea"),
                        metAt=[deal_data.get("company")] if deal_data else [],
                        source_text=request.raw_text
                    )
                    db.add(new_c)
                    results["contacts"].append({"name": name, "action": "promoted_from_attendee"})
        
        db.commit()
    return {"status": "success", "results": results, "raw_ai_output": parsed}



@app.post("/api/v1/deals", response_model=schemas.DealResponse)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """保存 AI 提取后确认的交易，或手动新建交易"""
    db_deal = models.Deal(
        company=deal.company,
        pipeline=deal.pipeline,
        stage=deal.stage,
        nextFollowUp=deal.nextFollowUp,
        lastContactDate=get_now_str(),
        details=deal.details,
        status="active",
        owner_id=current_user.id
    )
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    for task in deal.tasks:
        db_task = models.Task(**task.model_dump(), deal_id=db_deal.id)
        db.add(db_task)
    
    for att in deal.attachments:
        db_att = models.Attachment(**att.model_dump(), deal_id=db_deal.id)
        db.add(db_att)

    # Auto-sync primary contact if provided
    if deal.primary_contact and deal.primary_contact.name:
        pc = deal.primary_contact
        existing_contact = db.query(models.Contact).filter(models.Contact.email == pc.email).first() if pc.email else None
        
        if existing_contact:
            existing_contact.name = pc.name
            existing_contact.currentCompany = pc.currentCompany or db_deal.company
            existing_contact.currentTitle = pc.currentTitle or existing_contact.currentTitle
            if db_deal.company not in (existing_contact.metAt or []):
                new_met_at = (existing_contact.metAt or []) + [db_deal.company]
                existing_contact.metAt = new_met_at
        else:
            db_contact = models.Contact(
                name=pc.name,
                email=pc.email,
                currentCompany=pc.currentCompany or db_deal.company,
                currentTitle=pc.currentTitle,
                location=pc.location,
                metAt=[db_deal.company],
                details=pc.details or {}
            )
            db.add(db_contact)
            
    db.commit()
    db.refresh(db_deal)
    
    return db_deal

@app.get("/api/v1/deals/{deal_id}/attachments", response_model=List[schemas.AttachmentResponse])
def get_deal_attachments(deal_id: int, db: Session = Depends(database.get_db)):
    """获取交易的全量附件与档案列表"""
    return db.query(models.Attachment).filter(models.Attachment.deal_id == deal_id).all()

@app.get("/api/v1/deals", response_model=List[schemas.DealResponse])
def get_deals(db: Session = Depends(database.get_db)):
    """获取所有交易，供 Dashboard 和 Kanban 使用"""
    return db.query(models.Deal).all()

@app.get("/api/v1/deals/{deal_id}", response_model=schemas.DealResponse)
def get_deal_detail(deal_id: int, db: Session = Depends(database.get_db)):
    """获取指定交易的详细信息"""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal

@app.patch("/api/v1/deals/{deal_id}", response_model=schemas.DealResponse)
def update_deal(deal_id: int, deal_update: schemas.DealUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """通用交易更新"""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = deal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deal, key, value)
        
    db.commit()
    db.refresh(db_deal)
    return db_deal

@app.patch("/api/v1/deals/{deal_id}/economics", response_model=schemas.DealEconomicsResponse)
def update_deal_economics(deal_id: int, econ_update: schemas.DealEconomicsUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Update financial valuation data for a deal."""
    db_econ = db.query(models.DealEconomics).filter(models.DealEconomics.deal_id == deal_id).first()
    if not db_econ:
        db_econ = models.DealEconomics(deal_id=deal_id, **econ_update.model_dump())
        db.add(db_econ)
    else:
        update_data = econ_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_econ, key, value)
    
    db.commit()
    db.refresh(db_econ)
    return db_econ

@app.post("/api/v1/deals/{deal_id}/agreements", response_model=schemas.LegalAgreementResponse)
def add_deal_agreement(deal_id: int, agreement: schemas.LegalAgreementCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Add a new legal agreement (NDA, TS, etc.) to a deal."""
    db_agreement = models.LegalAgreement(**agreement.model_dump(), deal_id=deal_id)
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    return db_agreement

@app.patch("/api/v1/deals/{deal_id}/agreements/{agreement_id}", response_model=schemas.LegalAgreementResponse)
def update_deal_agreement(deal_id: int, agreement_id: int, agreement_update: schemas.LegalAgreementUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Update the status or dates of a specific legal agreement."""
    db_agreement = db.query(models.LegalAgreement).filter(models.LegalAgreement.id == agreement_id, models.LegalAgreement.deal_id == deal_id).first()
    if not db_agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    update_data = agreement_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_agreement, key, value)
        
    db.commit()
    db.refresh(db_agreement)
    return db_agreement

@app.patch("/api/v1/deals/{deal_id}/due-diligence", response_model=schemas.DueDiligenceTrackerResponse)
def update_deal_due_diligence(deal_id: int, dd_update: schemas.DueDiligenceTrackerUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Update Due Diligence status and VDR links."""
    db_dd = db.query(models.DueDiligenceTracker).filter(models.DueDiligenceTracker.deal_id == deal_id).first()
    if not db_dd:
        db_dd = models.DueDiligenceTracker(deal_id=deal_id, **dd_update.model_dump())
        db.add(db_dd)
    else:
        update_data = dd_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_dd, key, value)
            
    db.commit()
    db.refresh(db_dd)
    return db_dd

@app.patch("/api/v1/contacts/{contact_id}", response_model=schemas.ContactResponse)
def update_contact(contact_id: int, contact_update: schemas.ContactUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """通用联系人更新：支持修改姓名、公司、职位、联系方式等"""
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    update_data = contact_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contact, key, value)
        
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/api/v1/deals/{deal_id}/history", response_model=List[schemas.DealHistoryResponse])
def get_deal_history(deal_id: int, db: Session = Depends(database.get_db)):
    """获取指定交易的历史追踪足迹"""
    history = db.query(models.DealHistory).filter(models.DealHistory.deal_id == deal_id).order_by(models.DealHistory.id.desc()).all()
    return history

@app.post("/api/v1/deals/{deal_id}/history", response_model=schemas.DealHistoryResponse)
def create_deal_history(deal_id: int, history_entry: schemas.DealHistoryCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """新增一条交易历史追踪足迹"""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db_history = models.DealHistory(**history_entry.model_dump(), deal_id=deal_id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@app.post("/api/v1/webhook/ingest")
def webhook_ingest_data(payload: dict, db: Session = Depends(database.get_db)):
    """
    Webhook endpoint for enterprise automation (e.g. forward from Email/Lark/DingTalk).
    """
    # Cloudmailin / Generic Webhook mapping
    raw_text = payload.get("plain") or payload.get("text") or payload.get("content") or payload.get("msg")
    sender = payload.get("from", "unknown@robot.ai")
    subject = payload.get("subject", "No Subject")
    attachments = payload.get("attachments", []) # List of attachment objects/filenames
    attachment_names = [a.get("file_name") for a in attachments if isinstance(a, dict)]
    
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing text content in payload")
        
    try:
        # 1. Background Inference (Guess Type and Extract)
        # We guess the type first (default to project)
        # Optimization: AI could guess the type, but for now we default to project for extraction
        parsed_data = extract_universal(raw_text, "project") 
        
        # 2. Save to Pending Inbox for Admin Review
        db_pending = models.PendingIngestion(
            source_type="email" if "from" in payload else "webhook",
            sender_email=sender,
            subject=subject,
            raw_content=raw_text,
            attachments=attachment_names,
            ai_extracted_payload=parsed_data,
            entity_type="project", # AI's guess
            status="pending",
            created_at=get_now_str(include_time=True)
        )
        db.add(db_pending)
        db.commit()
        db.refresh(db_pending)
        
        return {"status": "success", "message": "Queued for review", "ingestion_id": db_pending.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ingestion/pending", response_model=List[schemas.PendingIngestionResponse])
def get_pending_ingestions(db: Session = Depends(database.get_db)):
    """获取所有待审核的自动化采集项"""
    return db.query(models.PendingIngestion).filter(models.PendingIngestion.status == "pending").all()

@app.post("/api/v1/ingestion/{id}/process")
def mark_ingestion_processed(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """审核通过后，将采集项标记为已处理"""
    db_item = db.query(models.PendingIngestion).filter(models.PendingIngestion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item.status = "processed"
    
    # NEW: Archive the processed ingestion
    archive_entry = models.SmartInputArchive(
        user_id=current_user.id,
        raw_text=db_item.raw_content,
        source_type=db_item.source_type,
        entities_summary={
            "ingestion_id": db_item.id,
            "subject": db_item.subject,
            "entity_type": db_item.entity_type
        },
        created_at=get_now_str(include_time=True)
    )
    db.add(archive_entry)
    db.commit()
    return {"status": "success"}


@app.delete("/api/v1/ingestion/{id}")
def discard_ingestion(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """丢弃无用的自动化采集项"""
    db_item = db.query(models.PendingIngestion).filter(models.PendingIngestion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"status": "success"}

@app.post("/api/v1/ingestion/sync")
def sync_mail_inbox(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Trigger a manual Zoho IMAP sync and push new emails into PendingIngestion"""
    result = sync_zoho_inbox(db, extract_universal)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.get("/api/v1/smart-input/archive", response_model=List[schemas.SmartInputArchiveResponse])
def get_smart_input_archive(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Fetch the historical record of all processed smart inputs."""
    return db.query(models.SmartInputArchive).order_by(models.SmartInputArchive.created_at.desc()).all()

@app.post("/api/v1/smart-input/archive", response_model=schemas.SmartInputArchiveResponse)
def create_smart_input_archive(archive_data: schemas.SmartInputArchiveCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Manually persist a smart input session into the traceability archive."""
    archive_entry = models.SmartInputArchive(
        user_id=current_user.id,
        raw_text=archive_data.raw_text,
        source_type=archive_data.source_type,
        entities_summary=archive_data.entities_summary,
        created_at=get_now_str(include_time=True)
    )
    db.add(archive_entry)
    db.commit()
    db.refresh(archive_entry)
    return archive_entry



@app.get("/api/v1/deals/{deal_id}/negotiation-prep")
def get_deal_negotiation_prep(deal_id: int, force: bool = False, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_active_user)):
    """Fetch or generate a strategic AI briefing for a deal."""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Cooldown Check (4 hours)
    cooldown_hours = 4
    can_use_cache = db_deal.negotiation_prep and db_deal.prep_updated_at
    if can_use_cache and not force:
        last_updated = datetime.strptime(db_deal.prep_updated_at, '%Y-%m-%d %H:%M:%S')
        if datetime.now() - last_updated < timedelta(hours=cooldown_hours):
            return db_deal.negotiation_prep

    # 1. Gather all Context
    history = db.query(models.DealHistory).filter(models.DealHistory.deal_id == deal_id).all()
    contacts = db.query(models.Contact).filter(models.Contact.currentCompany.ilike(db_deal.company)).all()
    intel = db.query(models.CompanyIntelligence).filter(models.CompanyIntelligence.company_name.ilike(db_deal.company)).first()
    
    # 2. Call specialized AI Strategist
    context = {
        "deal": {
            "company": db_deal.company,
            "pipeline": db_deal.pipeline,
            "stage": db_deal.stage,
            "details": db_deal.details or {}
        },
        "history": [{"type": h.type, "title": h.title, "date": h.date, "desc": h.desc} for h in history],
        "contacts": [{"name": c.name, "title": c.currentTitle, "profile": c.profile} for c in contacts],
        "intelligence": {
            "bd_strategy": intel.bd_strategy if intel else "Unknown",
            "focus_areas": intel.focus_areas if intel else [],
            "patent_cliffs": intel.patent_cliffs if intel else []
        } if intel else {}
    }

    try:
        prep_data = generate_negotiation_prep(context)
        db_deal.negotiation_prep = prep_data
        db_deal.prep_updated_at = get_now_str(include_time=True, include_seconds=True)
        db.commit()
        return prep_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate strategist briefing: {str(e)}")

@app.post("/api/v1/deals/{deal_id}/strategist-chat", response_model=schemas.ChatResponse)
def deal_strategist_chat(
    deal_id: int, 
    chat_req: schemas.ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Chat with the AI Strategist about a specific deal's negotiation."""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if not db_deal.negotiation_prep:
        raise HTTPException(status_code=400, detail="Please generate the AI Prep briefing first.")

    deal_context = {
        "company": db_deal.company,
        "pipeline": db_deal.pipeline,
        "stage": db_deal.stage
    }
    
    response_text = chat_with_strategist(
        deal_context,
        db_deal.negotiation_prep,
        chat_req.message,
        chat_req.history
    )
    
    return schemas.ChatResponse(response=response_text)

@app.get("/api/v1/contacts", response_model=List[schemas.ContactResponse])
def get_contacts(db: Session = Depends(database.get_db)):
    """获取所有高级联系人档案，供 Key Contacts 面板展示"""
    return db.query(models.Contact).all()

@app.post("/api/v1/contacts", response_model=schemas.ContactResponse)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """手工或 AI 录入新的人脉档案及相关履历"""
    # Create contact
    contact_data = contact.model_dump(exclude={"careerHistory"})
    db_contact = models.Contact(**contact_data)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    # Create career history records
    for history in contact.careerHistory:
        db_history = models.CareerHistory(
            contact_id=db_contact.id,
            company=history.company,
            title=history.title,
            dateRange=history.dateRange,
            isCurrent=1 if history.isCurrent else 0
        )
        db.add(db_history)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact

@app.get("/api/v1/intelligence/{company_name}", response_model=schemas.IntelligenceResponse)
def get_company_intelligence(company_name: str, db: Session = Depends(database.get_db)):
    """获取或者生成指定大厂的 竞争情报 报告"""
    from datetime import datetime
    import schemas, models
    from ai_engine import generate_company_intelligence

    company_name_normalized = company_name.strip()
    
    # 1. 查缓存
    db_intel = db.query(models.CompanyIntelligence).filter(
        models.CompanyIntelligence.company_name.ilike(company_name_normalized)
    ).first()
    
    if db_intel:
        # DB returns JSON directly for these columns. Parse into Pydantic model.
        # But wait, SQLAlchemy JSON column returns python list/dict directly.
        return db_intel

    # 2. 调用大模型生成
    try:
        intel_data = generate_company_intelligence(company_name_normalized)
        
        # 3. 落库缓存
        new_intel = models.CompanyIntelligence(
            company_name=intel_data.get("company_name", company_name_normalized),
            focus_areas=intel_data.get("focus_areas", []),
            bd_strategy=intel_data.get("bd_strategy", ""),
            patent_cliffs=intel_data.get("patent_cliffs", []),
            recent_deals=intel_data.get("recent_deals", []),
            last_updated=get_now_str()
        )
        db.add(new_intel)
        db.commit()
        db.refresh(new_intel)
        
        return new_intel
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate intelligence: {str(e)}")

# ==========================================
# PHASE 5 & 7: UI ENDPOINTS FOR GLOBAL BUTTONS
# ==========================================

@app.get("/api/v1/mock/dashboard")
def get_mock_dashboard(db: Session = Depends(database.get_db)):
    catalysts_db = db.query(models.Catalyst).all()
    catalysts = [
        {
            "id": c.id,
            "competitor": c.competitor,
            "asset": c.asset,
            "event": c.event,
            "date": c.date,
            "impact": c.impact
        } for c in catalysts_db
    ]

    return {
        "catalysts": catalysts,
        "alerts": [
            { "id": "alert1", "type": "Clinical Intelligence", "title": "Clinical Intelligence Alert", "content": "Analysis of recent FDA citations suggests a major competitor may be facing delays in the same therapeutic class.", "action": "Analyze Impact" }
        ],
        "dynamics": [
            { "id": "dyn1", "type": "email", "time": "Today", "title": "Email Tracking Active", "desc": "Follow-up synced." },
            { "id": "dyn2", "type": "call", "time": "Yesterday", "title": "Call Logged", "desc": "Discussion recorded." }
        ],
        "metrics": {
            "activeProjects": 10,
            "dormantProjects": 2,
            "followUpsThisWeek": 6
        }
    }

@app.get("/api/v1/mock/schedule")
def get_mock_schedule(db: Session = Depends(database.get_db)):
    catalysts_db = db.query(models.Catalyst).all()
    catalysts = [
        {
            "id": c.id,
            "type": c.type,
            "date": c.date,
            "company": c.competitor,
            "desc": c.event,
            "color": c.color
        } for c in catalysts_db
    ]

    return {
        "calendarEvents": [
            { "id": "evt1", "day": 14, "type": "Trial Readout", "color": "blue" }
        ],
        "catalysts": catalysts,
        "meetings": [
            { "id": "mtg1", "title": "Novartis Licensing - T1", "time": "14:00 - 15:00", "type": "Zoom", "status": "Confirmed" }
        ],
        "tasks": [
            { "id": "tsk1", "due": "Due Tomorrow", "title": "Review CMC docs", "desc": "Phase II results info.", "color": "blue" }
        ]
    }

@app.get("/api/v1/mock/notifications")
def get_mock_notifications():
    return [
        { "id": "n1", "title": "New Document Uploaded", "desc": "CDA for Project Helios is signed.", "time": "2m ago", "read": False },
        { "id": "n2", "title": "Meeting Reminder", "desc": "Novartis Licensing in 15 mins.", "time": "1h ago", "read": False },
        { "id": "n3", "title": "Portfolio Update", "desc": "Q3 Targets reviewed.", "time": "1d ago", "read": True }
    ]

# Authentication routes
@app.post("/api/v1/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user with email and password."""
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.name == user.name)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or name already exists"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create new user
    # Logic: First user is admin, everyone else is guest by default to prevent self-escalation
    user_count = db.query(models.User).count()
    assigned_role = "admin" if user_count == 0 else "guest"
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        job_title=user.job_title or '',
        role=assigned_role,
        initials=user.initials,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/v1/auth/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """Authenticate user and return access token."""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)  # Could be configurable
    access_token = create_access_token(
        data={"sub": str(user.id)},  # Using user.id as subject
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """Get current authenticated user's information."""
    return current_user

@app.patch("/api/v1/users/me", response_model=schemas.UserResponse)
def update_user_profile(
    user_update: schemas.UserUpdate, 
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Update current user's profile information."""
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/api/v1/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """List all users (Admin only)."""
    return db.query(models.User).order_by(models.User.id).all()

@app.patch("/api/v1/users/{user_id}", response_model=schemas.UserResponse)
def update_user_by_admin(
    user_id: int,
    user_update: schemas.UserUpdate, 
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """Update any user's role or status (Admin only)."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent admin from de-activating themselves or removing their own admin role
    if db_user.id == current_admin.id:
        if user_update.role is not None and user_update.role != 'admin':
             raise HTTPException(status_code=400, detail="You cannot remove your own admin status.")
        if user_update.is_active is not None and user_update.is_active == 0:
             raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/v1/auth/change-password")
def change_password(
    request: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Change current user's password."""
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@app.get("/api/v1/search", response_model=List[schemas.SearchResultItem])
def global_search(
    q: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Global search for deals, assets, and contacts."""
    if len(q) < 2:
        return []

    results = []
    
    # Search Deals
    deals = db.query(models.Deal).filter(
        (models.Deal.company.ilike(f"%{q}%")) | 
        (models.Deal.pipeline.ilike(f"%{q}%"))
    ).limit(5).all()
    
    for d in deals:
        results.append(schemas.SearchResultItem(
            type="deal",
            id=d.id,
            title=d.company,
            subtitle=d.pipeline or "No pipeline"
        ))

    # Search Assets
    assets = db.query(models.Asset).filter(
        (models.Asset.name.ilike(f"%{q}%")) | 
        (models.Asset.indication.ilike(f"%{q}%"))
    ).limit(5).all()
    
    for a in assets:
        results.append(schemas.SearchResultItem(
            type="asset",
            id=a.id,
            title=a.name,
            subtitle=f"{a.type} - {a.indication}" if a.type and a.indication else (a.type or a.indication or "No details")
        ))

    # Search Contacts
    contacts = db.query(models.Contact).filter(
        (models.Contact.name.ilike(f"%{q}%")) | 
        (models.Contact.currentCompany.ilike(f"%{q}%"))
    ).limit(5).all()
    
    for c in contacts:
        results.append(schemas.SearchResultItem(
            type="contact",
            id=c.id,
            title=c.name,
            subtitle=c.currentCompany or "No company"
        ))

    return results

@app.patch("/api/v1/users/me/preferences", response_model=schemas.UserResponse)
def update_user_preferences(
    prefs_update: schemas.UserPreferencesUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Update current user's preferences (notifications and theme)."""
    if prefs_update.notification_prefs is not None:
        current_user.notification_prefs = prefs_update.notification_prefs.model_dump()
    
    if prefs_update.theme is not None:
        current_user.theme = prefs_update.theme
    
    db.commit()
    db.refresh(current_user)
    return current_user

# ==========================================
# ASSET MANAGEMENT ENDPOINTS
# ==========================================

@app.get("/api/v1/assets", response_model=List[schemas.AssetResponse])
def get_assets(db: Session = Depends(database.get_db)):
    """List all biological or technological assets."""
    return db.query(models.Asset).all()

@app.post("/api/v1/assets", response_model=schemas.AssetResponse)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Create a new asset."""
    db_asset = models.Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.get("/api/v1/assets/{asset_id}", response_model=schemas.AssetResponse)
def get_asset_detail(asset_id: int, db: Session = Depends(database.get_db)):
    """Get detailed information for a specific asset."""
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

@app.patch("/api/v1/assets/{asset_id}", response_model=schemas.AssetResponse)
def update_asset(asset_id: int, asset_update: schemas.AssetUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Update asset information."""
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.post("/api/v1/deals/{deal_id}/assets/{asset_id}")
def associate_asset_to_deal(deal_id: int, asset_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Link an asset to a deal."""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    
    if not db_deal or not db_asset:
        raise HTTPException(status_code=404, detail="Deal or Asset not found")
        
    if db_asset not in db_deal.assets:
        db_deal.assets.append(db_asset)
        db.commit()
        
    return {"status": "success", "message": f"Asset {asset_id} linked to Deal {deal_id}"}

@app.delete("/api/v1/deals/{deal_id}/assets/{asset_id}")
def disassociate_asset_from_deal(deal_id: int, asset_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Unlink an asset from a deal."""
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    
    if not db_deal or not db_asset:
        raise HTTPException(status_code=404, detail="Deal or Asset not found")
        
    if db_asset in db_deal.assets:
        db_deal.assets.remove(db_asset)
        db.commit()
        
    return {"status": "success", "message": f"Asset {asset_id} unlinked from Deal {deal_id}"}

