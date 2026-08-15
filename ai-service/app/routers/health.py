"""
health.py
-----------------------------------------
Public, unauthenticated health-check endpoint. Deliberately excludes
the internal-API-key dependency so the Node backend's circuit breaker
(and any external uptime monitor) can check liveness without needing
credentials. Reports LLM configuration status so operators can see at
a glance whether AI features are actually enabled, without exposing
the key itself.
"""

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "up",
        "llmConfigured": settings.is_llm_configured,
        "provider": settings.llm_provider if settings.is_llm_configured else None,
    }