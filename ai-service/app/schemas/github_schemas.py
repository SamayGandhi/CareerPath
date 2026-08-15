"""
github_schemas.py
-----------------------------------------
Pydantic request/response models for the /analyze/github-summary
endpoint.
"""

from typing import Optional

from pydantic import BaseModel


class LanguageItem(BaseModel):
    language: str
    percentage: int


class QualitySignalItem(BaseModel):
    label: str
    passed: bool
    note: str


class GithubSummaryRequest(BaseModel):
    languages: list[LanguageItem] = []
    originalRepoCount: int = 0
    totalStars: int = 0
    qualitySignals: list[QualitySignalItem] = []


class GithubSummaryResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    reason: Optional[str] = None