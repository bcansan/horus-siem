from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class Agent(BaseModel):
    id: Optional[UUID] = None
    agent_name: str
    hostname: str
    ip_address: Optional[str] = None
    os_type: str
    os_version: Optional[str] = None
    agent_version: str
    status: str = "online"
    last_heartbeat: Optional[datetime] = None
    first_seen: Optional[datetime] = None
    tags: List[str] = []
    metadata: Dict = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AgentMetrics(BaseModel):
    agent_id: UUID
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    events_sent_last_hour: int
    events_sent_total: int
    timestamp: Optional[datetime] = None


class AgentStats(BaseModel):
    id: UUID
    agent_name: str
    hostname: str
    status: str
    total_events_24h: int
    alerts_generated_24h: int
    last_event_time: Optional[datetime]


