from dataclasses import dataclass


@dataclass
class CheckInRequest:
    event_code: str
    phone: str


@dataclass
class CheckinResponse:
    name: str
    count: int