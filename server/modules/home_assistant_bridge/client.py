"""
Home Assistant REST API client for uHomeNest automation.
"""

import json
import os
import urllib.request
from typing import Any, Optional


def _ha_base() -> str:
    return os.environ.get("HA_URL", "http://localhost:8123")


def _ha_token() -> Optional[str]:
    return os.environ.get("HA_TOKEN")


def _ha_headers() -> dict[str, str]:
    headers: dict[str, str] = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    token = _ha_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _api_get(path: str) -> dict[str, Any]:
    base = _ha_base().rstrip("/")
    url = f"{base}{path}"
    req = urllib.request.Request(
        url, method="GET", headers=_ha_headers()
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e)}


def _api_post(path: str, body: Optional[dict] = None) -> dict[str, Any]:
    base = _ha_base().rstrip("/")
    url = f"{base}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(
        url, data=data, method="POST", headers=_ha_headers()
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e)}


def is_configured() -> bool:
    return bool(os.environ.get("HA_URL")) and bool(os.environ.get("HA_TOKEN"))


def get_scenes() -> list[dict[str, Any]]:
    """Fetch all HA scenes."""
    if not is_configured():
        return []
    result = _api_get("/api/states")
    if isinstance(result, dict) and "error" in result:
        return []
    scenes: list[dict[str, Any]] = []
    for entity in result if isinstance(result, list) else []:
        if entity.get("entity_id", "").startswith("scene."):
            state = entity.get("state", "unknown")
            scenes.append({
                "id": entity["entity_id"],
                "name": (
                    entity.get("attributes", {})
                    .get("friendly_name", entity["entity_id"])
                ),
                "icon": "stars",
                "active": state == "on",
            })
    return scenes


def get_entities() -> list[dict[str, Any]]:
    """Fetch relevant HA entities (lights, switches, climate, locks)."""
    if not is_configured():
        return []
    result = _api_get("/api/states")
    if isinstance(result, dict) and "error" in result:
        return []
    RELEVANT = {
        "light": "light",
        "switch": "switch",
        "climate": "climate",
        "lock": "lock",
        "media_player": "media_player",
    }
    entities: list[dict[str, Any]] = []
    for entity in result if isinstance(result, list) else []:
        eid = entity.get("entity_id", "")
        domain = eid.split(".")[0] if "." in eid else ""
        if domain in RELEVANT:
            entities.append({
                "id": eid,
                "name": (
                    entity.get("attributes", {})
                    .get("friendly_name", eid)
                ),
                "state": entity.get("state", "unknown"),
                "type": RELEVANT[domain],
            })
    return entities


def activate_scene(scene_id: str) -> dict[str, Any]:
    """Turn on a scene."""
    if not is_configured():
        return {"error": "HA not configured"}
    return _api_post("/api/services/scene/turn_on", {
        "entity_id": scene_id,
    })


def toggle_entity(entity_id: str) -> dict[str, Any]:
    """Toggle a light or switch entity."""
    if not is_configured():
        return {"error": "HA not configured"}
    domain = entity_id.split(".")[0] if "." in entity_id else ""
    service = "toggle" if domain in ("light", "switch") else "toggle"
    return _api_post(f"/api/services/{domain}/{service}", {
        "entity_id": entity_id,
    })


def health_check() -> dict[str, Any]:
    if not is_configured():
        return {"online": False, "error": "HA not configured"}
    result = _api_get("/api/")
    if isinstance(result, dict) and "error" in result:
        return {"online": False, "error": result["error"]}
    return {
        "online": True,
        "version": result.get("location_name", "unknown"),
    }