from service import ApiService
from repository import ApiRepository
from sqlalchemy.orm import Session

import os


class ApiContainer:
    def __init__(self, session: Session):
        self.env = os.environ.get('ENV', 'dev')
        self.session = session
        self.repository = ApiRepository(session)
        self.service = ApiService(session, self.repository)