# HomeNest Architecture — uCore Relationship

**Last updated:** 2026-07-08

---

## Overview

HomeNest is a **standalone** Linux Mint Cinnamon home media console. It can operate independently without uCore. However, when uCore is present, HomeNest integrates for identity, diagnostics, container management, and controller events.

```
┌──────────────────────────────────────────────────────────────┐
│  Linux Mint Cinnamon                                         │
│                                                               │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │  HomeNest               │  │  uCore (optional)         │  │
│  │  ┌───────────────────┐  │  │  ┌────────────────────┐  │  │
│  │  │ Console (Vue 3)   │  │  │  │ Snackbar (:8484)   │  │  │
│  │  │ :8080 (nginx)     │  │  │  │ - identity         │  │  │
│  │  │                   │◄─┼──┼──│ - health           │◄─┤  │
│  │  │ useController.ts  │  │  │  │ - controller WS    │  │  │
│  │  │ ← keyboard        │  │  │  │ - Docker mgmt      │  │  │
│  │  │ ← Web Gamepad API │  │  │  └────────────────────┘  │  │
│  │  │ ← Snackbar WS ↻   │  │  │                            │  │
│  │  └────────┬──────────┘  │  └──────────────────────────┘  │
│  │           │ fetch()      │                                 │
│  │  ┌────────▼──────────┐  │                                 │
│  │  │ uHomeNest API     │  │                                 │
│  │  │ (:7890)           │──┼──► Jellyfin (:8096)            │
│  │  │ /api/identity ────┼──┼──► Snackbar identity          │
│  │  │ /api/ha/* ────────┼──┼──► Home Assistant (:8123)     │
│  │  │ /api/library/* ───┼──┼──► Jellyfin library            │
│  │  └───────────────────┘  │                                 │
│  └─────────────────────────┘                                 │
│                                                               │
│  Shared:                                                      │
│  ┌─────────────────────────┐                                  │
│  │ USX Design Tokens (CSS) │ ← uCore/packages/usx-tokens/   │
│  │ colors, spacing, touch  │   canonical home               │
│  └─────────────────────────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Identity (Soft Dependency)

| HomeNest Endpoint | uCore Endpoint | Behavior |
|---|---|---|
| `GET /api/identity` | `Snackbar :8484/v1/identity` | Proxies to Snackbar. If Snackbar is down, returns `{ initialized: false, user_id: null }` — HomeNest operates normally. |

### 2. Controller Bridge (Soft Dependency)

| Component | Connection | Behavior |
|---|---|---|
| `useController.ts` | `ws://localhost:8484/controller` | WebSocket to Snackbar for OS-level gamepad events. Falls back to keyboard navigation and Web Gamepad API. |

### 3. Docker Testing (Soft Dependency)

| Script | uCore Facility | Behavior |
|---|---|---|
| `scripts/test-install-docker.sh` | uCore Docker manager (or direct Docker) | Spins up Mint 22 container, runs full install/verify/uninstall cycle. |

### 4. USX Design Tokens (Hard Dependency — via uCore)

| Package | Location | Role |
|---|---|---|
| `@udos/usx-tokens` | `uCore/packages/usx-tokens/` | Canonical source for CSS custom properties. HomeNest console imports from this location. |

## Standalone Mode

HomeNest runs without uCore:

| Feature | Without uCore | With uCore |
|---|---|---|
| Identity | `uninitialized` | `user_id`, `codeword`, `session_id` |
| Controller | Keyboard + Web Gamepad API | + Snackbar OS-level gamepad |
| Docker tests | `docker` CLI directly | uCore container manager |
| USX tokens | Symlinked/copied from uCore repo | Shared package workspace |

## Startup Order

```
1. Jellyfin (:8096)      — media server
2. uCore Snackbar (:8484) — identity + controller (optional)
3. uHomeNest API (:7890)  — media/HA/settings orchestrator
4. nginx (:8080)          — serves Vue 3 console SPA
```

## Key Design Decisions

1. **HomeNest is the primary UX** — uCore augments, doesn't gate
2. **Identity is optional** — HomeNest works without login
3. **Tokens live in uCore** — single source of truth for USX CSS across the uDos ecosystem
4. **Snackbar bridges the OS** — gamepad, diagnostics, container management
5. **Docker, not bare-metal** — install testing happens in containers, not VMs