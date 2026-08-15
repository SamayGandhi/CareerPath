"""
main.py
-----------------------------------------
FastAPI application entrypoint. Mounts all routers, registers the
global exception handler, and configures CORS to allow requests only
from the Node backend (not the public internet, not the browser
directly — the frontend never talks to this service).
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middleware.error_handler import global_exception_handler
from app.routers import explanation, github, health, portfolio, resume

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

settings = get_settings()

app = FastAPI(
    title="Career Platform AI Enhancement Service",
    description=(
        "Optional, isolated AI enhancement layer. Provides natural-language "
        "explanations and suggestions ON TOP OF already-computed rule-based "
        "results from the main platform. This service holds no business "
        "logic and no database — it is stateless and fully decoupled from "
        "the core application, which remains fully functional if this "
        "service is unavailable."
    ),
    version="1.0.0",
)

# Only the Node backend calls this service — not the browser — so CORS
# is intentionally restrictive. Adjust origins via reverse proxy /
# network policy in production rather than relying on this alone.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # no browser origins — server-to-server only
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, global_exception_handler)

app.include_router(health.router)
app.include_router(explanation.router)
app.include_router(resume.router)
app.include_router(github.router)
app.include_router(portfolio.router)


@app.on_event("startup")
async def on_startup():
    if settings.is_llm_configured:
        logger.info("AI service starting with LLM provider '%s' configured.", settings.llm_provider)
    else:
        logger.warning(
            "AI service starting WITHOUT an LLM API key configured. "
            "All AI endpoints will honestly report unavailability."
        )