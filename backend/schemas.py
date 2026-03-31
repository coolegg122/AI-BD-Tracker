from pydantic import BaseModel, field_validator
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
