"""System locale/timezone detection for uHomeNest."""

import os
import sys
import time
from datetime import timezone as dt_timezone
from typing import Any


def detect_timezone() -> str:
    """Return the system timezone string (e.g. 'Australia/Perth').

    Tries multiple methods:
    1. /etc/timezone (Debian/Mint)
    2. timedatectl (systemd)
    3. Python's local timezone offset
    """
    # Method 1: /etc/timezone (Debian-family)
    try:
        with open("/etc/timezone") as f:
            tz = f.read().strip()
            if tz:
                return tz
    except (FileNotFoundError, PermissionError):
        pass

    # Method 2: timedatectl
    try:
        import subprocess
        result = subprocess.run(
            ["timedatectl", "show", "-p", "Timezone", "--value"],
            capture_output=True, text=True, timeout=5,
        )
        tz = result.stdout.strip()
        if tz:
            return tz
    except Exception:
        pass

    # Method 3: Python timezone offset
    offset = -time.timezone // 3600
    if time.daylight:
        offset = -time.altzone // 3600

    # Map common offsets to IANA zones (best-effort)
    offset_map: dict[int, str] = {
        8: "Australia/Perth",
        10: "Australia/Sydney",
        0: "UTC",
        1: "Europe/London",
        2: "Europe/Berlin",
        -5: "America/New_York",
        -8: "America/Los_Angeles",
    }
    return offset_map.get(offset, f"UTC{offset:+d}")


def get_system_locale() -> dict[str, Any]:
    """Return system locale information.

    Returns:
        {
            "timezone": "Australia/Perth",
            "language": "en_AU",
            "platform": "Linux",
            "hostname": "mint-nest",
        }
    """
    lang = os.environ.get("LANG", "")
    return {
        "timezone": detect_timezone(),
        "language": lang.split(".")[0] if lang else "en",
        "platform": sys.platform,
        "hostname": os.uname().nodename if hasattr(os, "uname") else "unknown",
    }