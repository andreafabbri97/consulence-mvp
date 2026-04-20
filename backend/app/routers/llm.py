from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..models.dto import LLMRun, LLMRunRequest
from ..services import llm

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/session", response_model=LLMRun)
async def run_llm_session(payload: LLMRunRequest, db: Session = Depends(get_session)) -> LLMRun:
    session_record = llm.run_prompt_chain(payload.tenant_id, payload.focus_area, db)
    return LLMRun(**session_record)
