"""
portfolio_schemas.py
-----------------------------------------
Pydantic request/response models for the /analyze/portfolio-feedback
endpoint.
"""

from typing import Optional

from pydantic import BaseModel


class DetectedSections(BaseModel):
    about: bool = False
    projects: bool = False
    skills: bool = False
    experience: bool = False
    contact: bool = False


class PortfolioFeedbackRequest(BaseModel):
    detectedSections: DetectedSections
    projectCount: int = 0
    techStackDetected: list[str] = []


class PortfolioFeedbackResponse(BaseModel):
    success: bool
    feedback: Optional[str] = None
    reason: Optional[str] = None