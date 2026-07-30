# TASKS - v1 execution board

## Done

- [x] [UHN-R0-001] Archive pre-v1 codebase into `v0/` and push `v0-beta` tag
- [x] [UHN-R0-002] Scaffold v1 top-level server/ui/media-vault/scripts/docs/tests
- [x] [UHN-R1-001] Stabilize fresh v1 repository structure and docs #meta
- [x] [UHN-R1-002] Add deterministic media-vault fixture coverage #core
- [x] [UHN-R1-003] Wire API placeholder handlers to modular router flow #core
- [x] [UHN-R1-004] Add route registry + API contract tests for modular router #core
- [x] [UHN-R1-005] Add real Jellyfin start/stop wiring in `server/jellyfin/orchestrate.sh` #infra
- [x] [UHN-R2-004] Add media index persistence and incremental update logic #feature
- [x] [UHN-S1-001] Wire console stores to real API endpoints (playback, HA, settings) #feature
- [x] [UHN-S1-002] Create Jellyfin client module with library enrichment #core
- [x] [UHN-S1-003] Create Home Assistant bridge REST client #core
- [x] [UHN-S1-004] Add dynamic route matching for :id paths #core
- [x] [UHN-S1-005] Add pause/resume/seek/volume playback endpoints #feature
- [x] [UHN-S1-006] Add settings API (GET/POST /api/settings) with .env persistence #feature
- [x] [UHN-S1-007] Add CORS + OPTIONS + JSON body parsing to API server #infra
- [x] [UHN-S1-008] Create SettingsSurface with OAuth-style connection panels #ux
- [x] [UHN-S2-001] Create MediaDetailSurface with poster/overview/play + route wiring #feature
- [x] [UHN-S2-002] TV Guide / EPG data feed from Jellyfin Live TV #feature
- [x] [UHN-S2-003] SQLite-backed state persistence (survives server restart) #core
- [x] [UHN-S2-004] LauncherSurface polish — continue-watching, clock, status indicators #ux
- [x] [UHN-S3-001] Controller spatial focus navigation (2D grid dpad) #ux
- [x] [UHN-DOC-001] Create SETUP.md with Jellyfin + HA configuration guide #docs
- [x] [UHN-DOC-002] Create Sprint Plan v1 development roadmap #docs
- [x] [UHN-INST-000] Rewrite install.sh/uninstall.sh for Linux Mint Cinnamon #infra
- [x] [UHN-DOC-003] Create INSTALLER.md documentation #docs
- [x] [UHN-INST-002] Add Cinnamon desktop shortcut / menu entry for console #infra
- [x] [UHN-INST-003] Add first-run-launch script for Mint Cinnamon #infra
- [x] [UHN-API-001] Add request validation + structured error responses #core
- [x] [UHN-API-002] Add rate limiting on HA toggle endpoints #core
- [x] [UHN-INST-004] Auto-detect system locale for clock/EPG timezones #feature
- [x] [UHN-R3-004] Implement `/api/playback/start` target selection #feature
- [x] [UHN-INST-001] Docker-based Mint 22 install test script #infra
- [x] [UHN-R3-002] Controller runtime bindings via Snackbar WebSocket bridge #ux
- [x] [UHN-DOC-004] Create ARCHITECTURE.md (uCore ↔ HomeNest relationship) #docs
- [x] [UHN-ARC-001] Move USX tokens to uCore/packages/usx-tokens/ (canonical home) #core

## Milestone Summary

| Sprint | Theme | Tasks |
|---|---|---|
| 0 | Foundation + Archive | 5 done |
| 1 | API Alignment (Jellyfin, HA, Playback, Settings) | 9 done |
| 2 | Media Detail, TV Guide, Persistence | 5 done |
| 3 | Controller Nav, Launcher Polish, Installer | 4 done |
| 4 | API Hardening, Locale, Playback Targets, uCore Integration | 8 done |
| Docs | SETUP, INSTALLER, ARCHITECTURE, Sprint Plan | 4 done |

**Total: 37 done, 0 backlog, 0 blocked**

## Backlog / Deferred

- [x] **Console Polish** (desktop shortcut, first-run-launch, locale detection)
- [x] **Developer Integration** — Backend dev-mode scaffold
  - [x] Scaffold `server/dev/` with Jellyfin mock data (`mock_data.py`)
  - [x] Scaffold `server/dev/` with HA simulation fixtures (`mock_data.py`)
  - [x] Add root `package.json` with `npm run dev` / `npm run dev:mock`
  - [x] Create `server/dev/launcher.py` (auto-patches Jellyfin + HA clients)
  - [x] Document dev environment in `docs/DEVELOPMENT.md`

## API Endpoints (23 total)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | System health + identity |
| GET | `/api/identity` | uCore Snackbar identity proxy |
| GET | `/api/now-playing` | Current playback state |
| GET | `/api/launcher/status` | Launcher surface status |
| GET | `/api/media/browse` | Media file browser |
| GET | `/api/media/search` | Media file search |
| GET | `/api/library/media/` | Jellyfin library items |
| GET | `/api/library/media/:id` | Single media detail |
| GET | `/api/ha/status` | HA scenes + entities |
| GET | `/api/settings` | Current config |
| GET | `/api/tv/guide` | Live TV EPG |
| GET | `/api/media/health` | Jellyfin connection |
| GET | `/api/system/locale` | Timezone/locale |
| GET | `/api/playback/targets` | Available players |
| POST | `/api/playback/start` | Start playback |
| POST | `/api/playback/stop` | Stop playback |
| POST | `/api/playback/pause` | Pause |
| POST | `/api/playback/resume` | Resume |
| POST | `/api/playback/seek` | Seek to position |
| POST | `/api/playback/volume` | Set volume |
| POST | `/api/settings` | Save config |
| POST | `/api/ha/scenes/:id/activate` | Activate scene |
| POST | `/api/ha/entities/:id/toggle` | Toggle entity |