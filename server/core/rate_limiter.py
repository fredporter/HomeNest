"""Simple in-memory rate limiter for uHomeNest API.

Limits requests per client IP for HA toggle/activate endpoints
to prevent accidental spam from controller double-taps.
"""

import time
from collections import defaultdict

# Max requests per window, window in seconds
_RATE_LIMIT = 10       # max requests
_RATE_WINDOW = 60      # 60 seconds
_BUCKETS: dict[str, list[float]] = defaultdict(list)


def _clean_bucket(key: str, now: float) -> None:
    """Remove timestamps older than the window."""
    cutoff = now - _RATE_WINDOW
    _BUCKETS[key] = [t for t in _BUCKETS[key] if t > cutoff]


def check(ip: str) -> bool:
    """Return True if request is allowed, False if rate-limited."""
    now = time.time()
    _clean_bucket(ip, now)
    if len(_BUCKETS[ip]) >= _RATE_LIMIT:
        return False
    _BUCKETS[ip].append(now)
    return True


def remaining(ip: str) -> int:
    """Return remaining requests in this window for the given IP."""
    now = time.time()
    _clean_bucket(ip, now)
    return max(0, _RATE_LIMIT - len(_BUCKETS[ip]))