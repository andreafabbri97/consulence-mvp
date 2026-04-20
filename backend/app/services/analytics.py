"""Servizi per KPI e insight."""
from __future__ import annotations

from typing import List

from sqlmodel import Session, select

from ..models.entities import InsightRecord, KpiSnapshot


def _compute_status(value: float, target: float, trend: float) -> str:
    """Semplice euristica per determinare lo status del KPI.

    - Se value >= target => healthy
    - Se value < target:
      - ratio >= 0.95 => warning
      - ratio < 0.95 => critical
    - Il trend negativo (abbastanza grande) può far peggiorare lo status.
    """
    try:
        if target == 0:
            return "healthy"
        ratio = value / target
    except Exception:
        return "warning"

    # base status
    if value >= target:
        base = "healthy"
    else:
        base = "warning" if ratio >= 0.95 else "critical"

    # consider trend: se trend è negativo e significativo, promuoviamo a livello peggiore
    if trend is None:
        trend = 0.0
    try:
        t = float(trend)
    except Exception:
        t = 0.0

    if t < -0.05:  # trend calante oltre il 5% -> peggiora
        if base == "healthy":
            return "warning"
        if base == "warning":
            return "critical"
    return base


def insert_kpis(tenant_id: str, kpis: list[dict], session: Session) -> list[KpiSnapshot]:
    """Insert multiple KPI snapshots into the DB and return created records.

    Lo `status` è calcolato automaticamente qui e sovrascrive qualsiasi valore
    eventualmente fornito dal client (non considerare lo status inviato dall'utente).
    """
    created: list[KpiSnapshot] = []
    for data in kpis:
        # normalizza campi essenziali e calcola status
        value = float(data.get("value") or 0)
        target = float(data.get("target") or 0)
        trend = float(data.get("trend") or 0)
        period = str(data.get("period") or "")

        computed_status = _compute_status(value=value, target=target, trend=trend)

        rec_data = {
            "metric_id": str(data.get("metric_id") or "").strip(),
            "name": str(data.get("name") or "").strip(),
            "value": value,
            "target": target,
            "unit": str(data.get("unit") or ""),
            "trend": trend,
            "period": period,
            "domain": str(data.get("domain") or "general"),
            "status": computed_status,
        }

        rec = KpiSnapshot(tenant_id=tenant_id, **rec_data)
        session.add(rec)
        created.append(rec)
    session.commit()
    for r in created:
        session.refresh(r)
    return created


def fetch_kpis(tenant_id: str, session: Session) -> List[KpiSnapshot]:
    statement = select(KpiSnapshot).where(KpiSnapshot.tenant_id == tenant_id).order_by(KpiSnapshot.metric_id)
    return list(session.exec(statement))


def fetch_insights(tenant_id: str, session: Session) -> List[InsightRecord]:
    statement = select(InsightRecord).where(InsightRecord.tenant_id == tenant_id)
    return list(session.exec(statement))
