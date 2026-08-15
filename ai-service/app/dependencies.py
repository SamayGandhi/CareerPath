"""
dependencies.py
-----------------------------------------
FastAPI dependency enforcing internal-only access via a shared secret
header (X-Internal-Api-Key). This service is never meant to be
publicly reachable — it should sit behind a private network boundary
or at minimum this header check — since it has no per-user auth model
of its own and trusts the Node backend to have already authenticated
the end user.
"""

from fastapi import Header, HTTPException, status

from app.config import get_settings


async def verify_internal_api_key(x_internal_api_key: str = Header(default="")) -> None:
    settings = get_settings()

    if not settings.internal_api_key:
        # Defensive: if the operator never configured a shared secret,
        # refuse all requests rather than silently running open.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured with an internal API key.",
        )

    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key.",
        )