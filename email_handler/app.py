import json
import yagmail
import os
from settings import settings

from model import Event
from dynamodb_model import DynamoDBModel

from library import make_html_body


env = os.environ['ENV']

def get_event_name(event_code: str) -> str:
    event_table = DynamoDBModel[Event](
        f"{env}-event",
        Event
    )
    event = event_table.get(event_code)
    return event.event_name

def lambda_handler(event, context):
    try:
        yag = yagmail.SMTP(settings.smtp_username, settings.smtp_password)

        for record in event['Records']:
            if record['eventName'] != 'INSERT':
                continue

            new_image = record['dynamodb']['NewImage']
            recipient_email = new_image.get('email', {}).get('S')
            name = new_image.get('name', {}).get('S')
            event_code = new_image.get('event_code', {}).get('S')
            event_name = get_event_name(event_code)

            hello_text = f"안녕하세요 {name}님!<br>" if event_name else ""

            if not recipient_email:
                continue
                
            subject = "소모임 출석이 완료되었어요!"
            body_html = make_html_body(event_name, hello_text)
            
            yag.send(
                to=recipient_email,
                subject=subject,
                contents=body_html
            )
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }