from fastapi import APIRouter, HTTPException, Header
from typing import List, Dict
import logging
import json
import uuid
import redis

from config import settings

router = APIRouter()

redis_client = redis.from_url(settings.redis_url)


@router.post("/ingest")
async def ingest_logs(
    events: List[Dict],
    x_api_key: str = Header(...)
):
    # TODO: validar API key real desde DB
    if not x_api_key or len(x_api_key) < 16:
        raise HTTPException(status_code=401, detail="Invalid API key")

    try:
        batch_id = str(uuid.uuid4())
        payload = json.dumps({"batch_id": batch_id, "events": events})
        redis_client.lpush("horus:ingest", payload)
        return {"status": "accepted", "batch_id": batch_id, "count": len(events)}
    except Exception as e:
        logging.exception("Failed to enqueue events")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    return {"status": "healthy"}


