from pydantic import BaseModel


class CheckInRequest(BaseModel):
    event_code: str
    phone: str


class CheckinResponse(BaseModel):
    name: str
    count: int