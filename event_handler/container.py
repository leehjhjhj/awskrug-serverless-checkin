from service import EventService
from repository import EventRepository
from sqlalchemy.orm import Session

import os


class EventContainer:
    def __init__(self, session: Session):
        self.env = os.environ.get('ENV', 'dev')
        self.session = session
        self.repository = EventRepository(session)
        self.service = EventService(session, self.repository)