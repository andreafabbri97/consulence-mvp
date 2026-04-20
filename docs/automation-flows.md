# Flussi di automazione MVP

## 1. Ingestion multicanale
1. Upload file Excel/CSV o token API connettori.
2. Salvataggio su storage raw (S3/Blob) + metadata `data_sources`.
3. Trigger evento (Kafka) → job di validazione (Great Expectations) → dataset validato.
4. Aggiornamento catalogo + notifica stato ingest.

## 2. Pipeline KPI
1. Scheduler (Temporal/Prefect) avvia job per dominio.
2. dbt calcola metriche e persiste su `kpi_snapshots`.
3. Pubblica evento `kpi.updated` per alert/anomaly.

## 3. Alerting intelligente
1. Evento KPI → modello forecast (Prophet/NeuralProphet) e Isolation Forest.
2. Se severità > soglia, crea record `anomalies` + push su notification service.
3. Routing su email/Slack/Teams con CTA "Apri piano".

## 4. Raccomandazioni & action plan
1. Batch giornaliero arricchisce feature store (trend KPI, note consulente, benchmark).
2. Modello ML ranka opportunità → LLM produce narrativa e to-do.
3. Accettazione lato UI → Workflow engine crea `action_plan` + automatizza task (ClickUp/Jira via webhook).

## 5. Reporting automatico
1. Scheduler settimanale → raccoglie highlight KPI, action plan, note.
2. Chiamata LLM per narrativa + generazione PDF/Slides.
3. Consegna tramite email + pubblicazione in area riservata.

## 6. Knowledge loop
1. Ogni interazione (nota, accept, snooze alert) viene loggata.
2. Feedback alimenta modelli (pesatura impatto/urgenza) e taratura prompt.
