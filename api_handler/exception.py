

class NotFoundException(Exception):
    def __init__(self):
        self.message = "참가 목록에서 확인되지 않습니다. 핸드폰 번호를 다시 확인하세요"
        self.status_code = 404
        super().__init__(self.message)

class AlreadyCheckedException(Exception):
    def __init__(self, count: int):
        self.message = f"이미 출석했습니다. 총 출석 횟수는 {count}회 입니다."
        self.status_code = 400
        super().__init__(self.message)

class EventNotFoundException(Exception):
    def __init__(self):
        self.message = "존재하지 않는 이벤트입니다."
        self.status_code = 400
        super().__init__(self.message)