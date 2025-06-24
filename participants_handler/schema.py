from pydantic import BaseModel


from model import EventRegistration, EventCheckIn


class RegistrationCreateRequest(BaseModel):
    event_code: str
    phone: str
    name: str
    email: str