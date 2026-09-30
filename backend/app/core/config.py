from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # AI Provider API Keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # AI Models
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GROQ_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    MISTRAL_MODEL: str = "mistral-small-latest"
    OPENROUTER_MODEL: str = "qwen/qwen-2.5-vl-72b-instruct:free"

    # Nutrition API Keys
    USDA_API_KEY: str = ""

    # App Config
    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
