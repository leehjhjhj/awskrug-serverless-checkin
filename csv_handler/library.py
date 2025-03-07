from dynamodb_model import DynamoDBModel
from model import EventRegistration
from hash_tool import hash_phone_number

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
    phone_numbers = split_info.str[-1]
    names = split_info.str[0]
    
    valid_mask = phone_numbers.notna() & (phone_numbers.str.len() > 0)
    phone_numbers = phone_numbers[valid_mask]
    names = names[valid_mask]
    
    phone_numbers = phone_numbers.str.strip()
    phone_numbers = phone_numbers.str.replace('-', '', regex=False)
    
    df_valid = df.loc[valid_mask].copy()
    df_valid['phone_number'] = phone_numbers.apply(hash_phone_number)

    has_numbers = names.str.contains('\d', regex=True, na=False)
    df_valid.loc[has_numbers, 'Name'] = df.loc[valid_mask, 'Name'][has_numbers]
    df_valid.loc[~has_numbers, 'Name'] = names[~has_numbers].str.strip()
    
    df_valid['email'] = split_info[valid_mask].apply(get_email_from_parts)
    
    result_df = df_valid[['Name', 'email', 'phone_number']]
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
            phone=info['phone_number'],
            name=info['Name'],
            email=info['email']
        )
        insert_list.append(event_registration)
    table.bulk_insert(insert_list)