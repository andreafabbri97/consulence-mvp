"""Motore di raccomandazioni con persistenza."""
from __future__ import annotations

from typing import List, Optional

from sqlmodel import Session, select

from ..models.entities import ActionPlanRecord, RecommendationRecord


def list_recommendations(tenant_id: str, session: Session) -> List[RecommendationRecord]:
    statement = select(RecommendationRecord).where(RecommendationRecord.tenant_id == tenant_id)
    return list(session.exec(statement))


def accept_recommendation(rec_id: str, session: Session) -> Optional[RecommendationRecord]:
    record = session.get(RecommendationRecord, rec_id)
    if record:
        record.status = "accepted"
        session.add(record)
        # create an action plan automatically when a recommendation is accepted
        try:
            from uuid import uuid4
            from datetime import date, timedelta
            from ..models.entities import ActionPlanRecord

            plan = ActionPlanRecord(
                id=f"plan-{uuid4().hex[:8]}",
                tenant_id=record.tenant_id,
                recommendation_id=record.id,
                owner="sofia.rossi",
                status="in_progress",
                due_date=date.today() + timedelta(days=30),
                milestones=[],
            )
            session.add(plan)
        except Exception:
            # if action plan creation fails, still persist the recommendation acceptance
            session.rollback()
            session.add(record)
        session.commit()
        session.refresh(record)
    return record


def list_action_plans(tenant_id: str, session: Session) -> List[ActionPlanRecord]:
    statement = select(ActionPlanRecord).where(ActionPlanRecord.tenant_id == tenant_id)
    return list(session.exec(statement))


def create_action_plan(payload: ActionPlanRecord, session: Session) -> ActionPlanRecord:
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


def get_action_plan(plan_id: str, session: Session) -> ActionPlanRecord | None:
    return session.get(ActionPlanRecord, plan_id)


def update_action_plan(plan_id: str, patch: dict, session: Session) -> ActionPlanRecord | None:
    plan = session.get(ActionPlanRecord, plan_id)
    if not plan:
        return None
    for k, v in patch.items():
        if hasattr(plan, k):
            setattr(plan, k, v)
    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan


def delete_action_plan(plan_id: str, session: Session) -> bool:
    plan = session.get(ActionPlanRecord, plan_id)
    if not plan:
        return False
    session.delete(plan)
    session.commit()
    return True

