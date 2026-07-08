"""
Jellyfin API client for uHomeNest media library and playback.
"""

import json
import os
import urllib.request
import urllib.parse
from typing import Any, Optional


def _jellyfin_base() -> str:
    """Return the Jellyfin server base URL from env or default."""
    return os.environ.get("JELLYFIN_URL", "http://localhost:8096")


def _jellyfin_token() -> Optional[str]:
    """Return a Jellyfin API key from env or None."""
    return os.environ.get("JELLYFIN_API_KEY")


def _jellyfin_headers() -> dict[str, str]:
    """Build auth headers for Jellyfin API requests."""
    headers: dict[str, str] = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    token = _jellyfin_token()
    if token:
        headers["X-Emby-Token"] = token
    return headers


def _api_get(path: str, params: Optional[dict] = None) -> dict[str, Any]:
    """Perform a GET request to the Jellyfin API."""
    base = _jellyfin_base().rstrip("/")
    url = f"{base}{path}"
    if params:
        qs = urllib.parse.urlencode(params)
        url = f"{url}?{qs}"
    req = urllib.request.Request(
        url, method="GET", headers=_jellyfin_headers()
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e), "Items": []}


def get_library_items(
    parent_id: Optional[str] = None,
    limit: int = 50,
    start_index: int = 0,
    include_item_types: str = "Movie,Series,MusicArtist",
) -> list[dict[str, Any]]:
    """Fetch items from the Jellyfin library.

    Uses the /Users/{userId}/Items endpoint. If no API key is
    configured, returns an empty list.
    """
    token = _jellyfin_token()
    if not token:
        return []

    # First get the default user
    users = _api_get("/Users")
    if not users or (
        isinstance(users, dict) and "error" in users
    ):
        return []
    user_list: list[dict[str, Any]] = (
        users if isinstance(users, list) else []
    )
    if not user_list:
        return []

    user_id = user_list[0].get("Id", "")
    if not user_id:
        return []

    FIELDS = (
        "Overview,Genres,ProductionYear,PremiereDate,"
        "CommunityRating,OfficialRating,MediaStreams"
    )
    params = {
        "SortBy": "SortName",
        "SortOrder": "Ascending",
        "IncludeItemTypes": include_item_types,
        "Recursive": "true",
        "Fields": FIELDS,
        "ImageTypeLimit": 1,
        "EnableImageTypes": "Primary",
        "Limit": str(limit),
        "StartIndex": str(start_index),
    }
    if parent_id:
        params["ParentId"] = parent_id

    result = _api_get(f"/Users/{user_id}/Items", params)
    if isinstance(result, dict) and "Items" in result:
        return result["Items"]
    return []


def get_item(item_id: str) -> Optional[dict[str, Any]]:
    """Fetch a single media item by ID."""
    token = _jellyfin_token()
    if not token:
        return None

    users = _api_get("/Users")
    user_list: list[dict[str, Any]] = (
        users if isinstance(users, list) else []
    )
    if not user_list:
        return None
    user_id = user_list[0].get("Id", "")
    if not user_id:
        return None

    result = _api_get(f"/Users/{user_id}/Items/{item_id}")
    if isinstance(result, dict) and "error" in result:
        return None
    return result


def get_stream_url(item_id: str) -> Optional[str]:
    """Build a direct stream URL for a media item.

    Returns None if Jellyfin is not configured.
    """
    token = _jellyfin_token()
    if not token:
        return None

    base = _jellyfin_base().rstrip("/")
    return (
        f"{base}/Videos/{item_id}/stream"
        f"?Static=true&MediaSourceId={item_id}&api_key={token}"
    )


def get_image_url(
    item_id: str, image_tag: Optional[str] = None
) -> Optional[str]:
    """Build a primary image URL for a media item."""
    token = _jellyfin_token()
    if not token:
        return None

    base = _jellyfin_base().rstrip("/")
    url = f"{base}/Items/{item_id}/Images/Primary"
    if image_tag:
        url += f"?tag={image_tag}"
    return url


def is_configured() -> bool:
    """Return True if Jellyfin URL and API key are configured."""
    return (
        bool(os.environ.get("JELLYFIN_URL"))
        and bool(os.environ.get("JELLYFIN_API_KEY"))
    )


def health_check() -> dict[str, Any]:
    """Perform a health check against Jellyfin."""
    result = _api_get("/System/Info")
    if isinstance(result, dict) and "error" in result:
        return {"online": False, "error": result["error"]}
    return {
        "online": True,
        "version": result.get("Version", "unknown"),
        "server_name": result.get("ServerName", "unknown"),
    }