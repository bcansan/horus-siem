from typing import Dict, List


def evaluate_rules(event: Dict, rules: List[Dict]) -> List[Dict]:
    alerts: List[Dict] = []
    for rule in rules:
        # TODO: implementar motor de reglas real (YAML -> condiciones)
        if rule.get("match_all"):
            alerts.append({"rule": rule.get("id", rule.get("name")), "event": event})
    return alerts


