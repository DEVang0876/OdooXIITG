# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "FastAPI OCR API"

    class Config:
        env_file = ".env"

settings = Settings()