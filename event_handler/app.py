import json
import logging
from dataclasses import asdict
from container import EventContainer
from db_connection import get_session
from schema import EventRequest, EventPutRequest, EventDeleteRequest
from common_schema import LambdaResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        with get_session() as session:
            response = None
            http_method = event.get('httpMethod')
            resource_path = event.get('resource')

            container = EventContainer(session)
            if event.get('body'):
                request_body: dict = json.loads(event.get('body'))
            else:
                request_body = {}

            if http_method == 'POST' and resource_path == '/event':
                request_body = EventRequest(**request_body)
                response = container.service.create_event(request_body)
                response = json.dumps(asdict(response))
            elif http_method == 'GET' and resource_path == '/event':
                response = container.service.get_list_event()
                response = json.dumps([asdict(event) for event in response], default=str)
            elif http_method == 'PUT' and resource_path == '/event':
                request_body = EventPutRequest(**request_body)
                response = container.service.update_event(request_body)
                response = json.dumps(asdict(response), default=str)
            elif http_method == 'DELETE' and resource_path == '/event':
                request_body = EventDeleteRequest(**request_body)
                container.service.delete_event(request_body)
            else:
                return LambdaResponse(
                    status_code=404,
                    body=json.dumps({"message": "Route not found"})
                ).to_dict()

            return LambdaResponse(
                status_code=200,
                body=response
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