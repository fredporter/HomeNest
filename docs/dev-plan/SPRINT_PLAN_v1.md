# HomeNest Sprint Plan — v1 Connected Front-End / Back-End

**Created:** 2026-07-08
**Status:** active
**Scope:** Wire the Vue 3 console (10-foot UI) to a real Python API backend with Jellyfin media, Home Assistant bridge, and controller-first navigation.

---

## Current State Assessment

### Backend (server/api/) — What Exists

| Route | Handler | Status |
|---|---|---|
| `GET /api/health` | `health.py` | ✅ Working — returns identity + ok |
| `GET /api/identity` | `identity.py` | ✅ Working — proxies Snackbar |
| `GET /api/media/browse` | `media.py` | ✅ Working — reads `.media-index.json` |
| `GET /api/media/search` | `media.py` | ✅ Working — substring search over index |
| `GET /api/now-playing` | `launcher.py` | ✅ Working — in-memory state only |
| `GET /api/launcher/status` | `launcher.py` | ✅ Working — static stub |
| `POST /api/playback/start` | `playback.py` | ⚠️ Stub — query-string only, no real playback |
| `POST /api/playback/stop` | `playback.py` | ⚠️ Stub — query-string only |

**Key gaps:**
- No Home Assistant bridge endpoints (module directory empty)
- No `/api/library/media/` endpoint (console store calls this)
- No rich media item return (just path/size — no title, poster, year, type)
- In-memory state — lost on restart
- No WebSocket for real-time now-playing updates
- No EPG/tv-guide endpoint

### Frontend (apps/console/) — What Exists

| Component | Status |
|---|---|
| `App.vue` shell (topbar, now-playing bar, button hints) | ✅ Complete |
| `LauncherSurface.vue` (4-tile home grid) | ✅ Complete |
| `MediaBrowserSurface.vue` | ✅ Layout complete, no detail view |
| `TvGuideSurface.vue` | ✅ Layout complete, no data feed |
| `NowPlayingSurface.vue` | ✅ UI complete, backend stub only |
| `AutomationSurface.vue` | ✅ UI complete, backend missing |
| `SettingsSurface.vue` | ✅ UI complete, static only |
| `useController.ts` (gamepad/controller) | ⚠️ Skeletal — no spatial nav |
| `stores/media.ts` (Jellyfin library + playback) | ✅ API contracts defined, no backend |
| `stores/automation.ts` (HA scenes/entities) | ✅ API contracts defined, no backend |
| `stores/navigation.ts` | ✅ Working |

**API calls the console makes (none exist yet):**

| Store Call | Expected Endpoint |
|---|---|
| `media.fetchLibrary()` | `GET /api/library/media/` |
| `auto.fetchStatus()` | `GET /api/ha/status` |
| `auto.activateScene(id)` | `POST /api/ha/scenes/:id/activate` |
| `auto.toggleEntity(id)` | `POST /api/ha/entities/:id/toggle` |

---

## Sprint 1 — API Alignment & Real Media Data
**Goal:** Console stores talk to real endpoints returning rich data.

### 1.1 — Align media endpoint contracts
- [ ] Rename/repoint `GET /api/media/browse` → `GET /api/library/media/` to match console store
  - Return enriched items: `{ id, title, type, year, rating, poster, subtitle }`
- [ ] Add Jellyfin client module in `server/modules/media/`
  - Query Jellyfin API for library items (movies, TV, music)
  - Cache/paginate results
- [ ] Wire `media.fetchLibrary()` in console to populate MediaBrowserSurface cards
- [ ] Add `GET /api/library/media/:id` for detail view
- [ ] Add `GET /api/library/media/:id/stream` for playback URL

### 1.2 — Real playback control
- [ ] Refactor `POST /api/playback/start` to accept JSON body (`{ mediaId, target }`)
- [ ] Connect playback start to Jellyfin session (start stream on target player)
- [ ] Add `POST /api/playback/pause`, `POST /api/playback/resume`, `POST /api/playback/seek`
- [ ] Add `POST /api/playback/volume` (set volume on target)
- [ ] Wire now-playing bar transport controls (prev/next/seek/volume) to real endpoints
- [ ] Add SSE or polling for now-playing state updates in console

### 1.3 — Home Assistant bridge MVP
- [ ] Implement `server/modules/home-assistant-bridge/` with HA REST API client
- [ ] Add `GET /api/ha/status` → returns scenes[] and entities[]
- [ ] Add `POST /api/ha/scenes/:id/activate`
- [ ] Add `POST /api/ha/entities/:id/toggle`
- [ ] Wire AutomationSurface scenes grid and entities list to live HA data

---

## Sprint 2 — Media Detail, TV Guide & Persistence
**Goal:** Rich browsing, EPG data, and durable state.

### 2.1 — Media detail surface
- [ ] Create `MediaDetailSurface.vue` — poster, metadata, cast, play button
- [ ] Add route `/media/:id` in router
- [ ] Wire card click in MediaBrowserSurface to navigate to detail
- [ ] Add play/resume from detail view

### 2.2 — TV Guide / EPG
- [ ] Implement EPG data feed from Jellyfin Live TV or XMLTV source
- [ ] Add `GET /api/tv/guide` → channels + programme schedules
- [ ] Add `GET /api/tv/channel/:id/stream`
- [ ] Wire TvGuideSurface grid to live EPG data
- [ ] Add "Watch Now" / "Record" actions per programme

### 2.3 — State persistence
- [ ] Replace in-memory `state.py` with SQLite-backed store
- [ ] Persist now-playing state across server restarts
- [ ] Persist volume, last-played position per media item
- [ ] Add `GET /api/state/resume` for continue-watching

---

## Sprint 3 — Controller Navigation & 10-Foot UX Polish
**Goal:** Full gamepad/remote spatial navigation — no mouse required.

### 3.1 — Controller spatial focus
- [ ] Implement d-pad grid navigation in `useController.ts`
  - Arrow keys / d-pad move focus between tiles in a 2D grid
  - A = select, B = back, X = context menu, Y = info
- [ ] Add focus-visible ring styling (use `controller-focus.css` tokens)
- [ ] Navigate between sections within a surface (scenes → entities, etc.)
- [ ] Handle focus wrap at grid edges

### 3.2 — Launcher polish
- [ ] Add "Continue Watching" row to LauncherSurface
- [ ] Add clock / weather widget
- [ ] Show system status indicator (Jellyfin online, HA connected)

### 3.3 — Settings live data
- [ ] Add `GET /api/settings/status` endpoint
- [ ] Populate SettingsSurface cards with real system data
- [ ] Add network config, display mode, audio output sections (read-only MVP)

---

## Sprint 4 — HomeNest Installer (Linux Mint Cinnamon) ✅
**Goal:** Single-command deployment on Linux Mint Cinnamon.

### 4.1 — Installer script
- [x] Rewrite `scripts/install.sh` — 7-step installer (system deps, homenest user, media vault, Jellyfin, file copy, systemd units, udev rules)
- [x] Create `scripts/uninstall.sh` with `--purge` option
- [x] Update `installer/preseed/default.yaml` for `home_nest:` namespace, target `linux-mint/cinnamon`
- [x] Create `docs/INSTALLER.md` with architecture diagram, troubleshooting
- [ ] Test install/uninstall on Linux Mint 22 Cinnamon VM

### 4.2 — API hardening
- [ ] Add request validation (reject malformed JSON, missing fields)
- [ ] Add rate limiting on HA toggle endpoints
- [ ] Add structured error responses (`{ error: string, code: number }`)

### 4.3 — Console polish for Mint
- [ ] Add Cinnamon desktop shortcut / menu entry
- [ ] Add first-run-launch script for Mint Cinnamon
- [ ] Auto-detect system locale for clock/EPG timezones

---

## Dependency Graph

```
Sprint 1 (API Alignment)
 ├── 1.1 Media endpoint alignment ────── blocks Sprint 2.1 (detail view)
 ├── 1.2 Playback wiring ─────────────── blocks Sprint 2.3 (resume state)
 └── 1.3 HA bridge MVP ──────────────── standalone

Sprint 2 (Detail + EPG + Persistence)
 ├── 2.1 Media detail ───────────────── depends on 1.1
 ├── 2.2 TV Guide ───────────────────── depends on 1.1 (Jellyfin client)
 └── 2.3 State persistence ──────────── depends on 1.2

Sprint 3 (Controller + Polish)
 ├── 3.1 Spatial focus ──────────────── standalone (uses existing surface grid)
 ├── 3.2 Launcher polish ────────────── depends on 1.1, 1.3, 2.3
 └── 3.3 Settings live data ─────────── standalone

Sprint 4 (Deployment)
 ├── 4.1 Service units ──────────────── standalone
 ├── 4.2 API hardening ──────────────── touches all handlers
 └── 4.3 Dev tooling ────────────────── standalone
```

---

## Key File Changes

### New files to create
```
server/modules/media/jellyfin_client.py          # Jellyfin API wrapper
server/modules/media/library.py                   # Library enrichment logic
server/modules/home-assistant-bridge/client.py    # HA REST client
server/modules/home-assistant-bridge/routes.py    # HA API handlers
server/api/handlers/ha_status.py                  # GET /api/ha/status
server/api/handlers/ha_scenes.py                  # POST /api/ha/scenes/:id/activate
server/api/handlers/ha_entities.py                # POST /api/ha/entities/:id/toggle
server/api/handlers/tv_guide.py                   # GET /api/tv/guide
server/api/handlers/settings_status.py            # GET /api/settings/status
server/api/handlers/library.py                    # GET /api/library/media/ (replaces media.py)
server/core/persistence.py                        # SQLite state store
scripts/install-service.sh                        # systemd installer
apps/console/src/surfaces/MediaDetailSurface.vue  # Detail view
```

### Files to modify
```
server/api/router.py                              # Add new routes
server/api/main.py                                # CORS, JSON body parsing
server/api/handlers/playback.py                   # JSON body, real playback
server/api/handlers/state.py                      # SQLite persistence
apps/console/src/stores/media.ts                   # Align to new endpoints
apps/console/src/stores/automation.ts              # Align to new endpoints
apps/console/src/router/index.ts                   # Add /media/:id route
apps/console/src/input/useController.ts            # Spatial nav
apps/console/src/surfaces/MediaBrowserSurface.vue  # Detail nav on click
apps/console/package.json                          # Dev scripts
```

---

## Success Criteria

1. **Console launches** → `npm run dev` at monorepo root starts API + Vite
2. **Media Library populates** → Jellyfin items appear with posters, metadata
3. **Playback works** → Click a movie, now-playing bar shows real state
4. **HA devices toggle** → Click a light switch in Automation, it toggles in HA
5. **Controller navigable** → Arrow keys / d-pad navigate all surfaces without mouse
6. **Survives restart** → Now-playing state persists across API server restart