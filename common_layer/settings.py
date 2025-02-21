import os

from pydantic_settings import BaseSettings
from pydantic import Field
from parameter_store import ParameterStore

env = os.environ.get("ENV", "dev")
parameter_store = ParameterStore()

parameters = {
    'client_url': parameter_store.get_parameter(f"/{env}/client-url"),
    'qr_s3_bucket_name': parameter_store.get_parameter(f"/{env}/qr-s3"),
    'smtp_username': parameter_store.get_parameter(f"/{env}/smtp-username"),
    'smtp_password': parameter_store.get_parameter(f"/{env}/smtp-password")
}

class Settings(BaseSettings):
    client_url: str = Field(default=parameters['client_url'])
    qr_s3_bucket_name: str = Field(default=parameters['qr_s3_bucket_name'])
    smtp_username: str = Field(default=parameters['smtp_username'])
    smtp_password: str = Field(default=parameters['smtp_password'])

settings = Settings()