from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class EventDTO:
    """Event 조회용 Response DTO"""
    event_code: str
    event_date_time: datetime
    event_name: str
    code_expired_at: datetime
    event_version: str
    organization_code: str
    description: Optional[str] = None
    qr_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class EventRequest:
    event_date_time: datetime
    code_expired_at: datetime
    description: str
    event_name: str
    event_version: str
    organization_code: str


@dataclass
class EventPutRequest:
    event_code: str
    event_date_time: datetime
    code_expired_at: datetime
    description: str
    event_name: str
    event_version: str
    organization_code: str
    qr_url: Optional[str] = None


@dataclass
class EventDeleteRequest:
    event_code: str


@dataclass
class EventResponse:
    event_code: str
    qr_url: Optional[str] = None


@dataclass
class EventListResponse:
    events: list[EventDTO]