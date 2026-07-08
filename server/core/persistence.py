"""SQLite-backed state persistence for uHomeNest.

Replaces in-memory global dicts with a durable store that survives restarts.
"""

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


_DB_DIR = Path(os.environ.get("UHOME_STATE_DIR", Path.home() / ".uhomenest"))
_DB_PATH = _DB_DIR / "state.db"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect() -> sqlite3.Connection:
    _DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(_DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    conn = _connect()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS now_playing (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            state TEXT NOT NULL DEFAULT 'idle',
            target TEXT NOT NULL DEFAULT 'default',
            media TEXT NOT NULL DEFAULT '',
            media_id TEXT NOT NULL DEFAULT '',
            is_playing INTEGER NOT NULL DEFAULT 0,
            progress REAL NOT NULL DEFAULT 0.0,
            volume INTEGER NOT NULL DEFAULT 80,
            current_time TEXT NOT NULL DEFAULT '0:00',
            duration TEXT NOT NULL DEFAULT '0:00',
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        -- Ensure exactly one now-playing row exists
        INSERT OR IGNORE INTO now_playing (id, updated_at)
        VALUES (1, '1970-01-01T00:00:00+00:00');
    """)
    conn.commit()
    conn.close()


# ── now_playing CRUD ────────────────────────────────────────────

def get_now_playing() -> dict[str, Any]:
    conn = _connect()
    row = conn.execute("SELECT * FROM now_playing WHERE id = 1").fetchone()
    conn.close()
    if row is None:
        return _default_now_playing()
    return {
        "state": row["state"],
        "target": row["target"],
        "media": row["media"],
        "media_id": row["media_id"],
        "is_playing": bool(row["is_playing"]),
        "progress": row["progress"],
        "volume": row["volume"],
        "current_time": row["current_time"],
        "duration": row["duration"],
        "updated_at": row["updated_at"],
    }


def set_now_playing(
    target: str = "default",
    media: str = "",
    media_id: str = "",
) -> dict[str, Any]:
    conn = _connect()
    now = _now_iso()
    conn.execute(
        """UPDATE now_playing SET
            state = 'playing',
            target = ?,
            media = ?,
            media_id = ?,
            updated_at = ?
        WHERE id = 1""",
        (target, media, media_id, now),
    )
    conn.commit()
    conn.close()
    return get_now_playing()


def clear_now_playing(target: str = "default") -> dict[str, Any]:
    conn = _connect()
    now = _now_iso()
    conn.execute(
        """UPDATE now_playing SET
            state = 'idle',
            target = ?,
            media = '',
            media_id = '',
            is_playing = 0,
            progress = 0.0,
            updated_at = ?
        WHERE id = 1""",
        (target, now),
    )
    conn.commit()
    conn.close()
    return get_now_playing()


def update_playback_state(
    is_playing: Optional[bool] = None,
    progress: Optional[float] = None,
) -> dict[str, Any]:
    conn = _connect()
    now = _now_iso()
    if is_playing is not None:
        state = "playing" if is_playing else "paused"
        conn.execute(
            """UPDATE now_playing SET
                state = ?, is_playing = ?, updated_at = ?
            WHERE id = 1""",
            (state, int(is_playing), now),
        )
    if progress is not None:
        p = max(0.0, min(100.0, progress))
        conn.execute(
            "UPDATE now_playing SET progress = ?, updated_at = ? WHERE id = 1",
            (p, now),
        )
    conn.commit()
    conn.close()
    return get_now_playing()


def set_volume(vol: int) -> dict[str, Any]:
    conn = _connect()
    now = _now_iso()
    v = max(0, min(100, vol))
    conn.execute(
        "UPDATE now_playing SET volume = ?, updated_at = ? WHERE id = 1",
        (v, now),
    )
    conn.commit()
    conn.close()
    return get_now_playing()


# ── config CRUD ─────────────────────────────────────────────────

def get_config(key: str) -> Optional[str]:
    conn = _connect()
    row = conn.execute(
        "SELECT value FROM config WHERE key = ?", (key,)
    ).fetchone()
    conn.close()
    return row["value"] if row else None


def set_config(key: str, value: str) -> None:
    conn = _connect()
    now = _now_iso()
    conn.execute(
        """INSERT INTO config (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?""",
        (key, value, now, value, now),
    )
    conn.commit()
    conn.close()


def get_all_config() -> dict[str, str]:
    conn = _connect()
    rows = conn.execute("SELECT key, value FROM config").fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}


# ── helpers ─────────────────────────────────────────────────────

def _default_now_playing() -> dict[str, Any]:
    return {
        "state": "idle",
        "target": "default",
        "media": "",
        "media_id": "",
        "is_playing": False,
        "progress": 0.0,
        "volume": 80,
        "current_time": "0:00",
        "duration": "0:00",
        "updated_at": _now_iso(),
    }


# Auto-initialize on import
init_db()