"""Data transfer objects condivisi tra router."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class KPI(BaseModel):
    metric_id: str
    name: str
    value: float
    target: float
    unit: str
    trend: float = Field(description="Variazione percentuale periodo su periodo")
    period: str
    domain: Literal["marketing", "operations", "finance", "hr"]
    status: Literal["healthy", "warning", "critical"]


class KPIResponse(BaseModel):
    tenant_id: str
    kpis: List[KPI]


class Insight(BaseModel):
    id: str
    title: str
    summary: str
    impact_score: float
    priority: Literal["bassa", "media", "alta"]


class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    driver_metric_id: str
    impact_score: float
    confidence: float
    priority: Literal["bassa", "media", "alta"]
    status: Literal["proposed", "in_progress", "accepted"]


class Milestone(BaseModel):
    title: str
    status: Literal["todo", "in_progress", "done"]


class ActionPlan(BaseModel):
    id: str
    recommendation_id: str
    owner: str
    status: Literal["planned", "in_progress", "blocked", "done"]
    due_date: date
    milestones: List[Milestone]


class ConsultantNote(BaseModel):
    note_id: str
    tenant_id: str
    author: str
    created_at: datetime
    content: str


class NoteCreate(BaseModel):
    tenant_id: str = Field(..., description="Tenant di riferimento")
    author: str
    content: str


class LLMStep(BaseModel):
    name: str
    output: str


class LLMRun(BaseModel):
    session_id: str
    tenant_id: str
    focus_area: str
    status: Literal["running", "completed"]
    steps: List[LLMStep]


class LLMRunRequest(BaseModel):
    tenant_id: str
    focus_area: str
