from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..services import automation

router = APIRouter(tags=["automation"])


class SchedulerStartRequest(BaseModel):
    interval_min: int | None = None


@router.get("/automation/status")
async def get_scheduler_status():
    return automation.is_scheduler_running()


@router.post("/automation/start")
async def post_start_scheduler(payload: SchedulerStartRequest | None = None):
    t = automation.start_scheduler(payload.interval_min if payload else None)
    # return stable status (don't dereference payload when it's None)
    status = automation.is_scheduler_running()
    return {"started": True, "thread_alive": t.is_alive(), "interval_min": status.get("interval_min")}



@router.post("/automation/stop")
async def post_stop_scheduler():
    stopped = automation.stop_scheduler()
    if not stopped:
        raise HTTPException(status_code=404, detail="Scheduler not running")
    return {"stopped": True}


@router.post("/automation/run-once")
async def post_run_once():
    count = automation.run_scheduler_once()
    return {"runs": count}