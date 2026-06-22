from datetime import datetime
from model import Event, EventCheckIn, EventRegistration, EventOrganization
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional


class ApiRepository:
    def __init__(
        self,
        session: Session
    ):
        self._db: Session = session

    def get_event_registration(self, event_code: str, phone: str) -> Optional[EventRegistration]:
        return self._db.query(EventRegistration).filter_by(
            event_code=event_code,
            phone=phone
        ).first()

    def get_event(self, event_code: str) -> Optional[Event]:
        return self._db.query(Event).filter_by(event_code=event_code).first()

    def insert_event_checkin(self, event_checkin: EventCheckIn) -> None:
        self._db.add(event_checkin)
        self._db.flush()

    def get_event_checkin(self, phone: str, event_code: str) -> Optional[EventCheckIn]:
        return self._db.query(EventCheckIn).filter_by(
            phone=phone,
            event_code=event_code
        ).first()

    def get_all_event_checkin(self, phone: str, organization_code: str, event_version: str) -> list[EventCheckIn]:
        return self._db.query(EventCheckIn).filter_by(
            phone=phone,
            organization_code=organization_code,
            event_version=event_version
        ).all()

    def get_this_year_checkin(self, phone: str) -> int:
        current_year = datetime.now().year
        return self._db.query(func.count(EventCheckIn.event_code)).filter(
            EventCheckIn.phone == phone,
            extract('year', EventCheckIn.checked_at) == current_year
        ).scalar() or 0

    def get_this_year_checkin_by_organization(self, phone: str, organization_code: str) -> int:
        current_year = datetime.now().year
        return self._db.query(func.count(EventCheckIn.event_code)).filter(
            EventCheckIn.phone == phone,
            EventCheckIn.organization_code == organization_code,
            extract('year', EventCheckIn.checked_at) == current_year
        ).scalar() or 0

    def get_all_checkin(self, phone: str) -> int:
        return self._db.query(func.count(EventCheckIn.event_code)).filter(
            EventCheckIn.phone == phone
        ).scalar() or 0

    def get_all_checkin_by_organization(self, phone: str, organization_code: str) -> int:
        return self._db.query(func.count(EventCheckIn.event_code)).filter(
            EventCheckIn.phone == phone,
            EventCheckIn.organization_code == organization_code
        ).scalar() or 0

    def get_organization_by_slug(self, slug: str) -> Optional[EventOrganization]:
        return self._db.query(EventOrganization).filter_by(
            slug=slug
        ).first()