from dynamodb_model import DynamoDBModel
from model import EventRegistration

from typing import Optional, Union

import pandas as pd
import os


env = os.environ['ENV']

def get_email_from_parts(parts: Union[list, pd.Series, str]) -> Optional[str]:
    if isinstance(parts, list) and len(parts) >= 2:
        return parts[-2]
    return None

def process_csv_data(df: pd.DataFrame) -> pd.DataFrame:
    extra_info = df['(필수작성)  빌딩 출입을 위한 정보 부탁드립니다. (예: 이현제(입금자명)/회사명/hong@gmail.com/010-1234-5678) ※ 이 정보는 이벤트 운영자만 볼 수 있습니다.']
    split_info = extra_info.str.split('/')
    df['phone_number'] = split_info.str[-1]
    df['email'] = split_info.apply(get_email_from_parts)
    result_df = df[['Name', 'email','phone_number']]
    result_df = result_df.dropna(subset=['phone_number'])
    return result_df

def insert_data_to_db(df: pd.DataFrame, event_code: str) -> None:
    table = DynamoDBModel[EventRegistration](
        f'{env}-event-registration',
        EventRegistration
    )
    insert_list: EventRegistration = []
    for info in df.to_dict(orient='records'):
        event_registration = EventRegistration(
            event_code=event_code,
            phone=info['phone_number'].replace('-','').strip(),
            name=info['Name'],
            email=info['email']
        )
        insert_list.append(event_registration)
    table.bulk_insert(insert_list)