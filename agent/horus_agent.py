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
import threading

try:
    import psutil  # type: ignore
except Exception:
    psutil = None  # type: ignore


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


def send_heartbeat(cfg: Dict, counters: Dict[str, int]):
    try:
        agent_id = cfg.get('agent', {}).get('id')
        if not agent_id:
            return False
        server_url = cfg['server']['url'].rstrip('/')
        api_key = cfg['server']['api_key']
        metrics = {
            "agent_id": agent_id,
            "cpu_usage": float(psutil.cpu_percent()) if psutil else 0.0,
            "memory_usage": float(psutil.virtual_memory().percent) if psutil else 0.0,
            "disk_usage": float(psutil.disk_usage('/').percent) if psutil else 0.0,
            "events_sent_last_hour": counters.get('events_last_hour', 0),
            "events_sent_total": counters.get('events_total', 0),
        }
        resp = requests.post(
            f"{server_url}/api/v1/agents/{agent_id}/heartbeat",
            json=metrics,
            headers={"x-api-key": api_key},
            timeout=5,
        )
        return resp.status_code == 200
    except Exception:
        return False


def main():
    init_db()
    cfg = load_config()
    interval = int(cfg.get('agent', {}).get('interval_seconds', 30))
    heartbeat_interval = 60
    last_hb = 0
    counters = {"events_last_hour": 0, "events_total": 0}

    while True:
        try:
            events = collect_events(cfg)
            buffer_events(events)
            flush_buffer(cfg)
            counters["events_total"] += len(events)
        except Exception:
            # mantén eventos en buffer para reintento
            pass
        now = int(time.time())
        if now - last_hb >= heartbeat_interval:
            send_heartbeat(cfg, counters)
            last_hb = now
        time.sleep(interval)


if __name__ == '__main__':
    main()


