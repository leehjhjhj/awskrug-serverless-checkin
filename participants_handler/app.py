import json
import logging
from container import RegistrationContainer, CheckInContainer
from schema import RegistrationCreateRequest
from common_schema import LambdaResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        response = None
        http_method = event.get('httpMethod')
        resource_path = event.get('resource')  # API Gateway 리소스 경로 (예: /registration)
        request_path = event.get('path')       # 실제 요청 경로 (예: /dev/registration)
        path_parameters = event.get('pathParameters') or {}  # 경로 파라미터들
        query_parameters = event.get('queryStringParameters') or {}  # 쿼리 파라미터들
    
        if event.get('body'):
            request_body: dict = json.loads(event.get('body'))
        else:
            request_body = {}

        if resource_path == '/registration':
            container = RegistrationContainer.get_instance()

            if http_method == 'POST':
                request_body = RegistrationCreateRequest(**request_body)
                response = container.service.create_registration(request_body)
                response = json.dumps(response.model_dump())
            # elif http_method == 'GET':     
            #     response = container.service.get_list_registration()
            #     response = json.dumps(response)
            # elif http_method == 'PUT':
            #     request_body = RegistrationUpdateRequest(**request_body)
            #     response = container.service.update_registration(request_body)
            #     response = json.dumps(response.model_dump())
            # elif http_method == 'DELETE':
            #     request_body = RegistrationDeleteRequest(**request_body)
            #     container.service.delete_registration(request_body)
            else:
                return LambdaResponse(
                    status_code=404,
                    body=json.dumps({"message": "Route not found"})
                ).to_dict()
        elif resource_path == '/checkin':
            container = CheckInContainer.get_instance()

        return LambdaResponse(
            status_code=200,
            body=response
        ).to_dict()
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {e}")
        return LambdaResponse(
            status_code=500,
            body=json.dumps({"message": "An error occurred"})
        ).to_dict()