"""Scheduler leggero per eseguire periodicamente le LLM-run per ogni tenant.
La scheduler usa una thread daemon che chiama `llm.run_prompt_chain` per ciascun tenant
(es. focus_area='kpis').
"""
from __future__ import annotations

import os
import threading
import time
from typing import Iterable

from sqlmodel import Session, select

from ..db import engine
from ..models.entities import KpiSnapshot
from . import llm


def _list_tenants(session: Session) -> Iterable[str]:
    stmt = select(KpiSnapshot.tenant_id).distinct()
    return [r for (r,) in session.exec(stmt).all()]


# internal controller state
_scheduler_thread: threading.Thread | None = None
_scheduler_stop: threading.Event | None = None
_scheduler_interval_min: int = 60


def _worker(stop_event: threading.Event, interval_min: int) -> None:
    """Worker loop that exits when stop_event is set."""
    from sqlmodel import Session as _Session

    while not stop_event.is_set():
        try:
            with _Session(engine) as s:
                tenants = _list_tenants(s) or []
            for t in tenants:
                if stop_event.is_set():
                    break
                try:
                    # create a new Session for each run so LLM/service can commit independently
                    with _Session(engine) as s2:
                        llm.run_prompt_chain(t, "kpis", s2)
                except Exception:
                    # swallow individual tenant errors
                    pass
        except Exception:
            pass
        # wait with early wake via event
        stop_event.wait(max(1, interval_min) * 60)


def start_scheduler(interval_min: int | None = None) -> threading.Thread:
    """Start scheduler in background thread (idempotent). Returns the Thread object.

    interval_min: minutes between runs (defaults from env SCHEDULER_INTERVAL_MIN or 60).
    """
    global _scheduler_thread, _scheduler_stop, _scheduler_interval_min
    if interval_min is None:
        try:
            interval_min = int(os.getenv("SCHEDULER_INTERVAL_MIN", "60"))
        except Exception:
            interval_min = 60

    _scheduler_interval_min = interval_min
    if _scheduler_thread and _scheduler_thread.is_alive():
        return _scheduler_thread

    stop_event = threading.Event()
    t = threading.Thread(target=_worker, args=(stop_event, interval_min), daemon=True)
    _scheduler_thread = t
    _scheduler_stop = stop_event
    t.start()
    return t


def stop_scheduler() -> bool:
    """Stop the scheduler if running. Returns True if stopped, False if none was running."""
    global _scheduler_thread, _scheduler_stop
    if _scheduler_thread and _scheduler_thread.is_alive() and _scheduler_stop:
        _scheduler_stop.set()
        _scheduler_thread.join(timeout=5)
        _scheduler_thread = None
        _scheduler_stop = None
        return True
    return False


def is_scheduler_running() -> dict:
    return {"running": bool(_scheduler_thread and _scheduler_thread.is_alive()), "interval_min": _scheduler_interval_min}


def run_scheduler_once() -> int:
    """Run the LLM prompt chain once for all tenants (synchronous). Returns number of tenants processed."""
    from sqlmodel import Session as _Session

    count = 0
    with _Session(engine) as s:
        tenants = _list_tenants(s) or []
    for t in tenants:
        try:
            with _Session(engine) as s2:
                llm.run_prompt_chain(t, "kpis", s2)
                count += 1
        except Exception:
            pass
    return count