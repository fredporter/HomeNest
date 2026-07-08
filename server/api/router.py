"""Route registry — maps URL patterns to handler functions.

Supports dynamic path segments via regex matching and applies
rate limiting to HA POST endpoints.
"""

import re
from typing import Callable, Any

from handlers.health import get_health
from handlers.identity import get_identity
from handlers.launcher import get_now_playing, get_status
from handlers.media import get_browse, get_search
from handlers.playback import (
    post_start, post_stop, post_pause, post_resume, post_seek, post_volume,
)
from handlers.library import get_library, get_item, get_media_health
from handlers.ha import get_ha_status, post_scene_activate, post_entity_toggle
from handlers.settings import get_settings, update_settings
from handlers.tv import get_tv_guide
from handlers.system import get_locale, get_playback_targets
from middleware.validation import (
    validate_playback_start, validate_settings, error,
)
from core.rate_limiter import check as rate_check


# ── GET routes ─────────────────────────────────────────────────

GET_EXACT: dict[str, Callable[..., dict]] = {
    "/api/health": get_health,
    "/api/identity": get_identity,
    "/api/now-playing": get_now_playing,
    "/api/launcher/status": get_status,
    "/api/library/media/": get_library,
    "/api/ha/status": get_ha_status,
    "/api/media/health": get_media_health,
    "/api/settings": get_settings,
    "/api/tv/guide": get_tv_guide,
    "/api/system/locale": get_locale,
    "/api/playback/targets": get_playback_targets,
}

GET_QUERY: dict[str, Callable[..., dict]] = {
    "/api/media/browse": get_browse,
    "/api/media/search": get_search,
    "/api/library/media/": get_library,
}

GET_PATTERNS: list[tuple[re.Pattern, Callable[..., dict]]] = [
    (
        re.compile(r"^/api/library/media/([^/]+)$"),
        lambda m: get_item(m.group(1)),
    ),
]


# ── POST routes ────────────────────────────────────────────────

POST_EXACT: dict[str, Callable[..., dict]] = {
    "/api/playback/start": post_start,
    "/api/playback/stop": post_stop,
    "/api/playback/pause": post_pause,
    "/api/playback/resume": post_resume,
    "/api/playback/seek": post_seek,
    "/api/playback/volume": post_volume,
    "/api/settings": update_settings,
}

POST_PATTERNS: list[tuple[re.Pattern, Callable[..., dict]]] = [
    (
        re.compile(r"^/api/ha/scenes/([^/]+)/activate$"),
        lambda m, body=None: post_scene_activate(m.group(1), body),
    ),
    (
        re.compile(r"^/api/ha/entities/([^/]+)/toggle$"),
        lambda m, body=None: post_entity_toggle(m.group(1), body),
    ),
]

# HA POST endpoints subject to rate limiting
_HA_RATE_LIMITED_PREFIXES = [
    "/api/ha/scenes/",
    "/api/ha/entities/",
]


# ── routing logic ──────────────────────────────────────────────

def _match_patterns(
    path: str,
    patterns: list[tuple[re.Pattern, Callable[..., dict]]],
    **kwargs: Any,
) -> tuple[int, dict]:
    for pattern, handler in patterns:
        m = pattern.match(path)
        if m:
            return 200, handler(m, **kwargs)
    return 404, {"error": "not found"}


def route_get(
    path: str, query: str, client_ip: str = "",
) -> tuple[int, dict]:
    handler = GET_EXACT.get(path)
    if handler:
        if path in GET_QUERY:
            return 200, handler(query)
        return 200, handler()

    return _match_patterns(path, GET_PATTERNS)


def route_post(
    path: str,
    query: str = "",
    body: dict | None = None,
    client_ip: str = "",
) -> tuple[int, dict]:
    # ── rate limiting for HA endpoints ──
    for prefix in _HA_RATE_LIMITED_PREFIXES:
        if path.startswith(prefix) and client_ip:
            if not rate_check(client_ip):
                return 429, error(429, "too many requests — slow down")
            break

    # ── validation ──
    if path == "/api/playback/start":
        err = validate_playback_start(body)
        if err:
            return 400, err

    if path == "/api/settings":
        err = validate_settings(body)
        if err:
            return 400, err

    # ── dispatch ──
    handler = POST_EXACT.get(path)
    if handler:
        return 200, handler(query, body)

    return _match_patterns(path, POST_PATTERNS, body=body)


def route_request(
    method: str,
    path: str,
    query: str = "",
    body: dict | None = None,
    client_ip: str = "",
) -> tuple[int, dict]:
    if method.upper() == "GET":
        return route_get(path, query, client_ip=client_ip)
    if method.upper() == "POST":
        return route_post(path, query, body, client_ip=client_ip)
    return 405, {"error": "method not allowed"}