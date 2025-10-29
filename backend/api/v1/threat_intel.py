from fastapi import APIRouter, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
from backend.services.threat_intel import ThreatIntelService
from backend.config import get_db_connection


router = APIRouter()
threat_service = ThreatIntelService()


class IOCRequest(BaseModel):
    ioc_type: str
    ioc_value: str


class AddIOCRequest(BaseModel):
    ioc_type: str
    ioc_value: str
    threat_type: Optional[str] = None
    severity: str = "medium"
    confidence: int = 70
    description: Optional[str] = None
    source: str = "custom"
    tags: List[str] = []


@router.post("/threat-intel/check")
async def check_ioc(request: IOCRequest):
    result = await threat_service.check_ioc(request.ioc_type, request.ioc_value)
    if not result:
        return {"found": False, "ioc": request.ioc_value}
    return {"found": True, "threat_data": result}


@router.post("/threat-intel/add")
async def add_ioc(ioc: AddIOCRequest):
    ioc_id = await threat_service.add_ioc(ioc.dict())
    return {"status": "added", "ioc_id": ioc_id}


@router.get("/threat-intel/iocs")
async def get_iocs(ioc_type: Optional[str] = None, severity: Optional[str] = None, is_active: bool = True, limit: int = 100):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT id, ioc_type, ioc_value, threat_type, severity, confidence, description, source, tags, first_seen, last_seen, is_active, metadata, created_at FROM threat_iocs WHERE 1=1"
    params = []
    if ioc_type:
        query += " AND ioc_type = %s"
        params.append(ioc_type)
    if severity:
        query += " AND severity = %s"
        params.append(severity)
    query += " AND is_active = %s"
    params.append(is_active)
    query += f" ORDER BY created_at DESC LIMIT {int(limit)}"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cols = [d[0] for d in cursor.description]
    cursor.close()
    conn.close()
    return {"iocs": [dict(zip(cols, r)) for r in rows], "count": len(rows)}


@router.get("/threat-intel/matches")
async def get_threat_matches(hours: int = 24):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT tm.id, tm.event_id, tm.ioc_id, tm.agent_id, tm.matched_at, tm.context,
               ti.ioc_type, ti.ioc_value, ti.threat_type, ti.severity,
               a.hostname
        FROM threat_matches tm
        JOIN threat_iocs ti ON tm.ioc_id = ti.id
        LEFT JOIN agents a ON tm.agent_id = a.id
        WHERE tm.matched_at > NOW() - INTERVAL '%s hours'
        ORDER BY tm.matched_at DESC
        LIMIT 100
        """,
        (hours,),
    )
    rows = cursor.fetchall()
    cols = [d[0] for d in cursor.description]
    cursor.close()
    conn.close()
    return {"matches": [dict(zip(cols, r)) for r in rows], "hours": hours}


@router.post("/threat-intel/import")
async def import_iocs(file: UploadFile = File(...), source: str = "upload"):
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    await threat_service.import_iocs_from_file(file_path, source)
    import os as _os
    _os.remove(file_path)
    return {"status": "imported", "source": source}


@router.get("/threat-intel/stats")
async def get_threat_intel_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            COUNT(*) as total_iocs,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_iocs,
            COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_iocs,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_iocs,
            COUNT(DISTINCT ioc_type) as ioc_types,
            COUNT(DISTINCT source) as sources
        FROM threat_iocs
        """
    )
    stats_row = cursor.fetchone()
    cols = [d[0] for d in cursor.description]
    stats = dict(zip(cols, stats_row)) if stats_row else {}
    cursor.execute("SELECT COUNT(*) FROM threat_matches WHERE matched_at > NOW() - INTERVAL '24 hours'")
    matches_24h = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return {"stats": stats, "matches_24h": matches_24h}


