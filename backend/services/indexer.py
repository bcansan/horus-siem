import os
import json
import redis
from workers.tasks import index_events

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))


def run_queue_consumer():
    while True:
        _, payload = redis_client.brpop("horus:ingest")
        index_events.delay(payload.decode("utf-8"))


