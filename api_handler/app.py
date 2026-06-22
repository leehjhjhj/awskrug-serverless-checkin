import json
import logging
from dataclasses import asdict
from container import ApiContainer
from db_connection import get_session
from exception import (
    EventNotFoundException,
    NotFoundException,
    AlreadyCheckedException,
)
from exceptions.domain_exception import(
    EventRegistrationException,
    DefaltEventException
)
from schema import CheckInRequest, CheckinResponse, CheckinCountResponse
from common_schema import LambdaResponse
from hash_tool import hash_phone_number


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')

    if http_method == 'GET' and path == '/checkin/info':
        return handle_checkin_info(event, context)
    else:
        return handle_check_attendance(event, context)


def handle_checkin_info(event, context):
    try:
        with get_session() as session:
            container = ApiContainer(session)
            query_params = event.get('queryStringParameters') or {}
            phone = query_params.get('phone', '')
            slug = query_params.get('slug', '')

            if not phone or not slug:
                return LambdaResponse(
                    status_code=400,
                    body=json.dumps({"message": "phone and organization_code are required"})
                ).to_dict()

            origin_phone_number = phone.replace('-', '')
            hashed_phone = hash_phone_number(origin_phone_number)
            result: CheckinCountResponse = container.service.get_checkin_count_info(hashed_phone, slug)

            return LambdaResponse(
                status_code=200,
                body=json.dumps(asdict(result))
            ).to_dict()

    except Exception as e:
        logger.error(f"Error in handle_checkin_info: {e}")
        return LambdaResponse(
            status_code=500,
            body=json.dumps({"message": "An error occurred"})
        ).to_dict()


def handle_check_attendance(event, context):
    try:
        with get_session() as session:
            container = ApiContainer(session)
            request_body: dict = json.loads(event.get('body', '{}'))
            request = CheckInRequest(**request_body)
            result: CheckinResponse = container.service.check_attendance(request)

            return LambdaResponse(
                status_code=200,
                body=json.dumps(asdict(result))
            ).to_dict()

    except (
            EventNotFoundException,
            NotFoundException,
            AlreadyCheckedException,
            EventRegistrationException,
            DefaltEventException
        ) as e:
        return LambdaResponse(
            status_code=e.status_code,
            body=json.dumps({"message": e.message})
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in handle_check_attendance: {e}")
        return LambdaResponse(
            status_code=500,
            body=json.dumps({"message": "An error occurred"})
        ).to_dict()