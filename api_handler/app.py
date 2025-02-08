import json
import logging
from container import ApiContainer
from exception import EventRegistrationException, NotFoundException, AlreadyCheckedException
from schema import CheckInRequest, CheckinResponse
from common_schema import LambdaResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        container = ApiContainer.get_instance()
        request_body: dict = json.loads(event.get('body', '{}'))
        request = CheckInRequest(**request_body)
        result: CheckinResponse = container.service.check_attendance(request)
        
        return LambdaResponse(
            status_code=200,
            body=result.model_dump_json()
        ).to_dict()
        
    except (EventRegistrationException, NotFoundException, AlreadyCheckedException) as e:
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