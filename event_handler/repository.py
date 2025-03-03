from model import Event


class EventRepository:
    def __init__(
        self,
        event_table,
    ):
        self._event_table = event_table

    def insert_event(self, event: Event) -> Event:
        return self._event_table.put(event)
    
    def exist_event_code(self, event_code: str) -> bool:
        return bool(self._event_table.get(event_code))