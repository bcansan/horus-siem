import os
import json
from typing import Dict, List
from datetime import datetime

try:
    from anthropic import Anthropic
except Exception:  # pragma: no cover
    Anthropic = None  # type: ignore


class AIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.model = os.getenv('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514')
        self.client = Anthropic(api_key=self.api_key) if (self.api_key and Anthropic) else None

    def _format_events(self, events: List[Dict]) -> str:
        formatted = []
        for event in events[:10]:
            formatted.append(f"""
- Timestamp: {event.get('timestamp')}
- Host: {event.get('hostname')}
- Event Type: {event.get('event_type')}
- Severity: {event.get('severity')}
- Details: {json.dumps(event.get('parsed_data', {}), indent=2)[:500]}
""")
        return "\n".join(formatted)

    async def analyze_alert(self, alert: Dict, related_events: List[Dict]) -> Dict:
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""Eres un analista SOC experto. Analiza esta alerta de seguridad y proporciona un análisis detallado.

ALERTA:
- ID: {alert.get('id')}
- Título: {alert.get('title')}
- Severidad: {alert.get('severity')}
- Descripción: {alert.get('description')}
- Estado: {alert.get('status')}

EVENTOS RELACIONADOS:
{self._format_events(related_events)}

Proporciona tu análisis en formato JSON con esta estructura exacta:
{{
  "summary": "Resumen ejecutivo en 2-3 frases del incidente",
  "severity_assessment": "critical|high|medium|low",
  "threat_classification": "Tipo de amenaza detectada",
  "mitre_tactics": ["T1059.001", "T1003"],
  "indicators_of_compromise": {{
    "ips": ["IP1", "IP2"],
    "domains": ["domain1.com"],
    "hashes": ["hash1", "hash2"],
    "processes": ["process1.exe"]
  }},
  "recommended_actions": [
    "Acción 1 prioritaria",
    "Acción 2",
    "Acción 3"
  ],
  "investigation_steps": [
    "1. Paso de investigación detallado",
    "2. Siguiente paso",
    "3. Paso final"
  ],
  "risk_score": 85,
  "confidence": 92,
  "analysis_notes": "Notas adicionales del análisis"
}}

Responde SOLO con el JSON, sin texto adicional."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text  # type: ignore
            analysis = json.loads(response_text)
            analysis['analyzed_at'] = datetime.now().isoformat()
            usage = getattr(message, 'usage', None)
            tokens_used = getattr(usage, 'input_tokens', 0) + getattr(usage, 'output_tokens', 0) if usage else None
            analysis['model_used'] = self.model
            analysis['tokens_used'] = tokens_used
            return analysis
        except Exception as e:  # pragma: no cover
            return {"error": f"AI analysis failed: {str(e)}"}

    async def explain_event(self, event: Dict) -> str:
        if not self.client:
            return "AI service not configured"

        prompt = f"""Explica este evento de seguridad en lenguaje sencillo para un analista SOC:

Evento:
{json.dumps(event, indent=2)}

Proporciona:
1. Qué ocurrió
2. Por qué es importante
3. Qué debería revisar el analista

Responde en español, máximo 150 palabras."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text  # type: ignore
        except Exception as e:  # pragma: no cover
            return f"Error: {str(e)}"


