import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.v1.ingest import router as ingest_router
from api.v1.search import router as search_router
from api.v1.alerts import router as alerts_router
from api.v1.rules import router as rules_router
from api.v1.auth import router as auth_router
from api.v1 import enrichment, ai, agents, threat_intel

app = FastAPI(title="HORUS SIEM/SOC", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

# API routes
app.include_router(ingest_router, prefix="/api/v1", tags=["ingest"])
app.include_router(search_router, prefix="/api/v1", tags=["search"])
app.include_router(alerts_router, prefix="/api/v1", tags=["alerts"])
app.include_router(rules_router, prefix="/api/v1", tags=["rules"])
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(enrichment.router, prefix="/api/v1", tags=["enrichment"])
app.include_router(ai.router, prefix="/api/v1", tags=["ai"])
app.include_router(agents.router, prefix="/api/v1", tags=["agents"])
app.include_router(threat_intel.router, prefix="/api/v1", tags=["threat-intel"])


