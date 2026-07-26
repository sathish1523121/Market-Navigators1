"""
config.py
Central place for environment configuration. Every other module reads
settings from here instead of touching os.environ directly, so swapping
providers (e.g. a different DB, a different LLM) only means editing this
file.
"""
import os
from functools import lru_cache
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env into os.environ before Settings is instantiated
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=env_path, extra="ignore")

    # --- App ---
    APP_NAME: str = "Immune Support Market Insights"
    ENV: str = "development"

    # --- Redis / Celery ---
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # --- Supabase (source of truth DB) ---
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # --- External data sources ---
    OPENFOODFACTS_BASE_URL: str = "https://world.openfoodfacts.org"
    OPENFOODFACTS_USER_AGENT: str = "ImmuneMarketInsights/1.0 (contact: you@example.com)"

    USDA_FDC_BASE_URL: str = "https://api.nal.usda.gov/fdc/v1"
    USDA_FDC_API_KEY: str = "DEMO_KEY"

    # --- LLM (used by orchestrator for intent classification + claims agent) ---
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    LLM_PROVIDER: str = "gemini"  # openai | anthropic | gemini

    # --- Auth (placeholder - wire up a real provider later) ---
    AUTH_ENABLED: bool = False
    JWT_SECRET: str = "dev-secret-change-me"

    # --- CORS ---
    CORS_ORIGINS: list[str] | str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                try:
                    return json.loads(v_stripped)
                except json.JSONDecodeError:
                    pass
            return [x.strip() for x in v.split(",") if x.strip()]
        return v


def get_settings() -> Settings:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    load_dotenv(dotenv_path=env_path, override=True)
    return Settings(
        SUPABASE_URL=os.getenv("SUPABASE_URL", ""),
        SUPABASE_SERVICE_KEY=os.getenv("SUPABASE_SERVICE_KEY", ""),
        OPENAI_API_KEY=os.getenv("OPENAI_API_KEY", ""),
        ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY", ""),
        GEMINI_API_KEY=os.getenv("GEMINI_API_KEY", ""),
        GEMINI_MODEL=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        LLM_PROVIDER=os.getenv("LLM_PROVIDER", "gemini"),
    )
