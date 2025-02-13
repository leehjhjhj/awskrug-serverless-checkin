from model import Event, EventRegistration, EventCheckIn

from datetime import datetime

from schema import CheckInRequest, CheckinResponse
from exception import (
    EventNotFoundException,
    NotFoundException,
    AlreadyCheckedException
)
from repository import ApiRepository


class ApiService:
    def __init__(
        self,
        api_repository
    ):
        self._repo: ApiRepository = api_repository

    def check_attendance(self, request: CheckInRequest) -> CheckinResponse:
        event: Event = self._repo.get_event(request.event_code)
        self._check_event(event)

        target_phone_number: str = request.phone.replace('-', '')
        event_registration: EventRegistration = self._repo.get_event_registration(
            event_code=request.event_code,
            phone=target_phone_number
        )
        if not event_registration:
            raise NotFoundException()

        if self._check_already_checked(request.event_code, target_phone_number):
            raise AlreadyCheckedException()
        
        checkin = EventCheckIn(
            phone=event_registration.phone,
            event_code=event_registration.event_code,
            email=event_registration.email,
            name=event_registration.name,
            checked_at=datetime.now(),
            event_version=event.event_version
        )
        self._repo.insert_event_checkin(checkin)
        
        result = self._make_checkin_response(request.event_code, target_phone_number)
        return result

    def _check_event(self, event: Event) -> bool:
        if not event:
            raise EventNotFoundException()

        event.validate_event()

    def _check_already_checked(self, event_code: str, phone: str) -> bool:
        event_checkin: EventCheckIn = self._repo.get_event_checkin(phone, event_code)
        if not event_checkin:
            return False
        return True

    def _make_checkin_response(self, event_code: str, phone: str) -> CheckinResponse:
        event_checkin: EventCheckIn = self._repo.get_all_event_checkin(phone)
        event_registration: EventRegistration = self._repo.get_event_registration(event_code, phone)
        return CheckinResponse(
            name=event_registration.name,
            count=len(event_checkin)
        )