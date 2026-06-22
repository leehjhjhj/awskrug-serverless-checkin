import os

class Settings:
    def __init__(self):
        self.client_url = os.environ.get('CLIENT_URL')
        self.qr_s3_bucket_name = os.environ.get('QR_S3_BUCKET_NAME')
        self.smtp_username = os.environ.get('SMTP_USERNAME')
        self.smtp_password = os.environ.get('SMTP_PASSWORD')
        self.salt = os.environ.get('SALT')
        self.cluster_arn = os.environ.get('CLUSTER_ARN')
        self.cluster_endpoint = os.environ.get('CLUSTER_ENDPOINT')
        self.db_user = os.environ.get('DB_USER')
        self.db_name = os.environ.get('DB_NAME')
        self.region = os.environ.get('REGION')


settings = Settings()