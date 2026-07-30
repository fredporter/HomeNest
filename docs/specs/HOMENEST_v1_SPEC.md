# HomeNest v1 — System Specification

**Version:** 1.0
**Date:** 2026-07-08
**Status:** Released

---

## 1. System Overview

HomeNest is a **Linux-first decentralized home stream server** designed for the
10-foot living room experience. It provides:

- **Media streaming** via Jellyfin backbone (movies, TV shows, music, Live TV)
- **Home automation control** via Home Assistant bridge (scenes, entities)
- **Controller-first UI** — fully navigable with d-pad / keyboard arrows (no mouse)
- **Single-command deployment** on Linux Mint Cinnamon

HomeNest operates **standalone**. uCore is an optional integration layer for
identity, diagnostics, and OS-level controller events.

---

## 2. Architecture

```
Linux Mint Cinnamon
┌─────────────────────────────────────────────────────────┐
│  nginx :8080                                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Console (Vue 3 SPA)                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │
│  │  │ Launcher  │ │ Media    │ │ TV Guide │  ...x7    │  │
│  │  │ Surface   │ │ Browser  │ │ Surface  │           │  │
│  │  └──────────┘ └──────────┘ └──────────┘           │  │
│  │               │ fetch() to :7890                    │  │
│  └───────────────┼─────────────────────────────────────┘  │
│                  │                                          │
│  uHomeNest API :7890 (Python)                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │ /api/library/  /api/playback/  /api/ha/  /api/tv/ │     │
│  └──────┬───────────────────────┬────────────────────┘     │
│         │                       │                           │
│         ▼                       ▼                           │
│  Jellyfin :8096          Home Assistant :8123               │
│                                                     │
│  uCore Snackbar :8484 (optional)                      │
└─────────────────────────────────────────────────────────┘
```

### Port map

| Service | Port | Required |
|---|---|---|
| uHomeNest API | 7890 | Yes |
| Console (dev) | 5173 | Dev only |
| Console (prod) | 8080 (nginx) | Yes |
| Jellyfin | 8096 | For media only |
| Home Assistant | 8123 | For automation only |
| uCore Snackbar | 8484 | Optional |

### Technology stack

| Layer | Technology |
|---|---|
| Console UI | Vue 3 + TypeScript + Vite + Pinia |
| API Server | Python 3.12 + stdlib `http.server` |
| Persistence | SQLite (`server/core/persistence.py`) |
| Styling | USX Design Tokens (CSS custom properties) |
| Reverse proxy | nginx |
| Target OS | Linux Mint 22 Cinnamon |

---

## 3. Console Surfaces

7 surfaces, controller-navigable via d-pad spatial focus grid.

| Surface | Component | Route | Purpose |
|---|---|---|---|
| Launcher | `LauncherSurface.vue` | `/` | Home grid: Continue Watching, clock, status |
| Media Browser | `MediaBrowserSurface.vue` | `/media` | Jellyfin library grid with category filters |
| Media Detail | `MediaDetailSurface.vue` | `/media/:id` | Poster, metadata, genres, play button |
| TV Guide | `TvGuideSurface.vue` | `/tv` | Live TV channels + EPG programme grid |
| Now Playing | `NowPlayingSurface.vue` | `/now-playing` | Full-screen playback controls + metadata |
| Automation | `AutomationSurface.vue` | `/automation` | HA scenes grid + entities list with toggles |
| Settings | `SettingsSurface.vue` | `/settings` | Jellyfin + HA token configuration |

### Controller mapping

| Input | Action |
|---|---|
| Arrow keys / d-pad | Move focus in 2D grid |
| Enter / A | Select / activate |
| Escape / B | Back |
| X | Context menu |
| Y | Info |

Focus wraps at grid edges. `controller-focus.css` tokens provide visible
focus rings.

### Navigation stores

| Store | File | Purpose |
|---|---|---|
| `media` | `stores/media.ts` | Library items, detail, playback state |
| `automation` | `stores/automation.ts` | HA scenes, entities, toggle/activate |
| `tv` | `stores/tv.ts` | Live TV channels, programme schedule |
| `settings` | `stores/settings.ts` | Jellyfin/HA token config |
| `navigation` | `stores/navigation.ts` | Route state, surface transitions |

---

## 4. API Specification

Base URL: `http://localhost:7890`

All responses are JSON. Error format: `{ "error": "<message>" }`.
CORS: all origins allowed. POST endpoints accept `Content-Type: application/json`.

### 4.1 Health & Identity

| Method | Path | Response |
|---|---|---|
| GET | `/api/health` | `{ status: "ok", version: "1.0.0", uptime: ... }` |
| GET | `/api/identity` | `{ initialized: bool, user_id: string\|null }` |

Identity proxies to uCore Snackbar if available; returns `initialized: false`
when Snackbar is absent.

### 4.2 Media Library

| Method | Path | Query Params | Response |
|---|---|---|---|
| GET | `/api/library/media/` | `limit`, `start`, `type` | `{ items: [MediaItem], categories: [Category], jellyfin_online: bool }` |
| GET | `/api/library/media/:id` | — | `MediaItem` with `stream_url`, `genres`, `overview` |
| GET | `/api/media/health` | — | `{ online: bool, version: string, server_name: string }` |

**MediaItem** shape:
```json
{
  "id": "string",
  "title": "string",
  "type": "movie|tv|music|album",
  "year": 2024,
  "rating": "8.5",
  "poster": "url|null",
  "subtitle": "Overview text"
}
```

**Category** shape:
```json
{ "id": "movie", "label": "Movies", "count": 247 }
```

Legacy endpoints (retained for backward compatibility):
- `GET /api/media/browse` — file-system media browser
- `GET /api/media/search?q=` — substring search over media index

### 4.3 Playback

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/now-playing` | — | `{ playing: bool, item: MediaItem\|null, position: int, duration: int, volume: int, paused: bool }` |
| GET | `/api/playback/targets` | — | `[ { id, name, type, available } ]` |
| POST | `/api/playback/start` | `{ mediaId: string, target?: string }` | `{ status: "started", item: MediaItem }` |
| POST | `/api/playback/stop` | — | `{ status: "stopped" }` |
| POST | `/api/playback/pause` | — | `{ status: "paused" }` |
| POST | `/api/playback/resume` | — | `{ status: "playing" }` |
| POST | `/api/playback/seek` | `{ position: int }` | `{ status: "seeked", position: int }` |
| POST | `/api/playback/volume` | `{ level: int }` | `{ status: "volume_set", volume: int }` |

Playback state is persisted in SQLite. Survives API server restart.

### 4.4 Home Assistant

| Method | Path | Response |
|---|---|---|
| GET | `/api/ha/status` | `{ scenes: [HAScene], entities: [HAEntity], ha_online: bool }` |
| POST | `/api/ha/scenes/:id/activate` | `{ status: "activated", scene_id: string }` |
| POST | `/api/ha/entities/:id/toggle` | `{ status: "toggled", entity_id: string }` |

**Rate limiting:** HA POST endpoints are limited to 10 requests per second per
client IP (configurable in `server/core/rate_limiter.py`).

### 4.5 TV Guide

| Method | Path | Response |
|---|---|---|
| GET | `/api/tv/guide` | `{ channels: [TVChannel], schedules: { channel_id: [Programme] }, jellyfin_online: bool }` |

**TVChannel** shape:
```json
{ "Id": "string", "Name": "string", "Number": "string" }
```

**Programme** shape:
```json
{
  "Id": "string",
  "Name": "string",
  "ChannelId": "string",
  "StartDate": "ISO8601",
  "EndDate": "ISO8601",
  "Overview": "string"
}
```

### 4.6 Settings

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/settings` | — | `{ jellyfin_url, jellyfin_configured, ha_url, ha_configured }` |
| POST | `/api/settings` | `{ section, key, value }` | `{ status: "saved" }` |

Settings are persisted to `config/environment.env`. API keys are redacted in
GET responses.

### 4.7 System

| Method | Path | Response |
|---|---|---|
| GET | `/api/system/locale` | `{ timezone: string, language: string, region: string }` |
| GET | `/api/launcher/status` | `{ surface: "uhome-launcher", status: "ready" }` |

---

## 5. Installer

`scripts/install.sh` is a 7-step deployment script for Linux Mint 22 Cinnamon.

### Steps

1. Install system dependencies (python3, python3-pip, nginx, nodejs, sqlite3, curl, git)
2. Create `homenest` system user + media vault (`/home/homenest/media/`)
3. Optionally install Jellyfin (`SKIP_JELLYFIN=1` to skip)
4. Copy HomeNest files to `/opt/homenest/`
5. Install Python dependencies from `requirements.txt`
6. Build console (`npm run build`) and configure nginx to serve on :8080
7. Install systemd units + udev rules for USB media detection

### Uninstall

`scripts/uninstall.sh` reverses the installation. `--purge` removes config
and media vault.

### First-run

`scripts/first-run-launch.sh` detects the system locale, opens the console,
and displays a welcome card.

### Docker test

`scripts/test-install-docker.sh` provisions a Linux Mint 22 container and runs
the full install → verify → uninstall cycle.

---

## 6. Persistence

SQLite database at `server/data/homenest.db` (auto-created by
`server/core/persistence.py`).

| Table | Purpose |
|---|---|
| `playback_state` | Now-playing item, position, duration, volume, paused status |

State survives API server restarts. Schema is auto-migrated on first access.

---

## 7. Developer Workflow

### Quick start (mock mode — no external services)

```bash
npm run dev:mock
```

Starts API (:7890) with mock Jellyfin + HA data, and console dev server
(:5173) concurrently. See `docs/DEVELOPMENT.md`.

### Mock data

`server/dev/mock_data.py` provides realistic fixtures — 11 media items, 5 TV
channels with EPG, 4 HA scenes, 8 entities. Activated via `MOCK_JELLYFIN=1`
and `MOCK_HA=1` environment variables.

### Production workflow

```bash
source config/environment.env   # JELLYFIN_URL, JELLYFIN_API_KEY, HA_URL, HA_TOKEN
npm run dev:api                 # Real API server
npm run dev:console             # Console dev server
```

---

## 8. API Request Validation

`server/api/middleware/validation.py` validates POST bodies:

| Endpoint | Required fields | Constraints |
|---|---|---|
| `/api/playback/start` | `mediaId` (string) | `target` optional string |
| `/api/settings` | `section`, `key`, `value` (all strings) | — |

Invalid requests return `400` with structured error:
```json
{ "error": "missing required field: mediaId", "code": 400 }
```

---

## 9. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `JELLYFIN_URL` | For media | Jellyfin server URL (default: `http://localhost:8096`) |
| `JELLYFIN_API_KEY` | For media | Jellyfin API key |
| `HA_URL` | For automation | Home Assistant URL (default: `http://localhost:8123`) |
| `HA_TOKEN` | For automation | HA long-lived access token |
| `MOCK_JELLYFIN` | Dev only | Set `1` to use mock Jellyfin data |
| `MOCK_HA` | Dev only | Set `1` to use mock HA data |

---

## 10. Related Documentation

| Document | Purpose |
|---|---|
| [SETUP.md](../SETUP.md) | Jellyfin + HA connection guide |
| [INSTALLER.md](../INSTALLER.md) | Deployment guide |
| [DEVELOPMENT.md](../DEVELOPMENT.md) | Developer environment + mock data |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | uCore integration architecture |
| [TASKS.md](../../TASKS.md) | v1 execution board |
| [SPRINT_PLAN_v1.md](../dev-plan/SPRINT_PLAN_v1.md) | Sprint plan (complete) |
| [ROADMAP.md](../ROADMAP.md) | Roadmap + strategy |