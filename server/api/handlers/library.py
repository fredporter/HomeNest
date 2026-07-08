"""Library handler — serves enriched media library data for the console."""

from urllib.parse import parse_qs

from modules.media.library import (
    fetch_library,
    fetch_detail,
    fetch_health,
)


def get_library(query_string: str = "") -> dict:
    """GET /api/library/media/
    Returns { items: [...], categories: [...], jellyfin_online: bool }
    """
    query = parse_qs(query_string)
    limit = int(query.get("limit", ["50"])[0])
    start = int(query.get("start", ["0"])[0])
    media_type = query.get("type", [None])[0]
    return fetch_library(limit=limit, start_index=start, media_type=media_type)


def get_item(item_id: str) -> dict:
    """GET /api/library/media/:id
    Returns enriched detail for a single media item.
    """
    result = fetch_detail(item_id)
    if result is None:
        return {"error": "item not found"}
    return result


def get_media_health() -> dict:
    """GET /api/media/health
    Returns Jellyfin connection status.
    """
    return fetch_health()