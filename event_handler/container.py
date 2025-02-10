from __future__ import annotations

from dynamodb_model import DynamoDBModel
from model import Event

from typing import Optional
from service import EventService
from repository import EventRepository

import os


class EventContainer:
    _instance: Optional[EventContainer] = None
    
    def __init__(self):
        self.env = os.environ.get('ENV', 'dev')
        self.event_table = DynamoDBModel[Event](
            f"{self.env}-event",
            Event
        )
        self.repository = EventRepository(self.event_table)
        self.service = EventService(self.repository)

    @classmethod
    def get_instance(cls) -> EventContainer:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance