"""
resume.py
-----------------------------------------
Route for AI-generated resume improvement suggestions. Guarded by the
internal API key dependency.
"""

from fastapi import APIRouter, Depends

from app.dependencies import verify_internal_api_key
from app.schemas.resume_schemas import ResumeSuggestionsRequest, ResumeSuggestionsResponse
from app.services.resume_service import generate_resume_suggestions

router = APIRouter(
    prefix="/analyze",
    tags=["resume"],
    dependencies=[Depends(verify_internal_api_key)],
)


@router.post("/resume-suggestions", response_model=ResumeSuggestionsResponse)
async def resume_suggestions_endpoint(payload: ResumeSuggestionsRequest) -> ResumeSuggestionsResponse:
    return generate_resume_suggestions(payload)