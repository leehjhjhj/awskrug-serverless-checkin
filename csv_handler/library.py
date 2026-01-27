from model import EventRegistration
from hash_tool import hash_phone_number

from typing import Optional, Union

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

def get_email_from_parts(parts: Union[list, pd.Series, str]) -> Optional[str]:
    if isinstance(parts, list) and len(parts) >= 2:
        return parts[-2]
    return None

def process_csv_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.where(pd.notna(df), None)
    phone_numbers = df['visitor_mobile']
    names = df['visitor_name']

    # Filter out empty or invalid phone numbers
    valid_mask = phone_numbers.notna() & (phone_numbers.str.len() > 0)
    phone_numbers = phone_numbers[valid_mask]

    # Clean phone numbers: strip whitespace and remove hyphens
    phone_numbers = phone_numbers.str.strip()
    phone_numbers = phone_numbers.str.replace('-', '', regex=False)

    df_valid = df.loc[valid_mask].copy()
    df_valid['phone_number'] = phone_numbers.apply(hash_phone_number)
    df_valid['Name'] = names[valid_mask]

    result_df = df_valid[['Name', 'phone_number']]
    return result_df

def insert_data_to_db(df: pd.DataFrame, event_code: str, session: Session) -> None:
    records = [
        {
            'event_code': event_code,
            'phone': info['phone_number'],
            'name': info['Name']
        }
        for info in df.to_dict(orient='records')
    ]

    if records:
        stmt = insert(EventRegistration).values(records)
        stmt = stmt.on_conflict_do_nothing(index_elements=['event_code', 'phone'])
        session.execute(stmt)