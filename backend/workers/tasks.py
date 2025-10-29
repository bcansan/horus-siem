import json
import os
import time
from celery import Celery
from elasticsearch import Elasticsearch

broker_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery("horus", broker=broker_url, backend=broker_url)

es = Elasticsearch(os.getenv("ELASTICSEARCH_URL", "http://localhost:9200"))


@app.task
def index_events(payload: str):
    data = json.loads(payload)
    batch_id = data.get("batch_id")
    events = data.get("events", [])
    index = time.strftime("horus-%Y.%m.%d")
    actions = [{"index": {"_index": index}}, *({"doc": e} for e in events)]
    # Fallback to simple indexing if bulk helper is not used
    for event in events:
        es.index(index=index, document=event)
    return {"batch_id": batch_id, "count": len(events)}


