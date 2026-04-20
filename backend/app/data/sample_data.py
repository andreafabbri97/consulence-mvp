"""Dati di seed per l'MVP."""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import List

DEFAULT_TENANT = "acme"

KPI_SAMPLES = [
    {
        "tenant_id": DEFAULT_TENANT,
        "metric_id": "rev_mrr",
        "name": "MRR",
        "value": 185000,
        "target": 200000,
        "unit": "€",
        "trend": 0.08,
        "period": "2025-11",
        "domain": "finance",
        "status": "warning",
    },
    {
        "tenant_id": DEFAULT_TENANT,
        "metric_id": "cac",
        "name": "CAC",
        "value": 1620,
        "target": 1400,
        "unit": "€",
        "trend": 0.12,
        "period": "2025-11",
        "domain": "marketing",
        "status": "critical",
    },
    {
        "tenant_id": DEFAULT_TENANT,
        "metric_id": "nps",
        "name": "NPS",
        "value": 42,
        "target": 55,
        "unit": "pts",
        "trend": -0.05,
        "period": "2025-Q4",
        "domain": "operations",
        "status": "warning",
    },
    {
        "tenant_id": DEFAULT_TENANT,
        "metric_id": "attrition",
        "name": "Attrition",
        "value": 0.07,
        "target": 0.05,
        "unit": "%",
        "trend": 0.02,
        "period": "2025-Q4",
        "domain": "hr",
        "status": "critical",
    },
]

INSIGHT_SAMPLES = [
    {
        "tenant_id": DEFAULT_TENANT,
        "insight_id": "insight-cac",
        "title": "Il CAC è cresciuto del 12%",
        "summary": "L'aumento deriva da campagne paid con ROAS basso in UK.",
        "impact_score": 0.78,
        "priority": "alta",
    },
    {
        "tenant_id": DEFAULT_TENANT,
        "insight_id": "insight-attrition",
        "title": "Aumento dimissioni team vendite",
        "summary": "Turnover 7%, superiore del 40% al benchmark SaaS.",
        "impact_score": 0.72,
        "priority": "media",
    },
]

RECOMMENDATION_SAMPLES = [
    {
        "id": "rec-1",
        "tenant_id": DEFAULT_TENANT,
        "title": "Ribilancia budget marketing",
        "description": "Sposta 15% del budget paid verso campagne partner con CAC 35% inferiore.",
        "driver_metric_id": "cac",
        "impact_score": 0.82,
        "confidence": 0.74,
        "priority": "alta",
        "status": "proposed",
    },
    {
        "id": "rec-2",
        "tenant_id": DEFAULT_TENANT,
        "title": "Programma retention vendite",
        "description": "Implementa bonus trimestrale legato a pipeline qualificata e coaching.",
        "driver_metric_id": "attrition",
        "impact_score": 0.69,
        "confidence": 0.66,
        "priority": "media",
        "status": "in_progress",
    },
]

ACTION_PLAN_SAMPLES = [
    {
        "id": "plan-1",
        "tenant_id": DEFAULT_TENANT,
        "recommendation_id": "rec-2",
        "owner": "sofia.rossi",
        "status": "in_progress",
        "due_date": date.today() + timedelta(days=21),
        "milestones": [
            {"title": "Disegnare bonus", "status": "done"},
            {"title": "Allineare HR", "status": "in_progress"},
        ],
    }
]

NOTE_SAMPLES = [
    {
        "note_id": "note-1",
        "tenant_id": DEFAULT_TENANT,
        "author": "consulente@firm.it",
        "created_at": datetime.utcnow(),
        "content": "Clienti enterprise chiedono SLA più stringenti.",
    }
]

LLM_STEPS_TEMPLATE: List[dict] = [
    {
        "name": "context_builder",
        "output": "KPI marketing in rallentamento vs target.",
    },
    {
        "name": "root_cause",
        "output": "ROAS UK sotto 2.5; pipeline partner non attivata.",
    },
    {
        "name": "action_plan",
        "output": "Priorità: riallocare 15% budget e lanciare programma partner.",
    },
]
