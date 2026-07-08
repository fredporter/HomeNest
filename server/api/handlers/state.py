"""Playback state facade — delegates to SQLite-backed persistence.

Import path preserved for backward compatibility with existing handlers.
All functions now persist across server restarts.
"""

from core.persistence import (
    get_now_playing,
    set_now_playing,
    clear_now_playing,
    update_playback_state,
    set_volume,
)


def get_now_playing_state() -> dict:
    """Return current now-playing state (SQLite-backed)."""
    return get_now_playing()