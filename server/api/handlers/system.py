"""System handler — locale, playback targets, status."""

from core.locale import get_system_locale


def get_locale(_query: str = "") -> dict:
    """GET /api/system/locale

    Returns { timezone, language, platform, hostname }
    """
    return get_system_locale()


def get_playback_targets(_query: str = "") -> dict:
    """GET /api/playback/targets

    Returns list of available playback destinations.
    """
    return {
        "targets": [
            {
                "id": "console",
                "name": "This Browser",
                "type": "web",
                "default": True,
            },
            {
                "id": "jellyfin-web",
                "name": "Jellyfin Web Player",
                "type": "jellyfin",
                "url": "http://localhost:8096",
            },
        ],
    }