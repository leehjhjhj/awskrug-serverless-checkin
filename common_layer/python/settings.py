import os

from pydantic_settings import BaseSettings
from pydantic import Field
from parameter_store import ParameterStore


env = os.environ.get("ENVIRONMENT", "dev")
parameter_store = ParameterStore()

class Settings(BaseSettings):
    client_url: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/client_url"))
    qr_s3_bucket_name: str = Field(default_factory=lambda: parameter_store.get_parameter(f"/{env}/qr-s3"))

settings = Settings()