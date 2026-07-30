# Roadmap (v1 line)

## Goal

Deliver a Linux-first decentralized home stream server with Jellyfin backbone, `~/media/` vault semantics, controller-first browser UX, and a single-command installer for Linux Mint Cinnamon.

## Milestones

1. Foundation and archive stabilization ✅
2. Media vault scanning and search indexing ✅
3. Playback orchestration and UI control loop ✅ (17 API endpoints, SQLite persistence)
4. HomeNest Installer for Linux Mint Cinnamon ✅ (`scripts/install.sh`)
5. API hardening — validation, rate limiting, structured errors ✅
6. **Console Polish** — *Deferred, pending Operator Test and Feedback*
7. **Developer Integration** — Backend dev-mode scaffold ✅ (mock data, dev launcher, `npm run dev:mock`)

## Done (Sprints 1–3)

- Console surfaces: Launcher, Media Library, TV Guide, Now Playing, Automation, Settings, Media Detail
- Controller-first spatial focus navigation (d-pad / keyboard arrows)
- Jellyfin client: library enrichment, Live TV EPG, stream URLs
- Home Assistant bridge: scenes, entities, toggle/activate
- Settings API: OAuth-style token entry, `.env` persistence
- 17 API endpoints with dynamic route matching, CORS, JSON bodies
- SQLite state persistence (survives server restarts)

## Installer

`scripts/install.sh` handles the full deployment on Linux Mint Cinnamon:
- System dependencies (python3, nginx, nodejs, sqlite3)
- `homenest` system user + media vault (`/home/homenest/media`)
- Jellyfin (optional, `SKIP_JELLYFIN=1` to skip)
- HomeNest files → `/opt/homenest`, Python deps, console build
- systemd units (homenest-server, nginx proxy)
- udev rules for USB/media drive detection

See `docs/INSTALLER.md` for the full guide.

## Strategy

**HomeNest is a standalone Linux media and home network/automation system first and foremost.**
- Operates independently on Linux Mint Cinnamon
- Jellyfin backbone for media streaming
- Home Assistant bridge for home automation
- Controller-first UI (10-foot, spatial navigation)
- Optional uCore integration for shared dependencies (USX design tokens, identity proxy, diagnostics)

## Removed lanes

- **Sonic Home Express** — moved to separate experimental project. The HomeNest Installer (`scripts/install.sh`) replaces the packager/distribution need.
- **Ubuntu service units** — replaced by Mint Cinnamon systemd installer.
- **uDOS-family deep integration** — deferred; HomeNest uses uCore for shared deps (USX tokens) only.
- **Console Polish** → deferred pending operator feedback (shortcut, first-run, locale detection)