# HomeNest Sprint Plan — v1 Connected Front-End / Back-End

**Created:** 2026-07-08
**Last Updated:** 2026-07-08
**Status:** **Complete ✅** — All 4 sprints delivered. See [TASKS.md](../../TASKS.md) for the execution board.

---

## Summary of Delivered Work

| Sprint | Theme | Outcome |
|---|---|---|
| 0 | Foundation + Archive | 5 tasks — repo scaffold, media vault fixtures, placeholder handlers |
| 1 | API Alignment | 9 tasks — Jellyfin client, HA bridge, playback, settings, CORS |
| 2 | Media Detail + TV Guide + Persistence | 5 tasks — MediaDetailSurface, EPG, SQLite state |
| 3 | Controller Nav + Installer | 4 tasks — spatial 2D dpad, Cinnamon desktop integration |
| 4 | API Hardening + Locale + uCore | 8 tasks — validation, rate limiting, locale, Snackbar bindings |

**Total: 35 sprint tasks + 2 dev integration tasks = 37 done**

### What was built

- **7 console surfaces**: Launcher, Media Browser, Media Detail, TV Guide, Now Playing, Automation, Settings
- **23 API endpoints** covering health, identity, library, playback, HA, TV, system, settings
- **Jellyfin bridge**: real API client with library enrichment, Live TV EPG, stream URLs
- **Home Assistant bridge**: scenes, entities, toggle/activate with rate limiting
- **Controller spatial navigation**: full d-pad / keyboard arrow 2D grid focus across all surfaces
- **Installer**: `scripts/install.sh` + `uninstall.sh` for Linux Mint Cinnamon with systemd units and udev rules
- **API hardening**: request validation middleware, structured error responses, rate limiter
- **Persistence**: SQLite-backed now-playing, volume, and playback state survives server restart
- **Developer Integration** (`npm run dev:mock`): mock data for Jellyfin + HA, root `package.json` with concurrent dev commands, `docs/DEVELOPMENT.md`

---

## Original Sprint Plan (for historical reference)

Original unchecked plan preserved below. All items now delivered except:
- [ ] Docker Mint 22 VM install test (handled by `scripts/test-install-docker.sh`)

### Sprint 1 — API Alignment & Real Media Data
- [x] Rename/repoint `GET /api/media/browse` → `GET /api/library/media/` to match console store
- [x] Add Jellyfin client module in `server/modules/media/`
- [x] Wire `media.fetchLibrary()` in console to populate MediaBrowserSurface cards
- [x] Add `GET /api/library/media/:id` for detail view
- [x] Refactor `POST /api/playback/start` to accept JSON body
- [x] Add `POST /api/playback/pause`, `POST /api/playback/resume`, `POST /api/playback/seek`
- [x] Add `POST /api/playback/volume`
- [x] Implement `server/modules/home-assistant-bridge/` with HA REST API client
- [x] Add `GET /api/ha/status`, `POST /api/ha/scenes/:id/activate`, `POST /api/ha/entities/:id/toggle`

### Sprint 2 — Media Detail, TV Guide & Persistence
- [x] Create `MediaDetailSurface.vue`
- [x] Add route `/media/:id`
- [x] Implement EPG data feed from Jellyfin Live TV
- [x] Add `GET /api/tv/guide`
- [x] Replace in-memory `state.py` with SQLite-backed store (via `core/persistence.py`)

### Sprint 3 — Controller Navigation & 10-Foot UX Polish
- [x] Implement d-pad grid navigation in `useController.ts`
- [x] Add focus-visible ring styling
- [x] Add "Continue Watching" row to LauncherSurface
- [x] Add clock / weather widget
- [x] Add `GET /api/settings` endpoint — populated with real system data

### Sprint 4 — HomeNest Installer + API Hardening
- [x] Rewrite `scripts/install.sh`
- [x] Create `scripts/uninstall.sh` with `--purge`
- [x] Create `docs/INSTALLER.md`
- [x] Add request validation middleware
- [x] Add rate limiting on HA toggle endpoints
- [x] Add structured error responses
- [x] Add Cinnamon desktop shortcut / menu entry
- [x] Add first-run-launch script for Mint Cinnamon
- [x] Auto-detect system locale for clock/EPG timezones

---

## Remaining / Future

- [ ] Docker-based Mint 22 VM full install/uninstall test cycle
- [ ] Operator test on real hardware (10-foot TV + gamepad)
- [ ] OAuth redirect flow for Jellyfin token setup
- [ ] WebSocket-based real-time now-playing state push to console