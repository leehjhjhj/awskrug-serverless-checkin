

class EventRegistrationException(Exception):
    def __init__(self):
        self.message = "출석 가능 시간이 지났습니다."
        self.status_code = 400
        super().__init__(self.message)

class DefaltEventException(Exception):
    def __init__(self):
        self.message = "QR코드를 통해서 출석해주세요."
        self.status_code = 400
        super().__init__(self.message)