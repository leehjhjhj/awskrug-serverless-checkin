from model import EventRegistration


class RegistrationRepository:
    def __init__(
        self,
        registration_table,
    ):
        self._registration_table = registration_table
    
    def create_registration(self, registration: EventRegistration) -> EventRegistration:
        return self._registration_table.put(registration)