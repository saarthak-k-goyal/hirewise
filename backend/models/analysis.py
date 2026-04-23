from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class WeakBullet(BaseModel):
    original: str
    improved: str


class AnalysisResult(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    weak_bullets: List[WeakBullet]
    cover_letter: str
    summary: str


class AnalysisDocument(BaseModel):
    id: str
    user_id: str
    resume_text: str
    jd_text: str
    result: AnalysisResult
    created_at: datetime
    jd_preview: Optional[str] = None


class AnalysisListItem(BaseModel):
    id: str
    jd_preview: str
    match_score: int
    summary: str
    created_at: datetime