from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..models.dto import Insight, KPI, KPIResponse
from ..services import analytics
from pydantic import BaseModel
from fastapi import UploadFile, File, HTTPException
import csv
import io
import openpyxl

router = APIRouter(prefix="/tenants/{tenant_id}", tags=["analytics"])


@router.get("/kpis", response_model=KPIResponse)
async def read_kpis(tenant_id: str, session: Session = Depends(get_session)) -> KPIResponse:
    records = analytics.fetch_kpis(tenant_id, session)
    kpis = [
        KPI(
            metric_id=record.metric_id,
            name=record.name,
            value=record.value,
            target=record.target,
            unit=record.unit,
            trend=record.trend,
            period=record.period,
            domain=record.domain,
            status=record.status,
        )
        for record in records
    ]
    return KPIResponse(tenant_id=tenant_id, kpis=kpis)


@router.get("/insights", response_model=List[Insight])
async def read_insights(tenant_id: str, session: Session = Depends(get_session)) -> List[Insight]:
    records = analytics.fetch_insights(tenant_id, session)
    return [
        Insight(
            id=record.insight_id,
            title=record.title,
            summary=record.summary,
            impact_score=record.impact_score,
            priority=record.priority,
        )
        for record in records
    ]


class KPIInput(BaseModel):
    metric_id: str
    name: str
    value: float
    target: float
    unit: str
    trend: float
    period: str
    domain: str
    # note: `status` non è più fornito dal client — viene calcolato dal server


@router.post("/kpis", status_code=201)
async def create_kpis(tenant_id: str, payload: List[KPIInput], session: Session = Depends(get_session)):
    data = [item.model_dump() for item in payload]
    created = analytics.insert_kpis(tenant_id, data, session)
    return {"inserted": len(created)}


@router.post("/kpis/upload", status_code=201)
async def upload_kpis(tenant_id: str, file: UploadFile = File(...), session: Session = Depends(get_session)):
    content = await file.read()
    kpis: list[dict] = []
    try:
        if file.filename.lower().endswith(('.xls', '.xlsx')):
            wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
            ws = wb.active
            headers = [str(c).strip() for c in next(ws.values)]
            for row in ws.iter_rows(min_row=2, values_only=True):
                rowd = {headers[i]: row[i] for i in range(len(headers))}
                kpis.append(rowd)
        else:
            s = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(s))
            for row in reader:
                kpis.append(row)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid file format: {exc}")

    # normalize/convert types where possible
    normalized = []
    for r in kpis:
        try:
            normalized.append(
                {
                    "metric_id": str(r.get('metric_id') or r.get('metric') or r.get('id')),
                    "name": str(r.get('name') or ''),
                    "value": float(r.get('value') or 0),
                    "target": float(r.get('target') or 0),
                    "unit": str(r.get('unit') or ''),
                    "trend": float(r.get('trend') or 0),
                    "period": str(r.get('period') or ''),
                    "domain": str(r.get('domain') or 'marketing'),  # status verrà calcolato dal server
                }
            )
        except Exception:
            # skip invalid rows
            continue

    created = analytics.insert_kpis(tenant_id, normalized, session)
    return {"inserted": len(created)}
