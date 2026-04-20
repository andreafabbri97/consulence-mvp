from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..db import get_session
from ..models.dto import ActionPlan, Recommendation
from ..services import recommendations

router = APIRouter(tags=["recommendations"])


@router.get("/tenants/{tenant_id}/recommendations", response_model=List[Recommendation])
async def read_recommendations(tenant_id: str, session: Session = Depends(get_session)) -> List[Recommendation]:
    recs = recommendations.list_recommendations(tenant_id, session)
    return [Recommendation(**rec.model_dump(exclude={"tenant_id"})) for rec in recs]


@router.post("/recommendations/{rec_id}/accept", response_model=Recommendation)
async def accept_recommendation(rec_id: str, session: Session = Depends(get_session)) -> Recommendation:
    rec = recommendations.accept_recommendation(rec_id, session)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return Recommendation(**rec.model_dump(exclude={"tenant_id"}))


@router.get("/tenants/{tenant_id}/action-plans", response_model=List[ActionPlan])
async def read_action_plans(tenant_id: str, session: Session = Depends(get_session)) -> List[ActionPlan]:
    plans = recommendations.list_action_plans(tenant_id, session)
    return [ActionPlan(**plan.model_dump(exclude={"tenant_id"})) for plan in plans]


@router.post("/action-plans", response_model=ActionPlan)
async def create_action_plan(plan: ActionPlan, session: Session = Depends(get_session)) -> ActionPlan:
    # payload `plan` already contains id; persist it
    from ..models.entities import ActionPlanRecord

    record = ActionPlanRecord(**plan.model_dump())
    created = recommendations.create_action_plan(record, session)
    return ActionPlan(**created.model_dump(exclude={"tenant_id"}))


@router.put("/action-plans/{plan_id}", response_model=ActionPlan)
async def update_action_plan(plan_id: str, patch: dict, session: Session = Depends(get_session)) -> ActionPlan:
    updated = recommendations.update_action_plan(plan_id, patch, session)
    if not updated:
        raise HTTPException(status_code=404, detail="Action plan not found")
    return ActionPlan(**updated.model_dump(exclude={"tenant_id"}))


@router.delete("/action-plans/{plan_id}", status_code=204)
async def delete_action_plan(plan_id: str, session: Session = Depends(get_session)) -> None:
    ok = recommendations.delete_action_plan(plan_id, session)
    if not ok:
        raise HTTPException(status_code=404, detail="Action plan not found")
    return None
