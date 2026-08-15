"""
github.py
-----------------------------------------
Route for AI-generated GitHub profile narrative summaries. Guarded by
the internal API key dependency.
"""

from fastapi import APIRouter, Depends

from app.dependencies import verify_internal_api_key
from app.schemas.github_schemas import GithubSummaryRequest, GithubSummaryResponse
from app.services.github_service import generate_github_summary

router = APIRouter(
    prefix="/analyze",
    tags=["github"],
    dependencies=[Depends(verify_internal_api_key)],
)


@router.post("/github-summary", response_model=GithubSummaryResponse)
async def github_summary_endpoint(payload: GithubSummaryRequest) -> GithubSummaryResponse:
    return generate_github_summary(payload)