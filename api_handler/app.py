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
from schema import CheckInRequest, CheckinResponse
from common_schema import LambdaResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
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
        logger.error(f"Error in lambda_handler: {e}")
        return LambdaResponse(
            status_code=500,
            body=json.dumps({"message": "An error occurred"})
        ).to_dict()