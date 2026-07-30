"""
Dev-mode server launcher — injects mock data into the API server when
MOCK_JELLYFIN=1 or MOCK_HA=1 environment variables are set.

Patches the Jellyfin client and Home Assistant bridge modules to return
mock data instead of making real HTTP calls.  Import this at the top of
server/api/main.py (before any handler imports) to activate routing.

Usage:
    MOCK_JELLYFIN=1 MOCK_HA=1 python3 server/dev/launcher.py

Or from server/:
    MOCK_JELLYFIN=1 MOCK_HA=1 python3 dev/launcher.py
"""

import importlib
import os
import sys
from pathlib import Path

# Ensure the monorepo root is on sys.path so that
# "from server.dev.mock_data import ..." works regardless
# of whether we're launched from the repo root or from
# inside server/.
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))


def _mock_jellyfin() -> None:
    """Patch jellyfin_client module functions with mock returns."""
    print("[dev] Patching jellyfin_client with mock data")
    mock = _load_mock_data()

    jf = importlib.import_module("modules.media.jellyfin_client")

    jf.get_library_items = (  # noqa: E731
        lambda *a, **kw: mock["MOCK_LIBRARY_ITEMS"]
    )
    jf.get_item = lambda item_id: next(                      # noqa: E731
        (i for i in mock["MOCK_LIBRARY_ITEMS"]
         if i["Id"] == item_id), None,
    )
    jf.health_check = lambda: {                               # noqa: E731
        "online": True,
        "version": mock["MOCK_SYSTEM_INFO"]["Version"],
        "server_name": mock["MOCK_SYSTEM_INFO"]["ServerName"],
    }
    jf.is_configured = lambda: True                           # noqa: E731
    jf.get_image_url = lambda item_id, tag=None: None         # noqa: E731
    jf.get_stream_url = lambda item_id: None                  # noqa: E731

    # Patch TV client
    tv = importlib.import_module("modules.media.tv_client")

    tv.get_live_tv_channels = (  # noqa: E731
        lambda: mock["MOCK_TV_CHANNELS"]
    )
    tv.get_programme_schedule = lambda channel_id=None: (     # noqa: E731
        mock["MOCK_PROGRAMMES"] if channel_id is None
        else mock["MOCK_PROGRAMMES"].get(channel_id, [])
    )


def _mock_ha() -> None:
    """Patch Home Assistant bridge client with mock data."""
    print("[dev] Patching home_assistant_bridge client with mock data")
    mock = _load_mock_data()

    ha = importlib.import_module(
        "modules.home_assistant_bridge.client"
    )

    ha.get_scenes = lambda: mock["MOCK_HA_SCENES"]            # noqa: E731
    ha.get_entities = lambda: mock["MOCK_HA_ENTITIES"]        # noqa: E731
    ha.is_configured = lambda: True                           # noqa: E731
    ha.health_check = lambda: {"online": True}                # noqa: E731
    ha.activate_scene = lambda scene_id: {                    # noqa: E731
        "status": "activated", "scene_id": scene_id,
    }
    ha.toggle_entity = lambda entity_id: {                    # noqa: E731
        "status": "toggled", "entity_id": entity_id,
    }


def _load_mock_data() -> dict:
    """Load mock data module on demand (shared cache)."""
    return importlib.import_module(
        "server.dev.mock_data"
    ).__dict__


def apply_mocks() -> None:
    """Conditionally apply mock patches based on environment variables."""
    if os.environ.get("MOCK_JELLYFIN") in ("1", "true", "yes"):
        _mock_jellyfin()
    if os.environ.get("MOCK_HA") in ("1", "true", "yes"):
        _mock_ha()

    mock_jf = os.environ.get("MOCK_JELLYFIN") in ("1", "true", "yes")
    mock_ha = os.environ.get("MOCK_HA") in ("1", "true", "yes")
    if mock_jf or mock_ha:
        jf_state = "on" if mock_jf else "off"
        ha_state = "on" if mock_ha else "off"
        print(
            f"[dev] Mock mode — Jellyfin={jf_state}, HA={ha_state}"
        )


# ── Run the API server ─────────────────────────────────────────

def run() -> None:
    """Start the API server with mock data patching applied."""
    apply_mocks()

    # Ensure server/ is on sys.path for imports
    _server_dir = Path(__file__).resolve().parent.parent
    if str(_server_dir) not in sys.path:
        sys.path.insert(0, str(_server_dir))

    from api.main import run as run_api
    run_api()


if __name__ == "__main__":
    run()