from dataclasses import dataclass


@dataclass
class CheckInRequest:
    event_code: str
    phone: str


@dataclass
class CheckinCountResponse:
    this_year_count: int
    this_year_by_organization_count: int
    all_count: int
    all_by_organization_count: int

@dataclass
class CheckinResponse:
    name: str
    count: int
    checkin_count_info: CheckinCountResponse