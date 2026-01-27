from model import Event
from settings import settings

import random
import string
from datetime import datetime
from dataclasses import asdict

from schema import EventRequest, EventResponse, EventPutRequest, EventDeleteRequest, EventDTO

from repository import EventRepository
from sqlalchemy.orm import Session

from io import BytesIO
from PIL import Image
import qrcode
import boto3


class EventService:
    def __init__(
        self,
        session: Session,
        event_repository
    ):
        self._db: Session = session
        self._repo: EventRepository = event_repository

    def create_event(self, request: EventRequest) -> EventResponse:
        event_code = self._make_event_code(request.event_date_time)
        qr_url: str = self._create_qr_code_png(event_code)
        event: Event = Event.create(
            event_code=event_code,
            event_name=request.event_name,
            event_date_time=request.event_date_time,
            code_expired_at=request.code_expired_at,
            event_version=request.event_version,
            organization_code=request.organization_code,
            description=request.description,
            qr_url=qr_url
        )
        self._repo.insert_event(event)
        self._db.commit()
        return EventResponse(
            qr_url=qr_url,
            event_code=event_code
        )
    
    def get_list_event(self) -> list[EventDTO]:
        events = self._repo.get_list_event()
        return [
            EventDTO(
                event_code=event.event_code,
                event_date_time=event.event_date_time,
                description=event.description,
                event_name=event.event_name,
                qr_url=event.qr_url,
                code_expired_at=event.code_expired_at,
                event_version=event.event_version,
                organization_code=event.organization_code,
                created_at=event.created_at,
                updated_at=event.updated_at
            )
            for event in events
        ]
    
    def update_event(self, request: EventPutRequest) -> EventDTO:
        request_data = asdict(request)
        request_data.pop('event_code')
        new_event = self._repo.update_event(request.event_code, request_data)
        if not new_event:
            raise ValueError(f"Event with code {request.event_code} not found")
        self._db.commit()
        return EventDTO(
            event_code=new_event.event_code,
            event_date_time=new_event.event_date_time,
            description=new_event.description,
            event_name=new_event.event_name,
            qr_url=new_event.qr_url,
            code_expired_at=new_event.code_expired_at,
            event_version=new_event.event_version,
            organization_code=new_event.organization_code,
            created_at=new_event.created_at,
            updated_at=new_event.updated_at
        )
    
    def delete_event(self, request: EventDeleteRequest) -> None:
        self._repo.delete_event(request.event_code)
        self._db.commit()

    def _create_qr_code_png(self, event_code: str) -> str:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(f"{settings.client_url}/?c={event_code}")
        qr.make(fit=True)

        qr_image = qr.make_image(fill_color="black", back_color="white").convert('RGBA')
        
        logo = Image.open("logo.png")
        
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        logo_size = qr_image.size[0] // 4
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

        pos = ((qr_image.size[0] - logo.size[0]) // 2,
               (qr_image.size[1] - logo.size[1]) // 2)

        new_qr = Image.new('RGBA', qr_image.size, (255, 255, 255, 0))
        new_qr.paste(qr_image, (0, 0))
        new_qr.paste(logo, pos, logo)
        
        img_byte_arr = BytesIO()
        new_qr.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        s3_client = boto3.client('s3')
        bucket_name = settings.qr_s3_bucket_name
        file_name = f'{event_code}.png'
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=img_byte_arr,
            ContentType='image/png'
        )
        return f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
    
    def _make_event_code(self, event_date_time: datetime) -> str:
        MAX_TRY: int = 5
        count: int = 0
        while count < MAX_TRY:
            date_str = event_date_time.strftime("%m%d")
            random_chars = ''.join(random.choices(string.ascii_uppercase, k=3))
            event_code = f"{date_str}{random_chars}"
            if not self._repo.exist_event_code(event_code):
                return event_code
            count += 1
        raise ValueError("Failed to generate unique event code after maximum attempts")