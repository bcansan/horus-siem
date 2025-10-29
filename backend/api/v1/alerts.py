from fastapi import APIRouter
from typing import List, Dict

router = APIRouter()


@router.get("/alerts")
async def list_alerts() -> List[Dict]:
    # TODO: replace with DB query
    return []


