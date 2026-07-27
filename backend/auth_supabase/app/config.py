import os
from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env file automatically
env_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_file_path, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App Config
    APP_NAME: str = "FastAPI Supabase Auth Service"
    ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    # Supabase Config
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
