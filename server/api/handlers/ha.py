"""Home Assistant handler — scenes, entities, and bridge status."""

from modules.home_assistant_bridge.client import (
    get_scenes,
    get_entities,
    activate_scene,
    toggle_entity,
    is_configured,
    health_check,
)


def get_ha_status(_query: str = "") -> dict:
    """GET /api/ha/status"""
    scenes = get_scenes()
    entities = get_entities()
    online = is_configured() and health_check().get("online", False)
    return {
        "scenes": scenes,
        "entities": entities,
        "ha_online": online,
    }


def post_scene_activate(
    scene_id: str, body: dict | None = None
) -> dict:
    """POST /api/ha/scenes/:id/activate"""
    result = activate_scene(scene_id)
    if "error" in result:
        return {"error": result["error"]}
    return {"status": "activated", "scene_id": scene_id}


def post_entity_toggle(
    entity_id: str, body: dict | None = None
) -> dict:
    """POST /api/ha/entities/:id/toggle"""
    result = toggle_entity(entity_id)
    if "error" in result:
        return {"error": result["error"]}
    return {"status": "toggled", "entity_id": entity_id}