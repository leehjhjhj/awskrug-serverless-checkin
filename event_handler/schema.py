from pydantic import BaseModel

from datetime import datetime


class EventRequest(BaseModel):
    event_date_time: datetime
    code_expired_at: datetime
    description: str
    event_name: str
    event_version: str

class EventResponse(BaseModel):
    qr_url: str
    event_code: str