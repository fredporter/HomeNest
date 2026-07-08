"""TV Guide handler — Live TV channels + EPG schedule."""

from urllib.parse import parse_qs

from modules.media.tv_client import (
    get_live_tv_channels,
    get_programme_schedule,
)
from modules.media.jellyfin_client import is_configured, health_check


def get_tv_guide(query_string: str = "") -> dict:
    """GET /api/tv/guide

    Returns { channels: [...], schedules: { channel_id: [...] }, jellyfin_online: bool }
    """
    channels = get_live_tv_channels()
    schedules = get_programme_schedule()
    online = is_configured() and health_check().get("online", False)

    return {
        "channels": channels,
        "schedules": schedules,
        "jellyfin_online": online,
    }