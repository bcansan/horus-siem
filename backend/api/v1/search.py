from fastapi import APIRouter, Query
from typing import Any, Dict
from elasticsearch import Elasticsearch

from config import settings

router = APIRouter()

es = Elasticsearch(settings.elasticsearch_url)


@router.get("/search")
async def search_logs(q: str = Query("*"), index: str = Query("horus-*"), size: int = 50) -> Dict[str, Any]:
    body = {"query": {"query_string": {"query": q}}}
    res = es.search(index=index, body=body, size=size)
    return res


