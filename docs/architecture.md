# Architettura MVP

## Panoramica
- **Frontend**: Next.js 14 (App Router) + Tailwind. Consume API REST del backend e mostra dashboard, insight, action plan e desk consulente.
- **Backend**: FastAPI con servizi modulari (analytics, recommendations, notes, llm) e layer dati SQLModel/SQLite. La stessa interfaccia può essere spostata su Postgres/Snowflake senza toccare i router.
- **AI/LLM**: orchestratore che usa OpenAI (chat completions) con fallback deterministico per ambienti senza chiave. Le interfacce (`LLMRun`, `LLMStep`) supportano il logging di ogni step.
- **Data Layer**: SQLite embedded (`advisor.db`) per l'MVP con seed iniziale. In produzione si prevedono bucket raw (S3/Blob), staging Delta/Parquet e warehouse (Snowflake/BigQuery) + Redis per cache e pgvector per embedding.
- **Comunicazione**: API REST JSON, CORS abilitato per consentire al frontend di sviluppare localmente.

## Moduli backend
1. `analytics`: recupera KPI e insight.
2. `recommendations`: restituisce raccomandazioni, action plan e gestisce lo stato (accept/in progress).
3. `notes`: CRUD note private.
4. `llm`: crea sessioni e restituisce output step-by-step.
5. `routers`: layer HTTP che espone endpoint multi-tenant.

## Schemi dati MVP
| Entità | Campi chiave | Note |
| --- | --- | --- |
| KPI | metric_id, domain, value, target, period, status | Base per dashboard.
| Insight | id, summary, impact_score, priority | Derivato da analytics/LLM.
| Recommendation | id, driver_metric_id, impact_score, confidence, status | Alimenta action plan.
| ActionPlan | id, recommendation_id, owner, due_date, milestones | Workflow.
| ConsultantNote | note_id, author, created_at, content | Area privata.
| LLMSession | session_id, focus_area, steps[] | Audit catena prompt.

## Flussi di automazione (target)
1. **Ingestion**: Upload/connector → storage raw → validazione (Great Expectations) → publish dataset.
2. **KPI refresh**: Scheduler Temporal → dbt/Snowflake → `kpi_snapshots` → eventi per alert.
3. **Alerting**: Forecast (Prophet) + regole → `anomalies` → notification center (email/Slack/Teams).
4. **Reporting**: Settimanale → LLM genera narrativa + ReportLab per PDF → consegna via email + archivio.
5. **Workflow**: Accept recommendation → genera `action_plan` + sync con tool esterni via webhook.

## Sistema di raccomandazione
- Feature: delte KPI, severità anomalie, feedback consulente, template industry.
- Scoring ibrido: modello gradient boosting per stimare impatto + re-ranking LLM per narrativa.
- Feedback: stato raccomandazione, durata action plan, rating consulente → riaddestramento.

## API principali
| Metodo | Path | Descrizione |
| --- | --- | --- |
| `GET` | `/health` | Stato servizio.
| `GET` | `/tenants/{tenant_id}/kpis` | Lista KPI.
| `GET` | `/tenants/{tenant_id}/insights` | Insight AI.
| `GET` | `/tenants/{tenant_id}/recommendations` | Raccomandazioni attive.
| `POST` | `/recommendations/{rec_id}/accept` | Aggiorna stato.
| `GET` | `/tenants/{tenant_id}/action-plans` | Workflow collegati.
| `GET` | `/consultant/notes?tenant_id=` | Note private.
| `POST` | `/consultant/notes` | Crea nota.
| `POST` | `/llm/session` | Avvia catena prompt.

## Stack consigliato (per evoluzione)
- **Backend**: FastAPI + SQLModel/SQLAlchemy, Celery/Temporal per job, Kafka/MSK per eventi.
- **Data**: dbt + Snowflake/BigQuery, Delta Lake per staging, Great Expectations per qualità.
- **AI**: LangChain + Azure OpenAI/Claude, Weaviate/pgvector per embedding, Neptune/Neo4j per grafi.
- **Frontend**: Next.js, React Query, Tailwind, Recharts/Visx, Storybook.
- **Infra**: AWS (EKS, RDS Postgres, S3, MSK, SES/SNS), Terraform, ArgoCD, Datadog.
