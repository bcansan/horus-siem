#!/usr/bin/env python3
import os
import time
import json
import uuid
import yaml
import queue
import sqlite3
import requests
import platform
from pathlib import Path
from typing import Dict, List


CONFIG_PATH = Path(__file__).parent / 'agent_config.yml'
DB_PATH = Path.home() / '.horus_agent.db'


def load_config() -> Dict:
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS buffer (id TEXT PRIMARY KEY, payload TEXT NOT NULL)")
    conn.commit()
    conn.close()


def collect_events(cfg: Dict) -> List[Dict]:
    events: List[Dict] = []
    now = int(time.time())
    events.append({
        "@ts": now,
        "host": platform.node(),
        "os": platform.system(),
        "agent": "horus",
        "message": "heartbeat"
    })
    return events


def buffer_events(events: List[Dict]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for ev in events:
        doc_id = str(uuid.uuid4())
        cur.execute("INSERT INTO buffer (id, payload) VALUES (?, ?)", (doc_id, json.dumps(ev)))
    conn.commit()
    conn.close()


def flush_buffer(cfg: Dict):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, payload FROM buffer LIMIT 500")
    rows = cur.fetchall()
    if not rows:
        conn.close()
        return

    events = [json.loads(r[1]) for r in rows]
    try:
        url = cfg['server']['url'].rstrip('/') + '/api/v1/ingest'
        headers = {'x-api-key': cfg['server']['api_key']}
        resp = requests.post(url, json=events, headers=headers, timeout=10)
        resp.raise_for_status()
        ids = tuple(r[0] for r in rows)
        cur.executemany("DELETE FROM buffer WHERE id = ?", [(i,) for i in ids])
        conn.commit()
    finally:
        conn.close()


def main():
    init_db()
    cfg = load_config()
    interval = int(cfg.get('agent', {}).get('interval_seconds', 30))

    while True:
        try:
            events = collect_events(cfg)
            buffer_events(events)
            flush_buffer(cfg)
        except Exception:
            # mantén eventos en buffer para reintento
            pass
        time.sleep(interval)


if __name__ == '__main__':
    main()


