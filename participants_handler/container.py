from __future__ import annotations

from dynamodb_model import DynamoDBModel
from model import EventRegistration, EventCheckIn

from typing import Optional
from service import RegistrationService
from repository import RegistrationRepository

import os


class RegistrationContainer:
    _instance: Optional[RegistrationContainer] = None
    
    def __init__(self):
        self.env = os.environ.get('ENV', 'dev')
        self.registration_table = DynamoDBModel[EventRegistration](
            f"{self.env}-event-registration",
            EventRegistration
        )
        self.repository = RegistrationRepository(self.registration_table)
        self.service = RegistrationService(self.repository)

    @classmethod
    def get_instance(cls) -> RegistrationContainer:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
# class CheckInContainer:
#     _instance: Optional[CheckInContainer] = None
    
#     def __init__(self):
#         self.env = os.environ.get('ENV', 'dev')
#         self.checkin_table = DynamoDBModel[EventCheckIn](
#             f"{self.env}-event-checkin",
#             EventCheckIn
#         )
#         self.repository = CheckInRepository(self.checkin_table)
#         self.service = CheckInService(self.repository)

#     @classmethod
#     def get_instance(cls) -> CheckInContainer:
#         if cls._instance is None:
#             cls._instance = cls()
#         return cls._instance