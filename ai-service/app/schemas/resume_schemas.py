"""
resume_schemas.py
-----------------------------------------
Pydantic request/response models for the /analyze/resume-suggestions
endpoint.
"""

from typing import Optional

from pydantic import BaseModel


class AtsBreakdownItem(BaseModel):
    label: str
    points: int
    maxPoints: int
    note: str


class ResumeSuggestionsRequest(BaseModel):
    extractedSkills: list[str] = []
    atsBreakdown: list[AtsBreakdownItem] = []
    missingSkills: list[str] = []


class ResumeSuggestionsResponse(BaseModel):
    success: bool
    suggestions: Optional[str] = None
    reason: Optional[str] = None