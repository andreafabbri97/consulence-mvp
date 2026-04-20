# Backend MVP

Servizio FastAPI per l'MVP di consulenza aziendale. Espone KPI/insight/action plan, note consulente e orchestrazioni LLM persistite su SQLite tramite SQLModel.

## Avvio rapido

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env  # opzionale ma necessario per usare OpenAI
uvicorn app.main:app --reload
```

Il database `advisor.db` viene creato automaticamente nella root `backend/` al primo avvio insieme ai dati di seed.

### Variabili ambiente
- `OPENAI_API_KEY`: chiave OpenAI (facoltativa enabel fallback mock).
- `OPENAI_MODEL`: modello da usare (default `gpt-4o-mini`).

In locale basta copiare `.env.example` e valorizzare le variabili.

Per configurare origini dati o prompt futuri, vedi `docs/architecture.md` nella root del progetto.
