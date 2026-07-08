"""Settings handler — read and update server configuration at runtime.

Supports the Settings UI in the console for Jellyfin/HA token entry
without requiring server restarts.
"""

import os
from pathlib import Path
from typing import Any


_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent.parent / "config"
_ENV_FILE = _CONFIG_PATH / "environment.env"


def _load_env_file() -> dict[str, str]:
    """Parse the environment.env file into a dict."""
    result: dict[str, str] = {}
    if not _ENV_FILE.exists():
        return result
    for line in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            result[key.strip()] = val.strip().strip('"').strip("'")
    return result


def _save_env_file(data: dict[str, str]) -> None:
    """Write settings back to environment.env, preserving comments."""
    _CONFIG_PATH.mkdir(parents=True, exist_ok=True)

    # Read existing lines to preserve comments
    existing: list[str] = []
    if _ENV_FILE.exists():
        existing = _ENV_FILE.read_text(encoding="utf-8").splitlines()

    new_lines: list[str] = []
    seen: set[str] = set()

    for line in existing:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            new_lines.append(line)
            continue
        if "=" in stripped:
            key = stripped.split("=")[0].strip()
            if key in data:
                new_lines.append(f'{key}={data[key]}')
                seen.add(key)
            else:
                new_lines.append(line)
            continue
        new_lines.append(line)

    # Append any new keys not in the file
    for key, val in data.items():
        if key not in seen:
            new_lines.append(f"{key}={val}")

    _ENV_FILE.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


def _apply_to_env(updates: dict[str, str]) -> None:
    """Apply settings to os.environ so they take effect immediately."""
    for key, val in updates.items():
        os.environ[key] = val


def get_settings() -> dict[str, Any]:
    """GET /api/settings — return current configuration."""
    env_data = _load_env_file()

    jf_key = env_data.get(
        "JELLYFIN_API_KEY",
        os.environ.get("JELLYFIN_API_KEY", ""),
    )
    ha_token = env_data.get(
        "HA_TOKEN", os.environ.get("HA_TOKEN", "")
    )

    def _mask(s: str) -> str:
        return (s[:8] + "...") if len(s) > 12 else ""

    return {
        "jellyfin": {
            "url": env_data.get(
                "JELLYFIN_URL",
                os.environ.get("JELLYFIN_URL", "http://localhost:8096"),
            ),
            "api_key_set": bool(jf_key),
            "api_key_preview": _mask(jf_key) if jf_key else "",
        },
        "home_assistant": {
            "url": env_data.get(
                "HA_URL",
                os.environ.get("HA_URL", "http://localhost:8123"),
            ),
            "token_set": bool(ha_token),
            "token_preview": _mask(ha_token) if ha_token else "",
        },
        "media_vault": {
            "root": env_data.get(
                "UHOME_MEDIA_ROOT",
                os.environ.get("UHOME_MEDIA_ROOT", "~/media"),
            ),
        },
        "env_file_exists": _ENV_FILE.exists(),
        "env_file_path": str(_ENV_FILE),
    }


def update_settings(
    _query: str = "",
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """POST /api/settings — update configuration.

    Expected body:
    {
        "jellyfin": { "url": "...", "api_key": "..." },
        "home_assistant": { "url": "...", "token": "..." }
    }
    """
    if not body or not isinstance(body, dict):
        return {"error": "invalid body — expected JSON object"}

    updates: dict[str, str] = {}

    jf = body.get("jellyfin", {})
    if isinstance(jf, dict):
        if jf.get("url"):
            updates["JELLYFIN_URL"] = jf["url"]
        if jf.get("api_key"):
            updates["JELLYFIN_API_KEY"] = jf["api_key"]

    ha = body.get("home_assistant", {})
    if isinstance(ha, dict):
        if ha.get("url"):
            updates["HA_URL"] = ha["url"]
        if ha.get("token"):
            updates["HA_TOKEN"] = ha["token"]

    if not updates:
        return {"error": "no valid settings provided"}

    _save_env_file(updates)
    _apply_to_env(updates)

    return {
        "status": "saved",
        "updated": list(updates.keys()),
        "settings": get_settings(),
    }