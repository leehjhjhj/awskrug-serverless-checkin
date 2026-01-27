from model import Event

from sqlalchemy.orm import Session
from typing import Optional


class EventRepository:
    def __init__(
        self,
        session: Session
    ):
        self._db: Session = session

    def insert_event(self, event: Event) -> Event:
        self._db.add(event)
        self._db.flush()
        return event

    def get_list_event(self) -> list[Event]:
        return self._db.query(Event).all()

    def get_event(self, event_code: str) -> Optional[Event]:
        return self._db.query(Event).filter_by(event_code=event_code).first()

    def exist_event_code(self, event_code: str) -> bool:
        return self._db.query(Event).filter_by(event_code=event_code).first() is not None

    def update_event(self, event_code: str, request_data: dict) -> Optional[Event]:
        event = self._db.query(Event).filter_by(event_code=event_code).first()
        if event:
            for key, value in request_data.items():
                if hasattr(event, key):
                    setattr(event, key, value)
            self._db.flush()
        return event

    def delete_event(self, event_code: str) -> Optional[Event]:
        event = self._db.query(Event).filter_by(event_code=event_code).first()
        if event:
            self._db.delete(event)
            self._db.flush()
        return event
    