from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

# Always resolve .env relative to the project root (3 levels up from this file)
_ENV_PATH = os.path.join(os.path.dirname(__file__), "../../../.env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_PATH, extra="ignore")

    # Anthropic
    anthropic_api_key: str

    # OpenAI
    openai_api_key: str

    # Database
    database_url: str
    redis_url: str = "redis://localhost:6379"

    # Auth
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 15
    jwt_refresh_expire_days: int = 7

    # App
    api_port: int = 3001
    node_env: str = "development"
    embedding_model: str = "text-embedding-3-small"
    llm_model: str = "claude-sonnet-4-6"
    embedding_dimensions: int = 1536
    max_retrieved_chunks: int = 8


@lru_cache
def get_settings() -> Settings:
    return Settings()
