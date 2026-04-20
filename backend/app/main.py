from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .routers import health, kpis, recommendations, notes, llm, automation
from .services.automation import start_scheduler

app = FastAPI(title="Advisor SaaS MVP", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(kpis.router)
app.include_router(recommendations.router)
app.include_router(notes.router)
app.include_router(llm.router)
app.include_router(automation.router)


@app.on_event("startup")
async def startup_event() -> None:
    init_db()
    # start background scheduler to run periodic LLM prompt chains (persists insights/recs)
    start_scheduler()


@app.get("/")
async def root() -> dict:
    return {"message": "Advisor MVP backend attivo"}
