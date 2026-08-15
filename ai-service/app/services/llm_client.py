"""
llm_client.py
-----------------------------------------
Provider-agnostic LLM call wrapper. This is the ONLY file in the
service that imports the OpenAI SDK directly — every other service
module calls `generate_completion()` here, so swapping providers later
(or adding a second provider) touches one file, not every feature.

Resilience built in at this layer:
- Returns a structured (success, text, error_reason) tuple, NEVER
  raises, so callers can always produce a graceful response.
- Retries transient errors (timeouts, rate limits) via tenacity, with
  a bounded retry count from config.
- Honors LLM_REQUEST_TIMEOUT_SECONDS strictly — a hung LLM call must
  never hang this service indefinitely, which would eventually hang
  the Node gateway's own timeout budget too.
"""

import logging
from dataclasses import dataclass
from typing import Optional

from openai import APIError, APITimeoutError, OpenAI, RateLimitError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.config import get_settings

logger = logging.getLogger("ai-service")


@dataclass
class LlmResult:
    success: bool
    text: Optional[str] = None
    error_reason: Optional[str] = None


def _build_client() -> OpenAI:
    settings = get_settings()
    return OpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        timeout=settings.llm_request_timeout_seconds,
    )


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
    retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
)
def _call_with_retry(
    client: OpenAI,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int,
):
    logger.info("max_tokens = %s", max_tokens)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.4,
    )

    choice = response.choices[0]

    text = (choice.message.content or "").strip()
    finish_reason = getattr(choice, "finish_reason", None)

    logger.info("Gemini finish_reason = %s", finish_reason)
    logger.info("Gemini raw response = %s", text)

    return text


def generate_completion(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 400,
    min_words: int = 0,  # Compatibility only (currently unused)
) -> LlmResult:
    """
    Single entry point for every AI text-generation need in this
    service. Never raises — always returns an LlmResult the caller can
    branch on cleanly.
    """
    settings = get_settings()

    if not settings.is_llm_configured:
        return LlmResult(success=False, error_reason="llm_not_configured")

    try:
        client = _build_client()
        text = _call_with_retry(
            client=client,
            model=settings.llm_model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens,
        )

        if not text:
            return LlmResult(success=False, error_reason="empty_response")

        return LlmResult(success=True, text=text)

    except APITimeoutError:
        logger.warning("LLM call timed out")
        return LlmResult(success=False, error_reason="timeout")
    except RateLimitError:
        logger.warning("LLM call rate limited")
        return LlmResult(success=False, error_reason="rate_limited")
    except APIError as e:
        logger.warning("LLM API error: %s", str(e))
        return LlmResult(success=False, error_reason="provider_error")
    except Exception as e:  # noqa: BLE001 - final safety net, must never propagate
        logger.error("Unexpected LLM client error: %s", str(e), exc_info=True)
        return LlmResult(success=False, error_reason="unexpected_error")