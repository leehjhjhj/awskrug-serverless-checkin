

class EventRegistrationException(Exception):
    def __init__(self):
        self.message = "출석 가능 시간이 지났습니다."
        self.status_code = 400
        super().__init__(self.message)

class NotFoundException(Exception):
    def __init__(self):
        self.message = "참가 목록에서 확인되지 않습니다. 핸드폰 번호를 다시 확인하세요"
        self.status_code = 404
        super().__init__(self.message)

class AlreadyCheckedException(Exception):
    def __init__(self):
        self.message = "이미 출석했습니다."
        self.status_code = 400
        super().__init__(self.message)

class DefaltEventException(Exception):
    def __init__(self):
        self.message = "QR코드를 통해서 출석해주세요."
        self.status_code = 400
        super().__init__(self.message)