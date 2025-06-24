from hash_tool import hash_phone_number
from model import EventRegistration
from settings import settings

import random
import string
from datetime import datetime

from schema import RegistrationCreateRequest
from repository import RegistrationRepository


class RegistrationService:
    def __init__(
        self,
        registration_repository
    ):
        self._repo: RegistrationRepository = registration_repository

    def create_registration(self, request: RegistrationCreateRequest) -> EventRegistration:
        unhashed_phone: str = request.phone
        unhashed_phone = self._clean_phone_number(unhashed_phone)
        hashed_phone: str = hash_phone_number(unhashed_phone)
        event_registration: EventRegistration = EventRegistration(
            event_code=request.event_code,
            phone_number=hashed_phone,
            name=request.name,
            email=request.email
        )
        return self._repo.create_registration(event_registration)

    def _clean_phone_number(self, phone: str) -> str:
        phone.strip()
        phone = phone.replace('-', '', regex=False)
        return phone