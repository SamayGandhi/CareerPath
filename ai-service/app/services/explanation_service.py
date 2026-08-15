"""
explanation_service.py
-----------------------------------------
Business logic for the two explanation endpoints (skill gap,
recommendation).
UPDATED (Batch 3 — response quality): max_tokens raised from 250 to
500 (room for 4-6 full sentences without truncation), and min_words
floor added so the quality-retry gate in llm_client.py can detect and
correct suspiciously short responses.
"""

from app.schemas.explanation_schemas import (
    ExplanationResponse,
    RecommendationExplanationRequest,
    SkillGapExplanationRequest,
)
from app.services.llm_client import generate_completion
from app.services.prompt_templates import (
    RECOMMENDATION_EXPLANATION_SYSTEM_PROMPT,
    SKILL_GAP_EXPLANATION_SYSTEM_PROMPT,
    build_recommendation_user_prompt,
    build_skill_gap_user_prompt,
)


def explain_skill_gap(payload: SkillGapExplanationRequest) -> ExplanationResponse:
    user_prompt = build_skill_gap_user_prompt(
        career_path_title=payload.careerPathTitle,
        readiness_score=payload.readinessScore,
        gaps=[g.model_dump() for g in payload.gaps],
    )

    result = generate_completion(
        system_prompt=SKILL_GAP_EXPLANATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=500,
        min_words=40,
    )

    if not result.success:
        return ExplanationResponse(success=False, reason=result.error_reason)

    return ExplanationResponse(success=True, explanation=result.text)


def explain_recommendation(payload: RecommendationExplanationRequest) -> ExplanationResponse:
    user_prompt = build_recommendation_user_prompt(
        strategy_label=payload.strategyLabel,
        courses=[c.model_dump() for c in payload.courses],
    )

    result = generate_completion(
        system_prompt=RECOMMENDATION_EXPLANATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=500,
        min_words=40,
    )

    if not result.success:
        return ExplanationResponse(success=False, reason=result.error_reason)

    return ExplanationResponse(success=True, explanation=result.text)