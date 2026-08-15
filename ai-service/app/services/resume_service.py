"""
resume_service.py
-----------------------------------------
Business logic for the resume suggestions endpoint.
UPDATED (Batch 3 — response quality): max_tokens raised from 350 to
600 (a 3-5 item numbered list needs more room than a single paragraph),
min_words floor added.
"""

from app.schemas.resume_schemas import ResumeSuggestionsRequest, ResumeSuggestionsResponse
from app.services.llm_client import generate_completion
from app.services.prompt_templates import (
    RESUME_SUGGESTIONS_SYSTEM_PROMPT,
    build_resume_suggestions_user_prompt,
)


def generate_resume_suggestions(payload: ResumeSuggestionsRequest) -> ResumeSuggestionsResponse:
    user_prompt = build_resume_suggestions_user_prompt(
        extracted_skills=payload.extractedSkills,
        ats_breakdown=[item.model_dump() for item in payload.atsBreakdown],
        missing_skills=payload.missingSkills,
    )

    result = generate_completion(
        system_prompt=RESUME_SUGGESTIONS_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        max_tokens=600,
        min_words=50,
    )

    if not result.success:
        return ResumeSuggestionsResponse(success=False, reason=result.error_reason)

    return ResumeSuggestionsResponse(success=True, suggestions=result.text)