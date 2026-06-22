from model import Event, EventRegistration, EventCheckIn
from hash_tool import hash_phone_number

from schema import CheckInRequest, CheckinResponse, CheckinCountResponse
from exception import (
    EventNotFoundException,
    NotFoundException,
    AlreadyCheckedException
)
from repository import ApiRepository

from sqlalchemy.orm import Session

class ApiService:
    def __init__(
        self,
        session: Session,
        api_repository: ApiRepository
    ):
        self._db: Session = session
        self._repo: ApiRepository = api_repository

    def check_attendance(self, request: CheckInRequest) -> CheckinResponse:
        event: Event = self._repo.get_event(request.event_code)
        self._check_event(event)

        origin_phone_number: str = request.phone.replace('-', '')
        target_phone_number = hash_phone_number(origin_phone_number)
        event_registration: EventRegistration = self._repo.get_event_registration(
            event_code=request.event_code,
            phone=target_phone_number
        )
        if not event_registration:
            raise NotFoundException()

        self._check_already_checked(request.event_code, event.organization_code, event.event_version, target_phone_number)

        checkin: EventCheckIn = EventCheckIn.create(event, event_registration)
        self._repo.insert_event_checkin(checkin)
        self._db.commit()
        
        result = self._make_checkin_response(request.event_code, event.organization_code, event.event_version, target_phone_number)
        return result

    def get_checkin_count_info(self, phone: str, slug: str) -> CheckinCountResponse:
        organization = self._repo.get_organization_by_slug(slug)
        return self._get_checkin_count(phone, organization.organization_code)

    def _get_checkin_count(self, phone: str, organization_code: str) -> CheckinCountResponse:
        this_year_checkin = self._repo.get_this_year_checkin(phone)
        this_year_checkin_by_organization = self._repo.get_this_year_checkin_by_organization(phone, organization_code)
        all_checkin = self._repo.get_all_checkin(phone)
        all_checkin_by_organization = self._repo.get_all_checkin_by_organization(phone, organization_code)

        return CheckinCountResponse(
            this_year_count=this_year_checkin,
            this_year_by_organization_count=this_year_checkin_by_organization,
            all_count=all_checkin,
            all_by_organization_count=all_checkin_by_organization
        )

    def _check_event(self, event: Event) -> None:
        if not event:
            raise EventNotFoundException()

        event.validate_event()

    def _check_already_checked(self, event_code: str, organization_code: str, event_version: str, phone: str) -> None:
        existing_checkin = self._repo.get_event_checkin(phone, event_code)
        if existing_checkin:
            all_checkins = self._repo.get_all_event_checkin(phone, organization_code, event_version)
            raise AlreadyCheckedException(len(all_checkins))

    def _make_checkin_response(self, event_code: str, organization_code: str, event_version: str, phone: str) -> CheckinResponse:
        all_checkins = self._repo.get_all_event_checkin(phone, organization_code, event_version)
        checkin_count_info = self._get_checkin_count(phone, organization_code)
        event_registration = self._repo.get_event_registration(event_code, phone)

        if not event_registration:
            raise NotFoundException()
        return CheckinResponse(
            name=event_registration.name,
            count=len(all_checkins),
            checkin_count_info=checkin_count_info
        )