"""
portfolio_service.py
-----------------------------------------
Business logic for the portfolio feedback endpoint.
UPDATED (Batch 3 — response quality): max_tokens raised from 300 to
550, min_words floor added.
"""

from app.schemas.portfolio_schemas import PortfolioFeedbackRequest, PortfolioFeedbackResponse
from app.services.llm_client import generate_completion
from app.services.prompt_templates import (
    PORTFOLIO_FEEDBACK_SYSTEM_PROMPT,
    build_portfolio_feedback_user_prompt,
)


def generate_portfolio_feedback(payload: PortfolioFeedbackRequest) -> PortfolioFeedbackResponse:
    user_prompt = build_portfolio_feedback_user_prompt(
        detected_sections=payload.detectedSections.model_dump(),
        project_count=payload.projectCount,
        tech_stack=payload.techStackDetected,
    )

    result = generate_completion(
        system_prompt=PORTFOLIO_FEEDBACK_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=550,
        min_words=40,
    )

    if not result.success:
        return PortfolioFeedbackResponse(success=False, reason=result.error_reason)

    return PortfolioFeedbackResponse(success=True, feedback=result.text)