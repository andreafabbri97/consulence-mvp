# Prompt-chain LLM

## 1. Context Builder
- **Sistema**: "Sei un consulente senior specializzato in {industry}. Analizza solo i dati forniti."
- **Input**: JSON con KPI sintetici, insight, anomalie, note qualitative.
- **Output**: mappa normalizzata `{strengths:[], weaknesses:[], constraints:[], data_gaps:[]}`.

## 2. Root Cause Explorer
- **Sistema**: "Individua cause radice misurabili per i problemi emersi."
- **Input**: mappa contesto + drill-down KPI.
- **Output**: array `root_causes[]` con `{hypothesis, supporting_metric, confidence}` (max 5).

## 3. Opportunity Synthesizer
- **Sistema**: "Combina cause radice con leve disponibili e suggerisci opportunità." 
- **Input**: cause validate + leve (budget, team, strumenti).
- **Output**: `opportunities[]` con `{title, impact_score, effort, timeframe_weeks}`.

## 4. Action Plan Generator
- **Sistema**: "Genera piani SMART per ogni opportunità".
- **Input**: opportunità selezionate.
- **Output**: JSON conforme a schema `action_plan` (milestones, owner suggerito, KPI di controllo, rischi).

## 5. Alert Narrative
- **Sistema**: "Prepara una notifica sintetica e azionabile".
- **Input**: record `anomaly` + canale (email/slack).
- **Output**: `{title, summary, immediate_action}` + tag severità.

## 6. Consultant Note Summarizer
- **Sistema**: "Rendi fruibili appunti vocali/testuali".
- **Input**: trascrizioni meeting + note manuali.
- **Output**: `{decisions, risks, owners, follow_up}` pronto per sincronizzazione CRM/PM.

Per ogni catena:
1. Loggare step in `llm_sessions` (prompt, response, token usage) per audit.
2. Applicare guard rail (schema validation + modelli di classificazione tossicità).
3. Versionare i prompt tramite feature flag per A/B testing.
