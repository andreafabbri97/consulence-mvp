# Advisor SaaS MVP

MVP end-to-end per una piattaforma SaaS di consulenza aziendale con analisi KPI, automazioni e intelligenza artificiale. Comprende un backend FastAPI e un frontend Next.js/Tailwind con area consulente.

## Struttura
- `backend/`: API FastAPI con SQLModel + SQLite, servizi analytics/recommendations/notes e catena LLM reale (OpenAI con fallback locale).
- `frontend/`: Next.js 14 (App Router) con dashboard, insight AI, action plan e desk consulente.
- `docs/`: specifiche architetturali, flussi di automazione e prompt-chain.

## Prerequisiti
- Python 3.12+
- Node.js 18+ (consigliata LTS)
- Account OpenAI (facoltativo: senza `OPENAI_API_KEY` il servizio usa fallback mock)

## Avvio locale
1. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   copy .env.example .env  # imposta OPENAI_API_KEY se disponibile
   uvicorn app.main:app --reload
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Apri `http://localhost:3000` (il frontend parla con `http://localhost:8000`).

## Launcher Windows
Dopo aver installato le dipendenze, puoi avviare tutto con `run_mvp.bat`, che apre due finestre (`uvicorn` + `npm run dev`). Assicurati che `backend/.venv` esista e che il frontend abbia già eseguito `npm install`.

## Funzionalità coperte
- Visualizzazione KPI chiave, insight e raccomandazioni ordinate per priorità.
- Piani d'azione con milestone e owner.
- Desk consulente con note private persistite (SQLite).
- Copilot AI che usa OpenAI (o fallback locale) e salva ogni sessione in DB.
- API multi-tenant già strutturate per estensioni future.

## Nuove funzionalità (recenti)
- LLM ora può generare più raccomandazioni a partire dallo stesso `Action plan` (vengono persistite come più `RecommendationRecord`).
- Scheduler periodico (thread di background) che esegue il Copilot per tutti i tenant; è possibile avviarlo/fermalo/eseguirlo una volta via API/UI.
- Accettazione di una `Recommendation` crea automaticamente un `ActionPlan` (esistente).
- CRUD manuale per `ActionPlan` (crea / modifica) disponibile dall'interfaccia consulente.

## Prossimi passi suggeriti
1. Portare il layer dati da SQLite embedded a Postgres/Snowflake + dbt.
2. Collegare veri connettori (es. Google Ads, HubSpot) e implementare pipeline qualità.
3. Espandere l'integrazione LLM (Azure OpenAI/Claude) con retrieval e vector store.
4. Aggiungere autenticazione (Auth0) e feature flag per abilitare clienti pilota.
5. Automatizzare deploy con Terraform + GitHub Actions + Kubernetes.

Dettagli completi in `docs/architecture.md`, `docs/automation-flows.md` e `docs/prompt-chains.md`.
