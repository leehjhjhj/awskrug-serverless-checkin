from __future__ import annotations

from dynamodb_model import DynamoDBModel
from model import Event, EventRegistration, EventCheckIn

from typing import Optional
from service import ApiService
from repository import ApiRepository

import os


class ApiContainer:
    _instance: Optional[ApiContainer] = None
    
    def __init__(self):
        self.env = os.environ.get('ENV', 'dev')
        self.event_checkin_table = DynamoDBModel[EventCheckIn](
            f"{self.env}-event-checkin",
            EventCheckIn
        )
        self.event_registration_table = DynamoDBModel[EventRegistration](
            f"{self.env}-event-registration",
            EventRegistration
        )
        self.event_table = DynamoDBModel[Event](
            f"{self.env}-event",
            Event
        )
        self.repository = ApiRepository(self.event_table, self.event_checkin_table, self.event_registration_table)
        self.service = ApiService(self.repository)

    @classmethod
    def get_instance(cls) -> ApiContainer:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance