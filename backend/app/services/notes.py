"""Gestione note consulente."""
from __future__ import annotations

from typing import List
from uuid import uuid4

from sqlmodel import Session, select

from ..models.entities import ConsultantNoteRecord


def list_notes(tenant_id: str, session: Session) -> List[ConsultantNoteRecord]:
    statement = (
        select(ConsultantNoteRecord)
        .where(ConsultantNoteRecord.tenant_id == tenant_id)
        .order_by(ConsultantNoteRecord.created_at.desc())
    )
    return list(session.exec(statement))


def add_note(tenant_id: str, author: str, content: str, session: Session) -> ConsultantNoteRecord:
    note = ConsultantNoteRecord(
        note_id=f"note-{uuid4().hex[:8]}",
        tenant_id=tenant_id,
        author=author,
        content=content,
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    return note
