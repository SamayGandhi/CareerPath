"""
explanation.py
-----------------------------------------
Routes for AI-generated natural-language explanations of already-
computed rule-based results (Skill Gap, Recommendation). Guarded by
the internal API key dependency — never publicly reachable.
"""

from fastapi import APIRouter, Depends

from app.dependencies import verify_internal_api_key
from app.schemas.explanation_schemas import (
    ExplanationResponse,
    RecommendationExplanationRequest,
    SkillGapExplanationRequest,
)
from app.services.explanation_service import explain_recommendation, explain_skill_gap

router = APIRouter(
    prefix="/explain",
    tags=["explanation"],
    dependencies=[Depends(verify_internal_api_key)],
)


@router.post("/skill-gap", response_model=ExplanationResponse)
async def explain_skill_gap_endpoint(payload: SkillGapExplanationRequest) -> ExplanationResponse:
    return explain_skill_gap(payload)


@router.post("/recommendation", response_model=ExplanationResponse)
async def explain_recommendation_endpoint(
    payload: RecommendationExplanationRequest,
) -> ExplanationResponse:
    return explain_recommendation(payload)