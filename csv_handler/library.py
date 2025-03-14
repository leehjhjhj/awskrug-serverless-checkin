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
    phone_numbers = df['visitor_mobile']
    names = df['visitor_name']
    emails = df['visitor_email']
    
    valid_mask = phone_numbers.notna() & (phone_numbers.str.len() > 0)
    phone_numbers = phone_numbers[valid_mask]
    
    phone_numbers = phone_numbers.str.strip()
    phone_numbers = phone_numbers.str.replace('-', '', regex=False)
    
    df_valid = df.loc[valid_mask].copy()
    df_valid['phone_number'] = phone_numbers.apply(hash_phone_number)
    df_valid['Name'] = names[valid_mask]
    df_valid['email'] = emails[valid_mask]
    
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