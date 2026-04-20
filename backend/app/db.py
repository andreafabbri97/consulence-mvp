from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine, select

from .data.sample_data import (
    ACTION_PLAN_SAMPLES,
    INSIGHT_SAMPLES,
    KPI_SAMPLES,
    NOTE_SAMPLES,
    RECOMMENDATION_SAMPLES,
)
from .models.entities import (
    ActionPlanRecord,
    ConsultantNoteRecord,
    InsightRecord,
    KpiSnapshot,
    RecommendationRecord,
)

DATABASE_URL = "sqlite:///advisor.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    seed_if_empty()


def seed_if_empty() -> None:
    with Session(engine) as session:
        has_kpi = session.exec(select(KpiSnapshot).limit(1)).first()
        if has_kpi:
            return

        session.add_all(KpiSnapshot(**row) for row in KPI_SAMPLES)
        session.add_all(InsightRecord(**row) for row in INSIGHT_SAMPLES)
        session.add_all(RecommendationRecord(**row) for row in RECOMMENDATION_SAMPLES)

        for plan in ACTION_PLAN_SAMPLES:
            session.add(ActionPlanRecord(**plan))

        for note in NOTE_SAMPLES:
            session.add(ConsultantNoteRecord(**note))

        session.commit()


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
