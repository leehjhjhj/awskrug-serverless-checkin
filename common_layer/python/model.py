from pydantic import BaseModel, Field
from datetime import datetime


class Event(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    event_code: str = Field(alias='partition_key')
    event_date_time: datetime
    description: str
    event_name: str
    qr_url: str  # CloudFront URL
    code_expired_at: datetime
    event_version: str

class EventCheckIn(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    phone: str = Field(alias='partition_key')
    event_code: str = Field(alias='sort_key')
    email: str | None = None
    checked_at: datetime
    event_version: str

class EventRegistration(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    event_code: str = Field(alias='partition_key')
    phone: str = Field(alias='sort_key')
    name: str | None = None
    email: str | None = None