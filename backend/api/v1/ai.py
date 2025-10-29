from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from services.ai_analyzer import AIAnalyzer


router = APIRouter()
ai_analyzer = AIAnalyzer()


class AnalyzeAlertRequest(BaseModel):
    alert: Dict
    related_events: List[Dict]


class ExplainEventRequest(BaseModel):
    event: Dict


@router.post("/ai/analyze-alert")
async def analyze_alert(request: AnalyzeAlertRequest):
    return await ai_analyzer.analyze_alert(request.alert, request.related_events)


@router.post("/ai/explain-event")
async def explain_event(request: ExplainEventRequest):
    explanation = await ai_analyzer.explain_event(request.event)
    return {"explanation": explanation}


