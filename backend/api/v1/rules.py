from fastapi import APIRouter
from typing import List, Dict
import os
import yaml

router = APIRouter()


def load_rules() -> List[Dict]:
    rules_root = os.path.abspath(os.path.join(os.getcwd(), "rules", "detection"))
    items: List[Dict] = []
    if not os.path.isdir(rules_root):
        return items
    for name in os.listdir(rules_root):
        if name.endswith(".yml") or name.endswith(".yaml"):
            path = os.path.join(rules_root, name)
            with open(path, "r", encoding="utf-8") as f:
                items.append(yaml.safe_load(f) or {})
    return items


@router.get("/rules")
async def list_rules() -> List[Dict]:
    return load_rules()


