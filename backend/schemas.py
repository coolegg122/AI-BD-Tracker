from pydantic import BaseModel, field_validator, EmailStr
from typing import List, Optional

class TaskBase(BaseModel):
    type: str
    desc: str
    date: str
    status: str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class AttachmentBase(BaseModel):
    name: str
    file_type: str
    category: str
    url: str
    uploaded_at: str

class AttachmentCreate(AttachmentBase):
    pass

class AttachmentResponse(AttachmentBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class OwnerBase(BaseModel):
    name: str
    role: str
    initials: str

class CareerHistoryBase(BaseModel):
    company: str
    title: str
    dateRange: str
    isCurrent: bool = False

class CareerHistoryCreate(CareerHistoryBase):
    pass

class CareerHistoryResponse(CareerHistoryBase):
    id: int
    contact_id: int
    
    class Config:
        from_attributes = True

class ContactBase(BaseModel):
    name: str
    currentCompany: str
    currentTitle: str
    functionArea: str
    photoUrl: str
    location: str
    email: str
    linkedin: str
    phone: str
    profile: str
    metAt: Optional[List[str]] = []
    details: Optional[dict] = {}

    @field_validator('metAt', mode='before')
    @classmethod
    def metAt_default(cls, v):
        return v if v is not None else []

    @field_validator('details', mode='before')
    @classmethod
    def details_default(cls, v):
        return v if v is not None else {}

class ContactCreate(ContactBase):
    careerHistory: List[CareerHistoryCreate] = []

class ContactResponse(ContactBase):
    id: int
    careerHistory: List[CareerHistoryResponse] = []

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    company: str
    pipeline: str = ""
    stage: str = "Initial Contact"
    nextFollowUp: Optional[str] = ""
    tasks: List[TaskCreate] = []
    attachments: List[AttachmentCreate] = []
    details: Optional[dict] = {}
    primary_contact: Optional[ContactCreate] = None  # NEW: For auto-syncing contacts

    @field_validator('details', mode='before')
    @classmethod
    def details_default(cls, v):
        return v if v is not None else {}

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    lastContactDate: str
    status: str
    owner: Optional[OwnerBase] = None
    tasks: List[TaskResponse] = []
    attachments: List[AttachmentResponse] = []
    negotiation_prep: Optional[dict] = {}
    prep_updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class DealBase(BaseModel):
    date: str
    target: str
    deal_type: str
    value: str

class IntelligenceBase(BaseModel):
    company_name: str
    focus_areas: List[str] = []
    bd_strategy: str = ""
    patent_cliffs: List[str] = []
    recent_deals: List[DealBase] = []
    last_updated: str = ""

class IntelligenceResponse(IntelligenceBase):
    id: int

    class Config:
        from_attributes = True

class AIParsingRequest(BaseModel):
    raw_text: str
    type: str = "project" # project, contact, or meeting_note

class ProjectHistoryBase(BaseModel):
    type: str
    title: str
    date: str
    desc: str
    details: Optional[dict] = {}

    @field_validator('details', mode='before')
    @classmethod
    def details_default(cls, v):
        return v if v is not None else {}

class ProjectHistoryCreate(ProjectHistoryBase):
    pass

class ProjectHistoryResponse(ProjectHistoryBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class PendingIngestionBase(BaseModel):
    source_type: str
    sender_email: str
    subject: Optional[str] = None
    raw_content: str
    attachments: Optional[List[str]] = []
    ai_extracted_payload: Optional[dict] = {}
    entity_type: Optional[str] = None
    status: str = "pending"
    created_at: str

    @field_validator('attachments', mode='before')
    @classmethod
    def attachments_default(cls, v):
        return v if v is not None else []

    @field_validator('ai_extracted_payload', mode='before')
    @classmethod
    def payload_default(cls, v):
        return v if v is not None else {}

class PendingIngestionResponse(PendingIngestionBase):
    id: int

    class Config:
        from_attributes = True

# User-related schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    initials: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    initials: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None

# Phase 28: New Schemas
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class SearchResultItem(BaseModel):
    type: str # 'project' or 'contact'
    id: int
    title: str
    subtitle: str

class NotificationPreferences(BaseModel):
    email_alerts: bool = True
    pipeline_updates: bool = True
    meeting_reminders: bool = True
    ai_insights: bool = True

class UserPreferencesUpdate(BaseModel):
    notification_prefs: Optional[NotificationPreferences] = None
    theme: Optional[str] = None # 'light' or 'dark'

class UserResponse(UserBase):
    id: int
    is_active: int
    notification_prefs: Optional[dict] = {}
    theme: Optional[str] = "light"

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Phase 28.1: AI Strategist Chat
class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # List of {"role": "user/ai", "content": "..."}

class ChatResponse(BaseModel):
    response: str
    context_used: Optional[str] = None
