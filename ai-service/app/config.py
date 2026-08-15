"""
config.py
-----------------------------------------
Centralized, validated environment configuration using pydantic-settings.
UPDATED (Batch 3 — response quality): llm_request_timeout_seconds
default bumped from 15 to 20, giving comfortable headroom for the rare
case where the quality-retry gate in llm_client.py triggers a second
sequential call for the same request — typical single-call latency on
Gemini Flash is 1-4 seconds, so this remains a safety ceiling, not the
expected response time.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    port: int = 8000

    internal_api_key: str = ""

    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    llm_request_timeout_seconds: int = 20
    llm_max_retries: int = 2

    log_level: str = "info"

    @property
    def is_llm_configured(self) -> bool:
        return bool(self.llm_api_key)

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()