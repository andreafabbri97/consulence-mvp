from sqlmodel import Session, select
from datetime import date, timedelta

from app.db import engine, init_db
from app.models.entities import ActionPlanRecord
from app.services.recommendations import create_action_plan, delete_action_plan


def setup_module():
    init_db()


def test_create_and_delete_action_plan():
    tenant = "test-tenant"
    plan = ActionPlanRecord(
        id="plan-test-1",
        tenant_id=tenant,
        recommendation_id="rec-1",
        owner="tester",
        status="planned",
        due_date=date.today() + timedelta(days=7),
        milestones=[],
    )
    with Session(engine) as s:
        created = create_action_plan(plan, s)
        assert created.id == plan.id
        ok = delete_action_plan(plan.id, s)
        assert ok is True
        # ensure deleted
        fetched = s.get(ActionPlanRecord, plan.id)
        assert fetched is None