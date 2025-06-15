from pydantic import BaseModel
from typing import Optional

from datetime import datetime

from model import Event

class EventRequest(BaseModel):
    event_date_time: datetime
    code_expired_at: datetime
    description: str
    event_name: str
    event_version: str

class EventPutRequest(BaseModel):
    event_code: str
    event_date_time: datetime
    code_expired_at: datetime
    description: str
    event_name: str
    event_version: str
    qr_url: Optional[str] = None

class EventDeleteRequest(BaseModel):
    event_code: str

class EventResponse(BaseModel):
    qr_url: Optional[str] = None
    event_code: str

class EventListResponse(BaseModel):
    events: list[Event]