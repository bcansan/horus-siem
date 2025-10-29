import re
import ipaddress
from typing import List, Dict, Optional
from backend.config import get_db_connection


class ThreatIntelService:
    def __init__(self):
        self.feeds = self._load_feeds()

    def _load_feeds(self) -> List[Dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, feed_name, feed_url, feed_type, enabled, last_updated, update_frequency_hours, ioc_count, metadata FROM threat_feeds WHERE enabled = true")
        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        cursor.close()
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    async def check_ioc(self, ioc_type: str, ioc_value: str) -> Optional[Dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, ioc_type, ioc_value, threat_type, severity, confidence, description, source, tags, first_seen, last_seen, is_active, metadata, created_at
            FROM threat_iocs 
            WHERE ioc_type = %s AND ioc_value = %s AND is_active = true
            ORDER BY severity DESC, confidence DESC
            LIMIT 1
            """,
            (ioc_type, ioc_value),
        )
        row = cursor.fetchone()
        cols = [d[0] for d in cursor.description] if row else []
        cursor.close()
        conn.close()
        return dict(zip(cols, row)) if row else None

    async def add_ioc(self, ioc: Dict) -> Optional[int]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO threat_iocs (
                ioc_type, ioc_value, threat_type, severity, confidence, description, source, tags, metadata
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            (
                ioc['ioc_type'],
                ioc['ioc_value'],
                ioc.get('threat_type'),
                ioc.get('severity', 'medium'),
                ioc.get('confidence', 70),
                ioc.get('description'),
                ioc.get('source', 'custom'),
                self._json_dump(ioc.get('tags', [])),
                self._json_dump(ioc.get('metadata', {})),
            ),
        )
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return row[0] if row else None

    async def enrich_event_with_threat_intel(self, event: Dict) -> Dict:
        matches: List[Dict] = []
        extracted_iocs = self._extract_iocs_from_event(event)
        for ioc in extracted_iocs:
            threat_data = await self.check_ioc(ioc['type'], ioc['value'])
            if threat_data:
                matches.append({"ioc": ioc, "threat": threat_data})
                await self._record_threat_match(event.get('id'), threat_data['id'], event.get('agent_id'), ioc)
        return {
            "event_id": event.get('id'),
            "threat_matches": matches,
            "threat_score": self._calculate_threat_score(matches),
        }

    def _extract_iocs_from_event(self, event: Dict) -> List[Dict]:
        iocs: List[Dict] = []
        data = str(event)
        ip_pattern = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
        for ip in re.findall(ip_pattern, data):
            try:
                addr = ipaddress.ip_address(ip)
                if not addr.is_private:
                    iocs.append({"type": "ip", "value": ip})
            except Exception:
                pass
        domain_pattern = r"\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b"
        for dom in re.findall(domain_pattern, data, re.IGNORECASE):
            iocs.append({"type": "domain", "value": dom.lower()})
        hash_patterns = {
            "md5": r"\b[a-fA-F0-9]{32}\b",
            "sha1": r"\b[a-fA-F0-9]{40}\b",
            "sha256": r"\b[a-fA-F0-9]{64}\b",
        }
        for _, pat in hash_patterns.items():
            for h in re.findall(pat, data):
                iocs.append({"type": "hash", "value": h.lower()})
        url_pattern = r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+"
        for url in re.findall(url_pattern, data):
            iocs.append({"type": "url", "value": url})
        return iocs

    def _calculate_threat_score(self, matches: List[Dict]) -> int:
        if not matches:
            return 0
        severity_scores = {"critical": 100, "high": 75, "medium": 50, "low": 25}
        max_score = 0
        for m in matches:
            sev = (m['threat'].get('severity') or 'low').lower()
            conf = int(m['threat'].get('confidence') or 50)
            score = severity_scores.get(sev, 25) * (conf / 100)
            if score > max_score:
                max_score = score
        return int(max_score)

    async def _record_threat_match(self, event_id: str, ioc_id: int, agent_id: str, context: Dict):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO threat_matches (event_id, ioc_id, agent_id, context) VALUES (%s, %s, %s, %s::jsonb)",
            (event_id, ioc_id, agent_id, self._json_dump(context)),
        )
        conn.commit()
        cursor.close()
        conn.close()

    async def update_feed(self, feed_name: str):
        return

    async def import_iocs_from_file(self, file_path: str, source: str):
        import csv
        conn = get_db_connection()
        cursor = conn.cursor()
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute(
                    """
                    INSERT INTO threat_iocs (ioc_type, ioc_value, threat_type, severity, description, source, confidence)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        row['ioc_type'],
                        row['ioc_value'],
                        row.get('threat_type'),
                        row.get('severity', 'medium'),
                        row.get('description'),
                        source,
                        int(row.get('confidence', 80)),
                    ),
                )
        conn.commit()
        cursor.close()
        conn.close()

    def _json_dump(self, obj) -> str:
        import json
        return json.dumps(obj)


