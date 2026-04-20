from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from ..db import get_session
from ..models.dto import ConsultantNote, NoteCreate
from ..services import notes

router = APIRouter(prefix="/consultant", tags=["consultant"])


@router.get("/notes", response_model=List[ConsultantNote])
async def read_notes(tenant_id: str = Query(...), session: Session = Depends(get_session)) -> List[ConsultantNote]:
    data = notes.list_notes(tenant_id, session)
    if not data:
        return []
    return [ConsultantNote(**note.model_dump()) for note in data]


@router.post("/notes", response_model=ConsultantNote, status_code=201)
async def create_note(payload: NoteCreate, session: Session = Depends(get_session)) -> ConsultantNote:
    note = notes.add_note(payload.tenant_id, payload.author, payload.content, session)
    if not note:
        raise HTTPException(status_code=500, detail="Impossibile salvare la nota")
    return ConsultantNote(**note.model_dump())
