"""Playback handler — start, stop, pause, resume, seek, volume.

Accepts JSON body for all operations. Integrates with Jellyfin client
for stream URLs and session state tracking via in-memory store.
"""

from urllib.parse import parse_qs

from handlers.state import (
    clear_now_playing,
    set_now_playing,
    update_playback_state,
    set_volume,
)
from modules.media.jellyfin_client import get_stream_url
from modules.media.library import fetch_detail


def post_start(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/start

    Body: { "mediaId": "...", "target": "default" }
    Response includes stream_url from Jellyfin.
    """
    media_id: str = ""
    target: str = "default"

    if body and isinstance(body, dict):
        media_id = body.get("mediaId", "")
        target = body.get("target", "default")
    else:
        query = parse_qs(query_string)
        media_id = query.get("mediaId", query.get("media", [""]))[0]
        target = query.get("target", ["default"])[0]

    # Try to get enriched detail for the now-playing state
    detail = fetch_detail(media_id) if media_id else None
    title = detail.get("title", media_id) if detail else media_id

    stream_url = get_stream_url(media_id) if media_id else None

    state = set_now_playing(
        target=target,
        media=title,
        media_id=media_id,
    )
    if stream_url:
        state["stream_url"] = stream_url

    return {
        "status": "started",
        "target": target,
        "media_id": media_id,
        "title": title,
        "stream_url": stream_url,
        "now_playing": state,
    }


def post_stop(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/stop"""
    target: str = "default"
    if body and isinstance(body, dict):
        target = body.get("target", "default")
    else:
        query = parse_qs(query_string)
        target = query.get("target", ["default"])[0]

    state = clear_now_playing(target=target)
    return {
        "status": "stopped",
        "target": target,
        "now_playing": state,
    }


def post_pause(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/pause"""
    state = update_playback_state(is_playing=False)
    return {"status": "paused", "now_playing": state}


def post_resume(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/resume"""
    state = update_playback_state(is_playing=True)
    return {"status": "playing", "now_playing": state}


def post_seek(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/seek

    Body: { "position": 0.0 }  0.0–100.0 percentage
    """
    pos: float = 0.0
    if body and isinstance(body, dict):
        pos = float(body.get("position", 0.0))
    state = update_playback_state(progress=pos)
    return {"status": "seeked", "position": pos, "now_playing": state}


def post_volume(
    query_string: str = "",
    body: dict | None = None,
) -> dict:
    """POST /api/playback/volume

    Body: { "volume": 80 }  0–100
    """
    vol: int = 80
    if body and isinstance(body, dict):
        vol = int(body.get("volume", 80))
    state = set_volume(vol)
    return {"status": "volume_set", "volume": vol, "now_playing": state}