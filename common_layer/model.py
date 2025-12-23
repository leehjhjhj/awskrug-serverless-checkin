"""
SQLAlchemy models for AWS DSQL (PostgreSQL)
Maintains backward compatibility with DynamoDB Pydantic models in model.py
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Text, DateTime, PrimaryKeyConstraint, Index
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

from exceptions.domain_exception import (
    EventRegistrationException,
    DefaltEventException
)

Base = declarative_base()


class EventOrganization(Base):
    """
    Organization information table
    Stores organization details and supported event versions
    """
    __tablename__ = 'event_organization'

    organization_code = Column(String(100), primary_key=True)
    organization_name = Column(String(255), nullable=False)
    logo_url = Column(Text, nullable=False)
    event_version = Column(Text, nullable=False)  # Comma-separated list (e.g., "v1,v2,v3")
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Index
    __table_args__ = (
        Index('idx_organization_name', 'organization_name'),
    )

    @property
    def event_version_list(self) -> list[str]:
        """Convert comma-separated string to list"""
        if not self.event_version:
            return []
        return [v.strip() for v in self.event_version.split(',')]

    def set_event_version_list(self, value: list[str]):
        """Convert list to comma-separated string"""
        self.event_version = ','.join(value) if value else ''

    @classmethod
    def create(
        cls,
        organization_code: str,
        organization_name: str,
        logo_url: str,
        event_version: list[str]
    ) -> EventOrganization:
        org = cls(
            organization_code=organization_code,
            organization_name=organization_name,
            logo_url=logo_url
        )
        org.set_event_version_list(event_version)
        return org

    def __repr__(self):
        return f"<EventOrganization(organization_code={self.organization_code}, organization_name={self.organization_name})>"


class Event(Base):
    """
    Event information table
    Stores event details including schedule, QR code, and organization
    """
    __tablename__ = 'event'

    event_code = Column(String(100), primary_key=True)
    event_date_time = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    event_name = Column(String(255), nullable=False)
    qr_url = Column(Text, nullable=True)  # CloudFront URL
    code_expired_at = Column(DateTime, nullable=False)
    event_version = Column(String(50), nullable=False)
    organization_code = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Indexes
    __table_args__ = (
        Index('idx_event_date_time', 'event_date_time'),
        Index('idx_event_organization_code', 'organization_code'),
        Index('idx_event_code_expired_at', 'code_expired_at'),
    )


    @classmethod
    def create(
        cls,
        event_code: str,
        event_date_time: datetime,
        event_name: str,
        code_expired_at: datetime,
        event_version: str,
        organization_code: str,
        description: Optional[str] = None,
        qr_url: Optional[str] = None
    ) -> Event:
        return cls(
            event_code=event_code,
            event_date_time=event_date_time,
            description=description,
            event_name=event_name,
            qr_url=qr_url,
            code_expired_at=code_expired_at,
            event_version=event_version,
            organization_code=organization_code
        )

    def validate_event(self) -> None:
        if self.event_code == "test":
            raise DefaltEventException()

        if self.code_expired_at < datetime.now():
            raise EventRegistrationException()

    def __repr__(self):
        return f"<Event(event_code={self.event_code}, event_name={self.event_name})>"


class EventRegistration(Base):
    """
    Event registration table
    Stores registration information for events
    """
    __tablename__ = 'event_registration'

    event_code = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Composite primary key
    __table_args__ = (
        PrimaryKeyConstraint('event_code', 'phone'),
        Index('idx_registration_phone', 'phone'),
    )

    @classmethod
    def create(
        cls,
        event_code: str,
        phone: str,
        name: Optional[str] = None
    ) -> EventRegistration:
        return cls(
            event_code=event_code,
            phone=phone,
            name=name
        )

    def __repr__(self):
        return f"<EventRegistration(event_code={self.event_code}, phone={self.phone})>"


class EventCheckIn(Base):
    """
    Event check-in table
    Stores check-in records with denormalized organization_code for statistics
    """
    __tablename__ = 'event_check_in'

    phone = Column(String(20), nullable=False)
    event_code = Column(String(100), nullable=False)
    name = Column(String(255), nullable=True)
    checked_at = Column(DateTime, nullable=False)
    event_version = Column(String(50), nullable=False)
    organization_code = Column(String(100), nullable=False)  # Denormalized for statistics

    # Composite primary key
    __table_args__ = (
        PrimaryKeyConstraint('phone', 'event_code'),
        Index('idx_checkin_event_code', 'event_code'),
        Index('idx_checkin_checked_at', 'checked_at'),
        Index('idx_checkin_organization_code', 'organization_code'),
        Index('idx_checkin_org_version', 'organization_code', 'event_version'),
    )


    @classmethod
    def create(
        cls,
        event: Event,
        event_registration: EventRegistration
    ) -> EventCheckIn:
        return cls(
            phone=event_registration.phone,
            event_code=event_registration.event_code,
            name=event_registration.name,
            checked_at=datetime.now(),
            event_version=event.event_version,
            organization_code=event.organization_code  # Denormalized
        )

    def __repr__(self):
        return f"<EventCheckIn(phone={self.phone}, event_code={self.event_code}, checked_at={self.checked_at})>"
