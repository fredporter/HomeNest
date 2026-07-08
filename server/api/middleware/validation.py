"""Request validation utilities for uHomeNest API.

Provides structured error responses and field validation
for POST endpoints.
"""

from typing import Any


def error(code: int, message: str) -> dict[str, Any]:
    """Return a structured error response dict."""
    return {"error": message, "code": code}


def validate_playback_start(body: dict | None) -> dict[str, Any] | None:
    """Validate POST /api/playback/start body.

    Returns error dict if invalid, None if OK.
    """
    if not body or not isinstance(body, dict):
        return error(400, "invalid body — expected JSON object")
    if "mediaId" not in body or not body.get("mediaId"):
        return error(400, "missing required field: mediaId")
    return None


def validate_settings(body: dict | None) -> dict[str, Any] | None:
    """Validate POST /api/settings body.

    Returns error dict if invalid, None if OK.
    """
    if not body or not isinstance(body, dict):
        return error(400, "invalid body — expected JSON object")

    has_jf = isinstance(body.get("jellyfin"), dict)
    has_ha = isinstance(body.get("home_assistant"), dict)

    if not has_jf and not has_ha:
        return error(
            400, "expected 'jellyfin' or 'home_assistant' object"
        )

    if has_jf:
        jf: dict = body["jellyfin"]  # type: ignore[assignment]
        if not jf.get("url") or not jf.get("api_key"):
            return error(400, "jellyfin requires 'url' and 'api_key'")

    if has_ha:
        ha: dict = body["home_assistant"]  # type: ignore[assignment]
        if not ha.get("url") or not ha.get("token"):
            return error(400, "home_assistant requires 'url' and 'token'")

    return None