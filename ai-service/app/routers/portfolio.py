"""
portfolio.py
-----------------------------------------
Route for AI-generated portfolio feedback. Guarded by the internal API
key dependency.
"""

from fastapi import APIRouter, Depends

from app.dependencies import verify_internal_api_key
from app.schemas.portfolio_schemas import PortfolioFeedbackRequest, PortfolioFeedbackResponse
from app.services.portfolio_service import generate_portfolio_feedback

router = APIRouter(
    prefix="/analyze",
    tags=["portfolio"],
    dependencies=[Depends(verify_internal_api_key)],
)


@router.post("/portfolio-feedback", response_model=PortfolioFeedbackResponse)
async def portfolio_feedback_endpoint(payload: PortfolioFeedbackRequest) -> PortfolioFeedbackResponse:
    return generate_portfolio_feedback(payload)