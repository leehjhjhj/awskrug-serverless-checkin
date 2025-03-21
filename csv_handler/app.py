import json
import logging
import pandas as pd
import boto3
import io

from library import process_csv_data, insert_data_to_db


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        
        s3_client = boto3.client('s3')
        response = s3_client.get_object(Bucket=bucket, Key=key)
        
        file_content = response['Body'].read()
        excel_data = io.BytesIO(file_content)
        df = pd.read_excel(excel_data)
        
        event_code = key.split('_')[-1].split('.')[0]

        result_df = process_csv_data(df)
        insert_data_to_db(result_df, event_code)
        logger.info(f"Processed {len(result_df)} rows of data")
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Excel file processed successfully",
                "rows_processed": len(result_df)
            })
        }
    except Exception as e:
        logger.error(f"Error in lambda_handler: {e}", exc_info=True)  # 상세 오류 정보 추가
        return {
            "statusCode": 500,
            "body": f"An error occurred: {str(e)}"
        }