from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String)
    initials = Column(String)

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True)
    pipeline = Column(String)
    stage = Column(String, default="Initial Contact")
    lastContactDate = Column(String)
    nextFollowUp = Column(String)
    status = Column(String, default="active")
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    type = Column(String) # meeting, share, follow_up
    desc = Column(String)
    date = Column(String)
    status = Column(String) # pending, tentative, confirmed

    project = relationship("Project", back_populates="tasks")

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

