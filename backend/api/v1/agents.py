from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from uuid import UUID
from backend.models.agent import Agent, AgentMetrics
from backend.config import get_db_connection


router = APIRouter()


@router.get("/agents")
async def get_agents(
    status: Optional[str] = None,
    os_type: Optional[str] = None,
    tags: Optional[str] = None,
):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT id, agent_name, hostname, ip_address, os_type, os_version, agent_version, status, last_heartbeat, first_seen, tags, metadata, created_at, updated_at FROM agents WHERE 1=1"
    params: List = []
    if status:
        query += " AND status = %s"
        params.append(status)
    if os_type:
        query += " AND os_type = %s"
        params.append(os_type)
    if tags:
        query += " AND tags @> %s::jsonb"
        params.append(f'[
"{tags}"
]')
    query += " ORDER BY hostname ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cols = [d[0] for d in cursor.description]
    cursor.close()
    conn.close()
    return [dict(zip(cols, r)) for r in rows]


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: UUID):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, agent_name, hostname, ip_address, os_type, os_version, agent_version, status, last_heartbeat, first_seen, tags, metadata, created_at, updated_at FROM agents WHERE id = %s", (str(agent_id),))
    row = cursor.fetchone()
    cols = [d[0] for d in cursor.description] if row else []
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Agent not found")
    return dict(zip(cols, row))


@router.get("/agents/{agent_id}/metrics")
async def get_agent_metrics(agent_id: UUID, hours: int = Query(24, ge=1, le=168)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, agent_id, cpu_usage, memory_usage, disk_usage, events_sent_last_hour, events_sent_total, timestamp
        FROM agent_metrics 
        WHERE agent_id = %s AND timestamp > NOW() - INTERVAL '%s hours'
        ORDER BY timestamp ASC
        """,
        (str(agent_id), hours),
    )
    rows = cursor.fetchall()
    cols = [d[0] for d in cursor.description]
    cursor.close()
    conn.close()
    return {"agent_id": str(agent_id), "metrics": [dict(zip(cols, r)) for r in rows], "hours": hours}


@router.get("/agents/stats/summary")
async def get_agents_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY agent_stats")
    cursor.execute(
        """
        SELECT 
            COUNT(*) as total_agents,
            COUNT(CASE WHEN status = 'online' THEN 1 END) as online_agents,
            COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_agents,
            COUNT(CASE WHEN status = 'error' THEN 1 END) as error_agents,
            SUM(total_events_24h) as total_events_24h,
            SUM(alerts_generated_24h) as total_alerts_24h
        FROM agent_stats
        """
    )
    summary_row = cursor.fetchone()
    cols = [d[0] for d in cursor.description]
    summary = dict(zip(cols, summary_row)) if summary_row else {}
    cursor.execute(
        """
        SELECT agent_name, hostname, total_events_24h, alerts_generated_24h
        FROM agent_stats
        ORDER BY total_events_24h DESC
        LIMIT 10
        """
    )
    top_rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"summary": summary, "top_agents": [
        {"agent_name": r[0], "hostname": r[1], "total_events_24h": r[2], "alerts_generated_24h": r[3]} for r in top_rows
    ]}


@router.post("/agents/{agent_id}/heartbeat")
async def agent_heartbeat(agent_id: UUID, metrics: AgentMetrics):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE agents 
        SET last_heartbeat = NOW(), status = 'online', updated_at = NOW()
        WHERE id = %s
        """,
        (str(agent_id),),
    )
    cursor.execute(
        """
        INSERT INTO agent_metrics (
            agent_id, cpu_usage, memory_usage, disk_usage, events_sent_last_hour, events_sent_total
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            str(agent_id),
            metrics.cpu_usage,
            metrics.memory_usage,
            metrics.disk_usage,
            metrics.events_sent_last_hour,
            metrics.events_sent_total,
        ),
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "ok", "message": "Heartbeat received"}


@router.post("/agents/register")
async def register_agent(agent: Agent):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO agents (
            agent_name, hostname, ip_address, os_type, os_version, agent_version, tags, metadata
        ) VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
        ON CONFLICT (agent_name) DO UPDATE SET 
            hostname = EXCLUDED.hostname,
            ip_address = EXCLUDED.ip_address,
            last_heartbeat = NOW(),
            status = 'online',
            updated_at = NOW()
        RETURNING id
        """,
        (
            agent.agent_name,
            agent.hostname,
            agent.ip_address,
            agent.os_type,
            agent.os_version,
            agent.agent_version,
            json_dumps(agent.tags),
            json_dumps(agent.metadata),
        ),
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return {"agent_id": row[0], "status": "registered"}


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: UUID):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM agents WHERE id = %s", (str(agent_id),))
    deleted = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"status": "deleted"}


# helpers
def json_dumps(obj) -> str:
    import json as _json
    return _json.dumps(obj)


