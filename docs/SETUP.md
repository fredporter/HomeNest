# HomeNest Setup Guide

**Last updated:** 2026-07-08

---

## Quick Start

```bash
# 1. Start the API server
cd server && python3 api/main.py

# 2. Start the console (second terminal)
cd apps/console && npm run dev

# 3. Open http://localhost:5173 in your browser
```

---

## Connecting Media (Jellyfin)

HomeNest uses Jellyfin as its media backbone. You need a Jellyfin server and an API key.

### Step 1 — Locate your Jellyfin server

- Default: `http://localhost:8096`
- If running on another machine, use its LAN IP (e.g. `http://192.168.1.100:8096`)

### Step 2 — Generate an API key

1. Open Jellyfin in your browser
2. Go to **Dashboard → API Keys** (or `http://your-server:8096/web/#/apikeys.html`)
3. Click **+ (New API Key)**
4. Name it `HomeNest` and click **OK**
5. Copy the generated key

### Step 3 — Configure HomeNest

Set environment variables before starting the API server:

```bash
export JELLYFIN_URL=http://192.168.1.100:8096
export JELLYFIN_API_KEY=your-api-key-here
cd server && python3 api/main.py
```

Or use the Settings surface in the console to configure credentials live.

### Verification

```bash
curl http://localhost:7890/api/library/media/ | python3 -m json.tool
# Should return { items: [...], categories: [...], jellyfin_online: true }
```

---

## Connecting Home Assistant

### Step 1 — Locate your HA instance

- Default: `http://localhost:8123`
- If running elsewhere: `http://your-ha-ip:8123`

### Step 2 — Generate a Long-Lived Access Token

1. Open Home Assistant in your browser
2. Click your user profile (bottom-left) → **Security**
3. Scroll to **Long-Lived Access Tokens** → **Create Token**
4. Name it `HomeNest` and click **OK**
5. Copy the token immediately (it's shown only once)

### Step 3 — Configure HomeNest

```bash
export HA_URL=http://192.168.1.100:8123
export HA_TOKEN=your-long-lived-token-here
cd server && python3 api/main.py
```

### Verification

```bash
curl http://localhost:7890/api/ha/status | python3 -m json.tool
# Should return { scenes: [...], entities: [...], ha_online: true }
```

---

## Persistent Configuration (`.env` file)

Create `config/environment.env` from the example:

```bash
cp config/environment.example.env config/environment.env
```

Edit it:

```ini
# Jellyfin Media Server
JELLYFIN_URL=http://localhost:8096
JELLYFIN_API_KEY=your-key-here

# Home Assistant Bridge
HA_URL=http://localhost:8123
HA_TOKEN=your-token-here

# Optional: custom media vault path
UHOME_MEDIA_ROOT=~/media
```

Then source it before starting:

```bash
source config/environment.env
cd server && python3 api/main.py
```

---

## OAuth-Style Token Flow (Design)

For a future browser-based setup wizard, the flow would be:

### Jellyfin
1. Console detects Jellyfin at well-known URL
2. User clicks "Connect Jellyfin"
3. Redirect to Jellyfin's OAuth or API key management page
4. User pastes the key into the Settings panel
5. API validates the key and stores it server-side

### Home Assistant
1. Console detects HA at well-known URL
2. User clicks "Connect Home Assistant"
3. Redirect to HA's `/profile` page for token generation
4. User pastes the long-lived token
5. API validates the token and stores it server-side

### Implementation Map
- [x] Environment-variable-based config
- [x] In-app token entry via Settings surface
- [x] Server-side `.env` persistence
- [x] Token validation on entry
- [ ] OAuth redirect flow for Jellyfin (future)

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Console (Vue 3, :5173)                │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Media    │ │ TV Guide │ │ Auto-    │  │
│  │ Browser  │ │          │ │ mation   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │ fetch()     │ fetch()    │ fetch() │
└───────┼─────────────┼────────────┼────────┘
        │             │            │
   CORS │  localhost:7890          │
        ▼             ▼            ▼
┌─────────────────────────────────────────┐
│  uHomeNest API (Python, :7890)          │
│  /api/library/  /api/tv/  /api/ha/      │
│  /api/playback/ /api/settings/          │
└────┬────────────────────┬───────────────┘
     │ JELLYFIN_API_KEY   │ HA_TOKEN
     ▼                    ▼
┌──────────┐    ┌──────────────────┐
│ Jellyfin │    │ Home Assistant   │
│ :8096    │    │ :8123            │
└──────────┘    └──────────────────┘