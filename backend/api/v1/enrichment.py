from fastapi import APIRouter
from pydantic import BaseModel
from services.virustotal import VirusTotalService


router = APIRouter()
vt_service = VirusTotalService()


class EnrichRequest(BaseModel):
    value: str


@router.post("/enrich/hash")
async def enrich_file_hash(request: EnrichRequest):
    return await vt_service.check_file_hash(request.value)


@router.post("/enrich/ip")
async def enrich_ip_address(request: EnrichRequest):
    return await vt_service.check_ip(request.value)


@router.post("/enrich/domain")
async def enrich_domain(request: EnrichRequest):
    return await vt_service.check_domain(request.value)


