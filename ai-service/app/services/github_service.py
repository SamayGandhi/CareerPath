"""
github_service.py
-----------------------------------------
Business logic for the GitHub summary endpoint.
UPDATED (Batch 3 — response quality): max_tokens raised from 300 to
550, min_words floor added.
"""

from app.schemas.github_schemas import GithubSummaryRequest, GithubSummaryResponse
from app.services.llm_client import generate_completion
from app.services.prompt_templates import (
    GITHUB_SUMMARY_SYSTEM_PROMPT,
    build_github_summary_user_prompt,
)


def generate_github_summary(payload: GithubSummaryRequest) -> GithubSummaryResponse:
    user_prompt = build_github_summary_user_prompt(
        languages=[l.model_dump() for l in payload.languages],
        quality_signals={
            "originalRepoCount": payload.originalRepoCount,
            "totalStars": payload.totalStars,
            "qualitySignals": [s.model_dump() for s in payload.qualitySignals],
        },
    )

    result = generate_completion(
        system_prompt=GITHUB_SUMMARY_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=550,
        min_words=40,
    )

    if not result.success:
        return GithubSummaryResponse(success=False, reason=result.error_reason)

    return GithubSummaryResponse(success=True, summary=result.text)