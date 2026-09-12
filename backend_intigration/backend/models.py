from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Any


class Profile(BaseModel):
    name: str
    branch: str
    year: int
    cgpa: float
    skills: List[str]
    location: Optional[str] = None
    preferred_mode: Optional[str] = None
    minimum_stipend: Optional[float] = 0


class Opportunity(BaseModel):
    title: str
    company: str
    url: HttpUrl
    location: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[str] = None
    duration: Optional[str] = None
    requirements: List[str] = []
    description: Optional[str] = None
    source: Optional[str] = None


class AnalyzedOpportunity(Opportunity):
    eligible: bool = False
    match_score: int = 0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    reasons: List[str] = []
    warnings: List[str] = []
    explanation: Optional[str] = None


class AgentEvent(BaseModel):
    type: str
    message: str
    url: Optional[HttpUrl] = None


class SearchResponse(BaseModel):
    success: bool
    total_found: int
    total_analyzed: int
    total_eligible: int
    opportunities: List[Any]
    agent_events: List[AgentEvent]
