from model import Event, EventCheckIn, EventRegistration
from sqlalchemy.orm import Session
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