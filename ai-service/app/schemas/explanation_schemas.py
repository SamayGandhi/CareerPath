"""
explanation_schemas.py
-----------------------------------------
Pydantic request/response models for the /explain/* endpoints. These
mirror exactly the shape of data the Node backend's rule engines
already compute — this service adds no new fields the rule engines
don't already produce, only text derived from them.
"""

from typing import Optional

from pydantic import BaseModel, Field


class SkillGapItem(BaseModel):
    skillName: str
    currentLevel: int
    requiredLevel: int
    gapSeverity: str


class SkillGapExplanationRequest(BaseModel):
    careerPathTitle: str
    readinessScore: int = Field(ge=0, le=100)
    gaps: list[SkillGapItem]


class RecommendedCourseItem(BaseModel):
    title: str
    score: int = Field(ge=0, le=100)
    reasons: list[str] = []


class RecommendationExplanationRequest(BaseModel):
    strategyLabel: str
    courses: list[RecommendedCourseItem]


class ExplanationResponse(BaseModel):
    success: bool
    explanation: Optional[str] = None
    reason: Optional[str] = None