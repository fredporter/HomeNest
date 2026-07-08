"""Jellyfin Live TV client — channels, EPG, recordings."""

from typing import Any, Optional

from modules.media.jellyfin_client import _api_get, get_image_url


def get_live_tv_channels() -> list[dict[str, Any]]:
    """Fetch Live TV channels from Jellyfin."""
    result = _api_get("/LiveTv/Channels")
    if isinstance(result, dict) and "error" in result:
        return []
    items = result.get("Items", []) if isinstance(result, dict) else []
    channels: list[dict[str, Any]] = []
    for ch in items:
        image_tag = None
        if ch.get("ImageTags") and ch["ImageTags"].get("Primary"):
            image_tag = ch["ImageTags"]["Primary"]
        channels.append({
            "id": ch.get("Id", ""),
            "name": ch.get("Name", "Unknown"),
            "number": ch.get("Number", ""),
            "image_url": (
                get_image_url(ch.get("Id", ""), image_tag)
                if ch.get("Id") else None
            ),
            "channel_type": ch.get("ChannelType", "TV"),
        })
    return channels


def get_programme_schedule(
    channel_ids: Optional[list[str]] = None,
) -> dict[str, list[dict[str, Any]]]:
    """Fetch programme schedules for given channels.

    Returns dict keyed by channel_id.
    """
    result: dict[str, list[dict[str, Any]]] = {}

    channels = get_live_tv_channels()
    target_ids: set[str] = set(
        channel_ids if channel_ids else [c["id"] for c in channels]
    )

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    start_time = now.isoformat()
    # 6 hours of schedule
    end = now.replace(hour=((now.hour + 6) % 24))
    end_time = end.isoformat()

    for ch in channels:
        ch_id = ch["id"]
        if ch_id not in target_ids:
            continue

        params = {
            "ChannelId": ch_id,
            "StartTime": start_time,
            "EndTime": end_time,
            "UserId": "",  # filled by _api_get if needed
        }
        epg_result = _api_get("/LiveTv/Programs", params)
        items = (
            epg_result.get("Items", [])
            if isinstance(epg_result, dict)
            else []
        )
        programmes: list[dict[str, Any]] = []
        for prog in items:
            start = prog.get("StartDate", "")
            end_dt = prog.get("EndDate", "")
            # Format times as HH:MM
            start_short = start[11:16] if len(start) >= 16 else ""
            end_short = end_dt[11:16] if len(end_dt) >= 16 else ""
            programmes.append({
                "id": prog.get("Id", ""),
                "title": prog.get("Name", "Untitled"),
                "start_time": start,
                "end_time": end_dt,
                "time": f"{start_short}–{end_short}",
                "overview": prog.get("Overview", ""),
                "is_live": prog.get("IsLive", False),
                "channel_id": ch_id,
            })
        result[ch_id] = programmes

    return result