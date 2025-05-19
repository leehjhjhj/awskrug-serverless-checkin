from model import Event, EventCheckIn, EventRegistration


class ApiRepository:
    def __init__(
        self,
        event_table,
        event_checkin_table,
        event_registration_table
    ):
        self._event_table = event_table
        self._event_checkin_table = event_checkin_table
        self._event_registration_table = event_registration_table

    def get_event_registration(self, event_code: str, phone: str) -> EventRegistration:
        return self._event_registration_table.get(event_code, phone)
    
    def get_event(self, event_code: str) -> Event:
        return self._event_table.get(event_code)

    def insert_event_checkin(self, event_checkin: EventCheckIn) -> None:
        self._event_checkin_table.put(event_checkin)

    def get_event_checkin(self, phone: str, event_code: str) -> EventCheckIn:
        return self._event_checkin_table.get(phone, event_code)

    def get_all_event_checkin(self, phone: str, event_version: str) -> list[EventCheckIn]:
        event_checkins = self._event_checkin_table.query(
            partition_key=phone,
            filter_expression={
                'event_version': {
                    'operator': 'eq',
                    'value': event_version
                }
            }
        )
        return event_checkins