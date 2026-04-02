from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    job_title = Column(String)       # NEW (Phase 30.2): Job Title (e.g. BD Manager)
    role = Column(String)            # Permission Role (admin / guest)
    initials = Column(String)
    hashed_password = Column(String)  # For local authentication
    is_active = Column(Integer, default=1)  # 1 for active, 0 for inactive
    notification_prefs = Column(JSON, default=dict) # NEW: Phase 28
    theme = Column(String, default="light")          # NEW: Phase 28

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True)
    pipeline = Column(String)
    stage = Column(String, default="Initial Contact")
    lastContactDate = Column(String)
    nextFollowUp = Column(String)
    status = Column(String, default="active") # active, dormant, closed
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    details = Column(JSON, default=dict) # NEW (Phase 12): Flexible storage for AI-extracted details
    source_text = Column(String) # NEW: Traceability for Smart Input
    
    # NEW (Phase 16.1): AI Strategist Cache
    negotiation_prep = Column(JSON, default=dict)
    prep_updated_at = Column(String) 

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    history = relationship("ProjectHistory", back_populates="project", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="project", cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    file_type = Column(String) # pdf, ppt, image, etc.
    category = Column(String)  # Scientific, Legal, Financial, etc.
    url = Column(String)       # Path or URL to the file
    uploaded_at = Column(String)

    project = relationship("Project", back_populates="attachments")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    type = Column(String) # meeting, share, follow_up
    desc = Column(String)
    date = Column(String)
    status = Column(String) # pending, tentative, confirmed

    project = relationship("Project", back_populates="tasks")

class ProjectHistory(Base):
    __tablename__ = "project_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    type = Column(String) # email, call, document, meeting
    title = Column(String)
    date = Column(String)
    desc = Column(String)
    details = Column(JSON, default=dict) # To store flexible fields like docId, link, attendees, etc.
    source_text = Column(String) # NEW (Phase 33): Verbatim source for traceability

    project = relationship("Project", back_populates="history")

class Catalyst(Base):
    __tablename__ = "catalysts"

    id = Column(Integer, primary_key=True, index=True)
    competitor = Column(String) # Used as competitor in Dashboard and company in Schedule
    asset = Column(String)      # e.g. "Keytruda sBLA"
    type = Column(String)       # e.g. "Trial Readout"
    event = Column(String)      # The description/event text
    date = Column(String)       # e.g. "Oct 14"
    impact = Column(String, default="Medium")
    color = Column(String, default="blue") # Tailwind color modifier

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
    metAt = Column(JSON, default=list) # Array of strings
    details = Column(JSON, default=dict) # NEW: Flexible storage for AI-extracted details
    source_text = Column(String) # NEW (Phase 33): Verbatim source/context for traceability

    careerHistory = relationship("CareerHistory", back_populates="contact", cascade="all, delete-orphan")

class CareerHistory(Base):
    __tablename__ = "career_histories"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    company = Column(String)
    title = Column(String)
    dateRange = Column(String)
    isCurrent = Column(Integer, default=0) # SQLite doesn't strictly have boolean, use int 0/1 or string. We use int.

    contact = relationship("Contact", back_populates="careerHistory")

class CompanyIntelligence(Base):
    __tablename__ = "company_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, unique=True, index=True)
    focus_areas = Column(JSON, default=list) # Array of strings
    bd_strategy = Column(String)
    patent_cliffs = Column(JSON, default=list) # Array of strings or dicts
    recent_deals = Column(JSON, default=list) # Array of dicts
    last_updated = Column(String) # Date string

class PendingIngestion(Base):
    __tablename__ = "pending_ingestion"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, default="email")
    sender_email = Column(String, index=True)
    subject = Column(String)
    raw_content = Column(String)
    attachments = Column(JSON, default=list) # List of filenames
    ai_extracted_payload = Column(JSON, default=dict) # The first guess by AI
    entity_type = Column(String) # project, contact, or meeting_note
    status = Column(String, default="pending") # pending, processed, discarded
    created_at = Column(String) # YYYY-MM-DD HH:MM
