from fastapi import APIRouter, HTTPException
from typing import Dict

router = APIRouter()


@router.post("/auth/login")
async def login(credentials: Dict):
    # TODO: real auth with DB and JWT
    username = credentials.get("username")
    password = credentials.get("password")
    if username == "admin" and password == "admin":
        return {"token": "dummy-token"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


