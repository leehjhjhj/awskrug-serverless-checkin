from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime

from exceptions.domain_exception import(
    EventRegistrationException,
    DefaltEventException
)


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
    organization_code: str

    def validate_event(self):
        if self.event_code == "test":
            raise DefaltEventException()

        if self.code_expired_at < datetime.now():
            raise EventRegistrationException()

class EventCheckIn(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    phone: str = Field(alias='partition_key')
    event_code: str = Field(alias='sort_key')
    email: str | None = None
    name: str | None = None
    checked_at: datetime
    event_version: str

    @classmethod
    def create(
        cls,
        event: Event,
        event_registration: EventRegistration
    ) -> EventCheckIn:
        return cls(
            phone=event_registration.phone,
            event_code=event_registration.event_code,
            email=event_registration.email,
            name=event_registration.name,
            checked_at=datetime.now(),
            event_version=event.event_version
        )

class EventRegistration(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    event_code: str = Field(alias='partition_key')
    phone: str = Field(alias='sort_key')
    name: str | None = None
    email: str | None = None

class EventOrganization(BaseModel):
    model_config = {
        'populate_by_name': True
    }
    organization_code: str = Field(alias='partition_key')
    organization_name: str
    logo_url: str
    event_version: list[str]