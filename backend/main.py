from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models, schemas, database
from ai_engine import extract_universal
from sqladmin import Admin, ModelView

# Avoid running DDL (create_all) in serverless environments or pooler connections
# models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI-BD Tracker API", version="1.0.0")

# ==========================================
# PHASE 7: SQLADMIN BACK-OFFICE PORTAL
# ==========================================
admin = Admin(app, database.engine)

class ProjectAdmin(ModelView, model=models.Project):
    column_list = [models.Project.id, models.Project.company, models.Project.pipeline, models.Project.stage, models.Project.nextFollowUp, models.Project.status]
    name = "BD Project"
    name_plural = "BD Projects"
    icon = "fa-solid fa-briefcase"

class TaskAdmin(ModelView, model=models.Task):
    column_list = [models.Task.id, models.Task.project_id, models.Task.type, models.Task.desc, models.Task.date]
    name = "Task / Event"
    name_plural = "Tasks & Events"
    icon = "fa-solid fa-list-check"

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

class ProjectHistoryAdmin(ModelView, model=models.ProjectHistory):
    column_list = [models.ProjectHistory.id, models.ProjectHistory.project_id, models.ProjectHistory.type, models.ProjectHistory.title, models.ProjectHistory.date]
    name = "Project History"
    name_plural = "Project Histories"
    icon = "fa-solid fa-clock-rotate-left"

admin.add_view(ProjectAdmin)
admin.add_view(TaskAdmin)
admin.add_view(CatalystAdmin)
admin.add_view(ContactAdmin)
admin.add_view(ProjectHistoryAdmin)

# Allow CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "https://*.vercel.app", # Trust Vercel subdomains
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI-BD Tracker Backend is running"}

@app.post("/api/v1/extract", response_model=dict)
def ai_extract_bd_data(request: schemas.AIParsingRequest):
    """
    接收长文本，根据类型 (Project, Contact, Meeting Note) 调用大模型提取结构化数据
    """
    try:
        parsed_data = extract_universal(request.raw_text, request.type)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

@app.post("/api/v1/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    """保存 AI 提取后确认的项目，或手动新建项目"""
    db_project = models.Project(
        company=project.company,
        pipeline=project.pipeline,
        stage=project.stage,
        nextFollowUp=project.nextFollowUp,
        lastContactDate=datetime.now().strftime('%Y-%m-%d'),
        status="active"
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    for task in project.tasks:
        db_task = models.Task(**task.model_dump(), project_id=db_project.id)
        db.add(db_task)
    db.commit()
    db.refresh(db_project)
    
    return db_project

@app.get("/api/v1/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(database.get_db)):
    """获取所有项目，供 Dashboard 和 Kanban 使用"""
    return db.query(models.Project).all()

@app.patch("/api/v1/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project_stage(project_id: int, stage_update: dict, db: Session = Depends(database.get_db)):
    """看板拖拽：更新项目所处阶段"""
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if "stage" in stage_update:
        db_project.stage = stage_update["stage"]
        db.commit()
        db.refresh(db_project)
    return db_project

@app.get("/api/v1/projects/{project_id}/history", response_model=List[schemas.ProjectHistoryResponse])
def get_project_history(project_id: int, db: Session = Depends(database.get_db)):
    """获取指定项目的历史追踪足迹"""
    history = db.query(models.ProjectHistory).filter(models.ProjectHistory.project_id == project_id).order_by(models.ProjectHistory.id.desc()).all()
    return history

@app.post("/api/v1/projects/{project_id}/history", response_model=schemas.ProjectHistoryResponse)
def create_project_history(project_id: int, history_entry: schemas.ProjectHistoryCreate, db: Session = Depends(database.get_db)):
    """新增一条项目历史追踪足迹"""
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_history = models.ProjectHistory(**history_entry.model_dump(), project_id=project_id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@app.post("/api/v1/webhook/ingest")
def webhook_ingest_data(payload: dict, db: Session = Depends(database.get_db)):
    """
    Webhook endpoint for enterprise automation (e.g. forward from Email/Lark/DingTalk).
    Expects a JSON payload containing 'text' or 'content'.
    Automatically runs AI extraction and saves to the database.
    """
    raw_text = payload.get("text") or payload.get("content") or payload.get("msg")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing 'text' or 'content' in payload")
        
    try:
        # 1. Run inference
        parsed_data = extract_project_info(raw_text)
        
        # 2. Re-use schema validation
        project_create = schemas.ProjectCreate(**parsed_data)
        
        # 3. Direct DB insert
        db_project = models.Project(
            company=project_create.company,
            pipeline=project_create.pipeline,
            stage=project_create.stage,
            nextFollowUp=project_create.nextFollowUp,
            lastContactDate=datetime.now().strftime('%Y-%m-%d'),
            status="active"
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        for task in project_create.tasks:
            db_task = models.Task(**task.model_dump(), project_id=db_project.id)
            db.add(db_task)
        db.commit()
        
        return {"status": "success", "message": "Automated ingestion complete", "project_id": db_project.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/contacts", response_model=List[schemas.ContactResponse])
def get_contacts(db: Session = Depends(database.get_db)):
    """获取所有高级联系人档案，供 Key Contacts 面板展示"""
    return db.query(models.Contact).all()

@app.post("/api/v1/contacts", response_model=schemas.ContactResponse)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(database.get_db)):
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
            last_updated=datetime.now().strftime('%Y-%m-%d')
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

