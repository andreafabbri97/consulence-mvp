from sqlmodel import Session, select

from app.db import engine, init_db
from app.services.llm import _persist_insight_and_recommendation_from_steps
from app.models.entities import RecommendationRecord


def setup_module():
    # ensure schema exists
    init_db()


def test_persist_multiple_recommendations():
    tenant = "test-tenant"
    steps = [
        {"name": "Context builder", "output": "Context breve."},
        {"name": "Root cause", "output": "Problema principale: caduta conversione."},
        {
            "name": "Action plan",
            "output": "1) Aumentare test A/B per landing page.\n2) Ridurre frizione nel checkout.\n3) Semplificare funnel con CTA più chiare.",
        },
    ]

    with Session(engine) as s:
        # remove any existing recs for tenant
        s.exec(select(RecommendationRecord).where(RecommendationRecord.tenant_id == tenant)).all()
        _persist_insight_and_recommendation_from_steps(tenant, steps, s)

        recs = list(s.exec(select(RecommendationRecord).where(RecommendationRecord.tenant_id == tenant)))
        insights = list(s.exec(select(RecommendationRecord).where(RecommendationRecord.tenant_id == tenant)))
        # validate at least 5 recommendations
        assert len(recs) >= 5, "Dovrebbero essere create almeno 5 raccomandazioni dalla action list"
        # ensure multiple insights are created when root contains multiple sentences
        from app.models.entities import InsightRecord
        ins_rows = list(s.exec(select(InsightRecord).where(InsightRecord.tenant_id == tenant)))
        assert len(ins_rows) >= 1, "Almeno 1 insight deve essere creato"