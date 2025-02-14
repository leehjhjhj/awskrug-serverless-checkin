import os

from pydantic_settings import BaseSettings
from pydantic import Field
from parameter_store import ParameterStore


env = os.environ.get("ENV", "dev")
parameter_store = ParameterStore()

class Settings(BaseSettings):
    client_url: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/client-url"))
    qr_s3_bucket_name: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/qr-s3"))
    smtp_username: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/smtp-username"))
    smtp_password: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/smtp-password"))

settings = Settings()