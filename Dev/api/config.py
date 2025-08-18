from pydantic_settings import BaseSettings, SettingsConfigDict  # ⬅ import needed
from typing import Optional

class Settings(BaseSettings):
    PORT: int = 8000
    BASE_PATH: str = "/CareMap/api"

    # Add this to allow .env file loading and ignore unexpected fields
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow"  # ⬅ this allows unknown env vars (prevents validation error)
    )

settings = Settings()
