import os
import requests
from typing import Dict, Optional
import redis
import json


class VirusTotalService:
    def __init__(self):
        self.api_key = os.getenv('VIRUSTOTAL_API_KEY')
        self.base_url = "https://www.virustotal.com/api/v3"
        self.rate_limit = int(os.getenv('VIRUSTOTAL_RATE_LIMIT', '4'))
        self.redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
        self.cache_ttl = 86400  # 24h

    def _get_cache_key(self, indicator_type: str, value: str) -> str:
        return f"vt:{indicator_type}:{value}"

    def _check_cache(self, cache_key: str) -> Optional[Dict]:
        cached = self.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        return None

    def _set_cache(self, cache_key: str, data: Dict):
        self.redis_client.setex(cache_key, self.cache_ttl, json.dumps(data))

    def _guard(self) -> Optional[Dict]:
        if not os.getenv('ENABLE_VIRUSTOTAL', 'true').lower() in ('1', 'true', 'yes'):
            return {"error": "VirusTotal integration disabled"}
        if not self.api_key:
            return {"error": "VIRUSTOTAL_API_KEY not configured"}
        return None

    async def check_file_hash(self, file_hash: str) -> Dict:
        guard = self._guard()
        if guard:
            return guard
        cache_key = self._get_cache_key('hash', file_hash)
        cached = self._check_cache(cache_key)
        if cached:
            return cached
        headers = {"x-apikey": self.api_key}
        url = f"{self.base_url}/files/{file_hash}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                attributes = data['data']['attributes']
                stats = attributes.get('last_analysis_stats', {})
                malicious = int(stats.get('malicious', 0))
                undetected = int(stats.get('undetected', 0))
                result = {
                    "hash": file_hash,
                    "found": True,
                    "malicious": malicious > 0,
                    "detection_ratio": f"{malicious}/{malicious + undetected if (malicious + undetected) else malicious}",
                    "vendors_detected": malicious,
                    "file_type": attributes.get('type_description', 'Unknown'),
                    "names": (attributes.get('names') or [])[:5],
                    "first_seen": attributes.get('first_submission_date'),
                    "last_analysis": attributes.get('last_analysis_date'),
                    "reputation_score": attributes.get('reputation', 0),
                    "vt_link": f"https://www.virustotal.com/gui/file/{file_hash}",
                }
                self._set_cache(cache_key, result)
                return result
            elif response.status_code == 404:
                return {"hash": file_hash, "found": False, "message": "Hash not found in VirusTotal"}
            else:
                return {"hash": file_hash, "error": f"VT API error: {response.status_code}"}
        except Exception as e:
            return {"hash": file_hash, "error": str(e)}

    async def check_ip(self, ip_address: str) -> Dict:
        guard = self._guard()
        if guard:
            return guard
        cache_key = self._get_cache_key('ip', ip_address)
        cached = self._check_cache(cache_key)
        if cached:
            return cached
        headers = {"x-apikey": self.api_key}
        url = f"{self.base_url}/ip_addresses/{ip_address}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                attributes = data['data']['attributes']
                stats = attributes.get('last_analysis_stats', {})
                malicious = int(stats.get('malicious', 0))
                undetected = int(stats.get('undetected', 0))
                result = {
                    "ip": ip_address,
                    "found": True,
                    "malicious": malicious > 0,
                    "detection_ratio": f"{malicious}/{malicious + undetected if (malicious + undetected) else malicious}",
                    "country": attributes.get('country', 'Unknown'),
                    "asn": attributes.get('asn', 'Unknown'),
                    "as_owner": attributes.get('as_owner', 'Unknown'),
                    "reputation_score": attributes.get('reputation', 0),
                    "vt_link": f"https://www.virustotal.com/gui/ip-address/{ip_address}",
                }
                self._set_cache(cache_key, result)
                return result
            elif response.status_code == 404:
                return {"ip": ip_address, "found": False}
            else:
                return {"ip": ip_address, "error": f"VT API error: {response.status_code}"}
        except Exception as e:
            return {"ip": ip_address, "error": str(e)}

    async def check_domain(self, domain: str) -> Dict:
        guard = self._guard()
        if guard:
            return guard
        cache_key = self._get_cache_key('domain', domain)
        cached = self._check_cache(cache_key)
        if cached:
            return cached
        headers = {"x-apikey": self.api_key}
        url = f"{self.base_url}/domains/{domain}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                attributes = data['data']['attributes']
                stats = attributes.get('last_analysis_stats', {})
                malicious = int(stats.get('malicious', 0))
                undetected = int(stats.get('undetected', 0))
                result = {
                    "domain": domain,
                    "found": True,
                    "malicious": malicious > 0,
                    "detection_ratio": f"{malicious}/{malicious + undetected if (malicious + undetected) else malicious}",
                    "reputation_score": attributes.get('reputation', 0),
                    "categories": attributes.get('categories', {}),
                    "vt_link": f"https://www.virustotal.com/gui/domain/{domain}",
                }
                self._set_cache(cache_key, result)
                return result
            elif response.status_code == 404:
                return {"domain": domain, "found": False}
            else:
                return {"domain": domain, "error": f"VT API error: {response.status_code}"}
        except Exception as e:
            return {"domain": domain, "error": str(e)}


