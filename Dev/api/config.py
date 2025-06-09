# api/config.py
from pydantic_settings import BaseSettings  # requires `pip install pydantic-settings`

class Settings(BaseSettings):
    PORT: int = 8000
    BASE_PATH: str = "/CareMap/api"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
