from __future__ import annotations

from datetime import datetime, date
from typing import List, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class KpiSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    metric_id: str = Field(index=True)
    name: str
    value: float
    target: float
    unit: str
    trend: float
    period: str
    domain: str
    status: str


class InsightRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True)
    insight_id: str = Field(index=True, unique=True)
    title: str
    summary: str
    impact_score: float
    priority: str


class RecommendationRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    title: str
    description: str
    driver_metric_id: str
    impact_score: float
    confidence: float
    priority: str
    status: str


class ActionPlanRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    recommendation_id: str = Field(index=True)
    owner: str
    status: str
    due_date: date
    milestones: List[dict] = Field(sa_column=Column(JSON))


class ConsultantNoteRecord(SQLModel, table=True):
    note_id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    author: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    content: str


class LLMSessionRecord(SQLModel, table=True):
    session_id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    focus_area: str
    status: str
    steps: List[dict] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
