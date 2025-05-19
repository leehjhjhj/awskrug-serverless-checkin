import json
import logging
from container import EventContainer
from schema import EventRequest
from common_schema import LambdaResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        container = EventContainer.get_instance()
        request_body: dict = json.loads(event.get('body', '{}'))
        request = EventRequest(**request_body)
        response = container.service.create_event(request)
        return LambdaResponse(
            status_code=200,
            body=json.dumps(response.model_dump())
        ).to_dict()
        
    # except () as e:
    #     return LambdaResponse(
    #         status_code=e.status_code,
    #         body=json.dumps({"message": e.message})
    #     ).to_dict()
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {e}")
        return LambdaResponse(
            status_code=500,
            body=json.dumps({"message": "An error occurred"})
        ).to_dict()