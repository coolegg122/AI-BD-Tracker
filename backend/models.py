from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON, Boolean, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Association table for Deal and Asset (Many-to-Many)
deal_assets = Table(
    "deal_assets",
    Base.metadata,
    Column("deal_id", Integer, ForeignKey("deals.id", ondelete="CASCADE"), primary_key=True),
    Column("asset_id", Integer, ForeignKey("assets.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    job_title = Column(String)
    role = Column(String)            # Permission Role (admin / guest)
    initials = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    notification_prefs = Column(JSON, default=dict)
    theme = Column(String, default="light")

    deals = relationship("Deal", back_populates="owner")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    company_id = Column(Integer, ForeignKey("company_intelligence.id", ondelete="SET NULL"))
    type = Column(String)       # Small Molecule, Antibody, ADC, etc.
    indication = Column(String) # Lead Indication
    phase = Column(String)      # Discovery, Preclinical, Phase I, etc.
    moa = Column(String)        # Mechanism of Action
    details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("CompanyIntelligence", back_populates="assets")
    deals = relationship("Deal", secondary=deal_assets, back_populates="assets")

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True) # Text company name (kept for legacy/quick search)
    pipeline = Column(String)
    stage = Column(String, default="Initial Contact")
    lastContactDate = Column(String)
    nextFollowUp = Column(String)
    status = Column(String, default="active") # active, dormant, closed
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="deals")
    details = Column(JSON, default=dict)
    source_text = Column(String)
    
    negotiation_prep = Column(JSON, default=dict)
    prep_updated_at = Column(String) 

    tasks = relationship("Task", back_populates="deal", cascade="all, delete-orphan")
    history = relationship("DealHistory", back_populates="deal", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="deal", cascade="all, delete-orphan")
    assets = relationship("Asset", secondary=deal_assets, back_populates="deals")
    
    # Phase 2: Economics & Legal
    economics = relationship("DealEconomics", back_populates="deal", uselist=False, cascade="all, delete-orphan")
    agreements = relationship("LegalAgreement", back_populates="deal", cascade="all, delete-orphan")
    due_diligence = relationship("DueDiligenceTracker", back_populates="deal", uselist=False, cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"))
    name = Column(String)
    file_type = Column(String)
    category = Column(String)
    url = Column(String)
    uploaded_at = Column(String)

    deal = relationship("Deal", back_populates="attachments")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"))
    type = Column(String) # meeting, share, follow_up
    desc = Column(String)
    date = Column(String)
    status = Column(String) # pending, tentative, confirmed

    deal = relationship("Deal", back_populates="tasks")

class DealHistory(Base):
    __tablename__ = "deal_history"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"))
    type = Column(String) # email, call, document, meeting
    title = Column(String)
    date = Column(String)
    desc = Column(String)
    details = Column(JSON, default=dict)
    source_text = Column(String)

    deal = relationship("Deal", back_populates="history")

class Catalyst(Base):
    __tablename__ = "catalysts"

    id = Column(Integer, primary_key=True, index=True)
    competitor = Column(String) 
    asset = Column(String)      
    type = Column(String)       
    event = Column(String)      
    date = Column(String)       
    impact = Column(String, default="Medium")
    color = Column(String, default="blue")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    currentCompany = Column(String, index=True)
    currentTitle = Column(String)
    functionArea = Column(String)
    photoUrl = Column(String)
    location = Column(String)
    email = Column(String)
    linkedin = Column(String)
    phone = Column(String)
    profile = Column(String)
    metAt = Column(JSON, default=list)
    details = Column(JSON, default=dict)
    source_text = Column(String)

    careerHistory = relationship("CareerHistory", back_populates="contact", cascade="all, delete-orphan")

class CareerHistory(Base):
    __tablename__ = "career_histories"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    company = Column(String)
    title = Column(String)
    dateRange = Column(String)
    isCurrent = Column(Boolean, default=False)

    contact = relationship("Contact", back_populates="careerHistory")

class CompanyIntelligence(Base):
    __tablename__ = "company_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, unique=True, index=True)
    focus_areas = Column(JSON, default=list)
    bd_strategy = Column(String)
    patent_cliffs = Column(JSON, default=list)
    recent_deals = Column(JSON, default=list)
    last_updated = Column(String)

    assets = relationship("Asset", back_populates="company")

class PendingIngestion(Base):
    __tablename__ = "pending_ingestion"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, default="email")
    sender_email = Column(String, index=True)
    subject = Column(String)
    raw_content = Column(String)
    attachments = Column(JSON, default=list)
    ai_extracted_payload = Column(JSON, default=dict)
    entity_type = Column(String) # deal, contact, or meeting_note
    status = Column(String, default="pending")
    created_at = Column(String)

class SmartInputArchive(Base):
    __tablename__ = "smart_input_archive"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    raw_text = Column(String)
    source_type = Column(String)
    entities_summary = Column(JSON, default=dict)
    created_at = Column(String)

# Phase 2: Economics, Legal, and DD
class DealEconomics(Base):
    __tablename__ = "deal_economics"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"), unique=True)
    upfront = Column(String)  # Formatted string or numeric
    milestones = Column(String)
    royalties = Column(String)
    total_deal_value = Column(String)
    pos = Column(Integer, default=0) # Probability of Success (0-100)
    currency = Column(String, default="USD")

    deal = relationship("Deal", back_populates="economics")

class LegalAgreement(Base):
    __tablename__ = "legal_agreements"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"))
    agreement_type = Column(String) # CDA, NDA, Term Sheet, Definitive Agreement
    status = Column(String)         # Drafting, Under Review, Negotiating, Signed, Expired
    effective_date = Column(String)
    expiration_date = Column(String)

    deal = relationship("Deal", back_populates="agreements")

class DueDiligenceTracker(Base):
    __tablename__ = "due_diligence"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"), unique=True)
    vdr_link = Column(String)
    status = Column(String, default="Not Started") # Not Started, Ongoing, Completed
    key_risks = Column(JSON, default=list)

    deal = relationship("Deal", back_populates="due_diligence")

