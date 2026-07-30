# HomeNest Development Guide

**Last updated:** 2026-07-08

---

## Quick Start (Mock Mode — No Real Servers Needed)

```bash
# From the monorepo root
npm run dev:mock
```

This starts **both** the Python API server (:7890) and the Vue 3 console dev
server (:5173) in a single command.  All endpoints return realistic mock
data — no Jellyfin or Home Assistant required.

| Command | What it does |
|---|---|
| `npm run dev` | Full stack (API + console), requires Jellyfin/HA |
| `npm run dev:mock` | Full stack with `MOCK_JELLYFIN=1 MOCK_HA=1` |
| `npm run dev:api:mock` | API-only with mocks |
| `npm run dev:console` | Console dev server only (:5173) |

Open **http://localhost:5173** in your browser. The console shows 11 movies/TV
shows, 5 Live TV channels with programmes, 4 automation scenes, and 8 Home
Assistant entities.

---

## Full-Stack Dev (With Real Jellyfin / Home Assistant)

```bash
# 1. Copy and edit the environment file
cp config/environment.example.env config/environment.env
# Add your JELLYFIN_URL, JELLYFIN_API_KEY, HA_URL, HA_TOKEN

# 2. Source it + start the API
source config/environment.env
npm run dev:api

# 3. Start the console (separate terminal)
npm run dev:console
```

See **[SETUP.md](./SETUP.md)** for detailed Jellyfin and HA connection guides.

---

## Mock Data

Mock fixtures live in **`server/dev/mock_data.py`** and are activated by the
launcher at **`server/dev/launcher.py`**.  When `MOCK_JELLYFIN=1` is set,
`launcher.py` patches the `jellyfin_client` and `tv_client` modules to return
pre-canned data instead of making real HTTP calls.  Likewise for
`MOCK_HA=1` and the `home_assistant_bridge.client` module.

### What's mocked

| Module | Mock behaviour |
|---|---|
| Jellyfin library | 11 items (5 movies, 3 TV series, 3 albums) |
| Jellyfin Live TV | 5 channels (BBC One, BBC Two, ITV, Channel 4, ABC News) |
| EPG | 8 programmes spread across channels |
| Home Assistant scenes | 4 scenes (Evening Relax, Movie Time, Good Morning, Bedtime) |
| Home Assistant entities | 8 entities (lights, lock, climate, media player, sensor) |
| Now-playing | Empty/stopped state |
| Playback targets | 3 targets (desktop Chrome, Living Room TV, Kitchen Display) |

### Adding more mock data

Edit `server/dev/mock_data.py` — add items to the appropriate `MOCK_*` list.
The launcher picks them up automatically on next restart.

---

## Project Structure

```
HomeNest/
├── apps/console/          Vue 3 console (10-foot UI)
│   ├── src/
│   │   ├── surfaces/      Screen-level components
│   │   ├── stores/        Pinia stores (media, automation, tv, …)
│   │   ├── input/         Controller/gamepad spatial navigation
│   │   └── router/        Vue Router config
│   └── package.json       Vite + Vue deps
├── server/                Python API server
│   ├── api/
│   │   ├── main.py        HTTP server entry point (:7890)
│   │   ├── router.py      Route registry
│   │   ├── handlers/      Request handlers (one per domain)
│   │   └── middleware/     Validation + structured errors
│   ├── modules/
│   │   ├── media/         Jellyfin client + library enrichment + TV client
│   │   └── home_assistant_bridge/  HA REST client
│   ├── core/              Persistence, rate limiter, locale
│   └── dev/               Mock data + dev launcher
├── config/                Environment templates
├── scripts/               Install, uninstall, first-run
├── installer/             Cinnamon desktop integration
├── packages/usx-tokens/   USX design tokens (canonical home: uCore)
└── docs/                  Architecture, setup, roadmap
```

---

## API Endpoints (23 total)

All endpoints are documented in **[TASKS.md](../TASKS.md#api-endpoints-19-total)**.

Key domain groupings:

| Prefix | Module | Purpose |
|---|---|---|
| `/api/health`, `/api/identity` | `handlers/health.py`, `identity.py` | System health, uCore identity proxy |
| `/api/library/media/` | `handlers/library.py` | Jellyfin-enriched media library |
| `/api/playback/` | `handlers/playback.py` | Start/stop/pause/resume/seek/volume |
| `/api/ha/` | `handlers/ha.py` | Home Assistant scenes + entities |
| `/api/tv/` | `handlers/tv.py` | Live TV EPG |
| `/api/settings` | `handlers/settings.py` | .env-persisted config |
| `/api/system/` | `handlers/system.py` | Locale, playback targets |

---

## Testing the API

```bash
# Health check
curl http://localhost:7890/api/health | python3 -m json.tool

# Library (with mocks)
curl http://localhost:7890/api/library/media/ | python3 -m json.tool

# HA status (with mocks)
curl http://localhost:7890/api/ha/status | python3 -m json.tool

# TV guide (with mocks)
curl http://localhost:7890/api/tv/guide | python3 -m json.tool
```

---

## Style Notes

- **Python**: Flake8 + mypy.  Server handlers return `dict` payloads —
  the HTTP handler wraps them in JSON + CORS headers.
- **Vue 3**: Composition API + Pinia stores + `<script setup>`.
- **CSS**: USX design tokens (`usx-tokens/`) provide custom properties for
  colors, spacing, typography, touch, and component presets.  Console
  home-nest overrides live in `usx-tokens/home-nest/`.