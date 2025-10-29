from typing import Dict


def enrich_event(event: Dict) -> Dict:
    event = dict(event)
    event.setdefault("horus", {})
    event["horus"]["ingested"] = True
    return event


