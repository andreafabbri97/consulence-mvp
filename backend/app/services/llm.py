"""Orchestrazione LLM con fallback locale e logging in DB."""
from __future__ import annotations

import os
from copy import deepcopy
from typing import Dict, List, Tuple
from uuid import uuid4

from openai import OpenAI, OpenAIError
from sqlmodel import Session

from ..data.sample_data import LLM_STEPS_TEMPLATE
from ..models.entities import LLMSessionRecord

LLM_STEP_LABELS = [
    "Context builder",
    "Root cause",
    "Action plan",
]

_client: OpenAI | None = None
_client_key: str | None = None


def _get_client() -> OpenAI | None:
    global _client, _client_key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    if _client and _client_key == api_key:
        return _client
    _client = OpenAI(api_key=api_key)
    _client_key = api_key
    return _client


def _compose_steps_from_text(text: str) -> List[Dict[str, str]]:
    chunks = [chunk.strip() for chunk in text.split("\n---\n") if chunk.strip()]
    steps: List[Dict[str, str]] = []
    for idx, label in enumerate(LLM_STEP_LABELS):
        output = chunks[idx] if idx < len(chunks) else ""
        if not output:
            output = "LLM non ha restituito contenuto per questo step."
        steps.append({"name": label, "output": output})
    return steps


def _generate_llm_steps(tenant_id: str, focus_area: str) -> Tuple[List[Dict[str, str]], str | None]:
    client = _get_client()
    if not client:
        return deepcopy(LLM_STEPS_TEMPLATE), "OPENAI_API_KEY mancante"

    messages = [
        {
            "role": "system",
            "content": "Sei un consulente operativo senior. Fornisci insight azionabili in italiano, in massimo 4 frasi per sezione.",
        },
        {
            "role": "user",
            "content": (
                "Tenant: {tenant}. Focalizzati su '{focus}'. Restituisci tre sezioni separate da '\n---\n': "
                "1) contesto KPI, 2) root cause principali, 3) piano d'azione sintetico con metriche di successo."
            ).format(tenant=tenant_id, focus=focus_area),
        },
    ]

    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.2,
            max_tokens=600,
        )
        content = completion.choices[0].message.content or ""
        steps = _compose_steps_from_text(content)
        return steps, None
    except OpenAIError as exc:  # pragma: no cover - dipende dal servizio esterno
        return deepcopy(LLM_STEPS_TEMPLATE), str(exc)


def run_prompt_chain(tenant_id: str, focus_area: str, session: Session) -> Dict:
    steps, error = _generate_llm_steps(tenant_id, focus_area)
    if error:
        steps = steps + [
            {
                "name": "system_notice",
                "output": f"Fallback utilizzato: {error}",
            }
        ]

    # persist LLM session
    record = LLMSessionRecord(
        session_id=f"sess-{uuid4().hex[:8]}",
        tenant_id=tenant_id,
        focus_area=focus_area,
        status="completed",
        steps=steps,
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    # derive and persist one Insight + one Recommendation from LLM output (simple heuristic)
    try:
        _persist_insight_and_recommendation_from_steps(tenant_id, steps, session)
    except Exception:
        # never fail the main call because of persistence heuristics
        session.rollback()

    return record.model_dump()


def _pick_driver_metric(tenant_id: str, session: Session) -> str:
    """Pick a plausible driver metric for the recommendation: choose the worst KPI (critical) if present."""
    from sqlmodel import select
    from ..models.entities import KpiSnapshot

    stmt = select(KpiSnapshot).where(KpiSnapshot.tenant_id == tenant_id)
    rows = list(session.exec(stmt))
    if not rows:
        return ""
    # prefer critical; otherwise highest deviation from target
    critical = [r for r in rows if r.status == "critical"]
    if critical:
        return critical[0].metric_id
    # fallback: take KPI with lowest value/target ratio
    def ratio(r):
        try:
            return float(r.value) / float(r.target) if r.target else 1.0
        except Exception:
            return 1.0

    rows.sort(key=ratio)
    return rows[0].metric_id if rows else ""


def _persist_insight_and_recommendation_from_steps(tenant_id: str, steps: List[Dict[str, str]], session: Session) -> None:
    """Create InsightRecord and one-or-more RecommendationRecord from LLM steps.

    Heuristic behaviour (conservative):
    - persist a single Insight built from the `root cause` step
    - try to extract multiple recommendations from the `action/plan` step by
      splitting on numbered or bullet lines; if none found, fall back to one
      recommendation containing the whole action text.
    """
    from datetime import date
    from ..models.entities import InsightRecord, RecommendationRecord

    # prepare texts
    ctx = "".join([s.get("output", "") for s in steps])
    root = ""
    action = ""
    for s in steps:
        name = s.get("name", "").lower()
        if "root" in name or "root_cause" in name:
            root = s.get("output", "")
        if "action" in name or "plan" in name:
            action = s.get("output", "")

    # Insights: extract multiple short insights from `root` / context (up to 5)
    max_insights = 5
    import re

    insight_text_source = root or ctx
    insight_sentences = [s.strip() for s in re.split(r"(?<=[\.\!\?])\s+", insight_text_source) if s.strip()]
    if not insight_sentences:
        insight_sentences = [insight_text_source[:200]]

    created_ins = 0
    for sent in insight_sentences:
        if created_ins >= max_insights:
            break
        insight_id = f"insight-{uuid4().hex[:8]}"
        title = sent[:120]
        summary = (sent + " — contesto: " + (ctx[:600]))[:1200]
        impact_score = 0.6 + min(0.35, 0.1 * created_ins)
        priority = "media" if impact_score < 0.8 else "alta"

        insight = InsightRecord(
            tenant_id=tenant_id,
            insight_id=insight_id,
            title=title,
            summary=summary,
            impact_score=impact_score,
            priority=priority,
        )
        session.add(insight)
        created_ins += 1

    # Try to split `action` into multiple recommendation items
    candidates: list[str] = []
    if action:
        # split by common bullet/numbering patterns
        lines = [ln.strip() for ln in action.splitlines() if ln.strip()]
        for ln in lines:
            if ln.startswith(('-', '*')) or (len(ln) > 1 and ln[0].isdigit() and ln[1] in '.)'):
                candidates.append(re.sub(r'^[\-\*\d\)\.\s]+', '', ln))
            else:
                candidates.append(ln)
        # attempt to split numeric lists inside a paragraph
        parts = re.split(r"\n?\s*\d+[\).]\s+", action)
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) > len(candidates):
            candidates = parts
        else:
            if len(candidates) == 1:
                sents = [s.strip() for s in re.split(r"(?<=[\.\!\?])\s+", action) if s.strip()]
                if len(sents) > 1:
                    candidates = sents

    # If not enough candidates, supplement from root/context sentences
    if not candidates:
        candidates = [action or ctx[:800]]

    max_recs = 5
    created = 0
    # ensure we have at least `max_recs` candidates by adding root sentences when needed
    i = 0
    while len(candidates) < max_recs and i < len(insight_sentences):
        candidates.append(insight_sentences[i])
        i += 1

    for cand in candidates:
        if created >= max_recs:
            break
        rec_id = f"rec-{uuid4().hex[:8]}"
        title_rec = (cand.split('.\n')[0] or cand)[:140]
        description = cand[:1600]
        driver_metric_id = _pick_driver_metric(tenant_id, session) or ""
        impact = 0.55 + min(0.4, 0.05 * created)
        confidence = 0.5 + min(0.45, 0.06 * created)
        priority_rec = "media" if impact < 0.8 else "alta"

        rec = RecommendationRecord(
            id=rec_id,
            tenant_id=tenant_id,
            title=title_rec,
            description=description,
            driver_metric_id=driver_metric_id,
            impact_score=impact,
            confidence=confidence,
            priority=priority_rec,
            status="proposed",
        )
        session.add(rec)
        created += 1

    session.commit()
