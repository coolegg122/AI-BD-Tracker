from pydantic import BaseModel, field_validator, EmailStr
from typing import List, Optional
from datetime import datetime

class TaskBase(BaseModel):
    type: str
    desc: str
    date: str
    status: str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    deal_id: int

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
    deal_id: int

    class Config:
        from_attributes = True

class OwnerBase(BaseModel):
    name: str
    role: str
    initials: str

class AssetBase(BaseModel):
    name: str
    company_id: Optional[int] = None
    type: Optional[str] = None
    indication: Optional[str] = None
    phase: Optional[str] = None
    moa: Optional[str] = None
    details: Optional[dict] = {}

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    company_id: Optional[int] = None
    type: Optional[str] = None
    indication: Optional[str] = None
    phase: Optional[str] = None
    moa: Optional[str] = None
    details: Optional[dict] = None

class AssetResponse(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

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
    currentCompany: Optional[str] = ""
    currentTitle: Optional[str] = ""
    functionArea: Optional[str] = ""
    photoUrl: Optional[str] = ""
    location: Optional[str] = ""
    email: Optional[str] = ""
    linkedin: Optional[str] = ""
    phone: Optional[str] = ""
    profile: Optional[str] = ""
    metAt: Optional[List[str]] = []
    details: Optional[dict] = {}
    source_text: Optional[str] = None

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

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    currentCompany: Optional[str] = None
    currentTitle: Optional[str] = None
    functionArea: Optional[str] = None
    photoUrl: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None
    phone: Optional[str] = None
    profile: Optional[str] = None
    metAt: Optional[List[str]] = None
    details: Optional[dict] = None

class DealBase(BaseModel):
    company: str
    pipeline: str = ""
    stage: str = "Initial Contact"
    nextFollowUp: Optional[str] = ""
    tasks: List[TaskCreate] = []
    attachments: List[AttachmentCreate] = []
    details: Optional[dict] = {}
    primary_contact: Optional[ContactCreate] = None
    source_text: Optional[str] = None

    @field_validator('details', mode='before')
    @classmethod
    def details_default(cls, v):
        return v if v is not None else {}

class DealCreate(DealBase):
    pass

class DealResponse(DealBase):
    id: int
    lastContactDate: str
    status: str
    owner: Optional[OwnerBase] = None
    tasks: List[TaskResponse] = []
    attachments: List[AttachmentResponse] = []
    assets: List[AssetResponse] = []
    negotiation_prep: Optional[dict] = {}
    prep_updated_at: Optional[str] = None
    
    # Phase 2: Professional BD Modules
    economics: Optional["DealEconomicsResponse"] = None
    agreements: List["LegalAgreementResponse"] = []
    due_diligence: Optional["DueDiligenceTrackerResponse"] = None

    class Config:
        from_attributes = True

class DealUpdate(BaseModel):
    company: Optional[str] = None
    pipeline: Optional[str] = None
    stage: Optional[str] = None
    nextFollowUp: Optional[str] = None
    owner_id: Optional[int] = None
    details: Optional[dict] = None
    source_text: Optional[str] = None

class IntelligenceBase(BaseModel):
    company_name: str
    focus_areas: List[str] = []
    bd_strategy: str = ""
    patent_cliffs: List[str] = []
    recent_deals: List[dict] = []
    last_updated: str = ""

class IntelligenceResponse(IntelligenceBase):
    id: int
    assets: List[AssetResponse] = []

    class Config:
        from_attributes = True

class AIParsingRequest(BaseModel):
    raw_text: str
    type: str = "deal" # deal, contact, or meeting_note

class DealHistoryBase(BaseModel):
    type: str
    title: str
    date: str
    desc: str
    details: Optional[dict] = {}
    source_text: Optional[str] = None

    @field_validator('details', mode='before')
    @classmethod
    def details_default(cls, v):
        return v if v is not None else {}

class DealHistoryCreate(DealHistoryBase):
    pass

class DealHistoryResponse(DealHistoryBase):
    id: int
    deal_id: int

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
    job_title: Optional[str] = None
    role: str
    initials: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    role: Optional[str] = None
    initials: Optional[str] = None
    is_active: Optional[bool] = None



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
    is_active: bool
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

# Phase 35: Smart Input Archive
class SmartInputArchiveCreate(BaseModel):
    raw_text: str
    source_type: str = "manual"
    entities_summary: dict = {}

class SmartInputArchiveResponse(BaseModel):
    id: int
    user_id: int
    raw_text: str
    source_type: str
    entities_summary: dict
    created_at: str

    class Config:
        from_attributes = True

# Phase 2: Economics, Legal, and DD
class DealEconomicsBase(BaseModel):
    upfront: Optional[str] = "0"
    milestones: Optional[str] = "0"
    royalties: Optional[str] = "0%"
    total_deal_value: Optional[str] = "0"
    pos: Optional[int] = 0
    currency: Optional[str] = "USD"

class DealEconomicsCreate(DealEconomicsBase):
    pass

class DealEconomicsResponse(DealEconomicsBase):
    id: int
    deal_id: int

    class Config:
        from_attributes = True

class LegalAgreementBase(BaseModel):
    agreement_type: str # CDA, NDA, Term Sheet, Definitive Agreement
    status: str         # Drafting, Under Review, Negotiating, Signed, Expired
    effective_date: Optional[str] = None
    expiration_date: Optional[str] = None

class LegalAgreementCreate(LegalAgreementBase):
    pass

class LegalAgreementResponse(LegalAgreementBase):
    id: int
    deal_id: int

    class Config:
        from_attributes = True

class DueDiligenceTrackerBase(BaseModel):
    vdr_link: Optional[str] = None
    status: str = "Not Started"
    key_risks: Optional[List[dict]] = []

class DueDiligenceTrackerCreate(DueDiligenceTrackerBase):
    pass

class DueDiligenceTrackerResponse(DueDiligenceTrackerBase):
    id: int
    deal_id: int

    class Config:
        from_attributes = True

class DealEconomicsUpdate(BaseModel):
    upfront: Optional[str] = None
    milestones: Optional[str] = None
    royalties: Optional[str] = None
    total_deal_value: Optional[str] = None
    pos: Optional[int] = None
    currency: Optional[str] = None

class LegalAgreementUpdate(BaseModel):
    agreement_type: Optional[str] = None
    status: Optional[str] = None
    effective_date: Optional[str] = None
    expiration_date: Optional[str] = None

class DueDiligenceTrackerUpdate(BaseModel):
    vdr_link: Optional[str] = None
    status: Optional[str] = None
    key_risks: Optional[List[dict]] = None

