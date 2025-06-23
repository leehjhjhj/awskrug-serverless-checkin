from model import Event


class EventRepository:
    def __init__(
        self,
        event_table,
    ):
        self._event_table = event_table

    def insert_event(self, event: Event) -> Event:
        return self._event_table.put(event)
    
    def get_list_event(self) -> list[Event]:
        return self._event_table.table.scan()
    
    def get_event(self, event_code: str) -> Event:
        return self._event_table.get(event_code)
    
    def exist_event_code(self, event_code: str) -> bool:
        return bool(self._event_table.get(event_code))
    
    def update_event(self, event_code: str, request_data: dict) -> Event:
        return self._event_table.update(partition_key=event_code, update_data=request_data)
    
    def delete_event(self, event_code: str) -> Event:
        return self._event_table.delete(event_code)
    