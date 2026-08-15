"""
error_handler.py
-----------------------------------------
Global exception handler converting any unhandled exception into a
clean, consistent JSON error response instead of an opaque 500 with a
stack trace leaking to the caller (the Node backend). This is a second
layer of safety on top of the Node gateway's own try/catch — even if
something here goes unexpectedly wrong, the Node backend always
receives valid, parseable JSON it can gracefully handle.
"""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("ai-service")


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "reason": "internal_error",
            "message": "The AI service encountered an unexpected error.",
        },
    )