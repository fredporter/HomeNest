#!/usr/bin/env bash
# ============================================================================
# HomeNest First-Run Launch — Linux Mint Cinnamon
# ============================================================================
# Runs on first boot after install or can be triggered manually.
# Checks services, opens the console in the default browser, and
# provides a quick-start wizard in the terminal.
#
# Usage:
#   bash scripts/first-run-launch.sh
# ============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[HomeNest]${NC} $1"; }
warn() { echo -e "${YELLOW}[HomeNest]${NC} $1"; }
info() { echo -e "${CYAN}       ${NC} $1"; }

CONSOLE_URL="http://localhost:8080"
API_URL="http://localhost:7890"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Welcome to HomeNest!              ║${NC}"
echo -e "${GREEN}║   Linux Mint Cinnamon Edition       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check services ─────────────────────────────────────────────────────

log "Checking services..."

check_service() {
    local name=$1
    local cmd=$2
    if systemctl is-active --quiet "$name" 2>/dev/null; then
        info "  $name is running"
        return 0
    else
        warn "  $name is NOT running"
        return 1
    fi
}

ALL_OK=true

check_service "homenest-server" "" || ALL_OK=false
check_service "nginx" "" || ALL_OK=false
check_service "jellyfin" "" || true  # optional, don't fail

if $ALL_OK; then
    log "All core services are running."
else
    warn "Some services are not running."
    info "Try: sudo systemctl start homenest-server nginx"
    info "Check logs: sudo journalctl -u homenest-server -n 20"
fi

echo ""

# ── 2. Check API health ───────────────────────────────────────────────────

log "Checking API health..."
if curl -s "${API_URL}/api/health" | grep -q '"status":"ok"'; then
    info "  API is healthy at ${API_URL}"
else
    warn "  API is not responding at ${API_URL}"
fi

echo ""

# ── 3. Check Jellyfin connection ──────────────────────────────────────────

log "Checking media server..."
SETTINGS=$(curl -s "${API_URL}/api/settings" 2>/dev/null || echo "{}")
JF_ONLINE=$(echo "$SETTINGS" | grep -o '"api_key_set": true' || true)
HA_ONLINE=$(echo "$SETTINGS" | grep -o '"token_set": true' || true)

if [[ -n "$JF_ONLINE" ]]; then
    info "  Jellyfin is connected"
else
    warn "  Jellyfin is not connected"
    info "  → Open Settings in the console to connect"
fi

if [[ -n "$HA_ONLINE" ]]; then
    info "  Home Assistant is connected"
else
    warn "  Home Assistant is not connected"
    info "  → Open Settings in the console to connect"
fi

echo ""

# ── 4. Open console ───────────────────────────────────────────────────────

log "Opening HomeNest Console..."
if command -v xdg-open &>/dev/null; then
    xdg-open "${CONSOLE_URL}" 2>/dev/null || true
    info "  Console opened at ${CONSOLE_URL}"
else
    info "  Open ${CONSOLE_URL} in your browser"
fi

echo ""

# ── 5. Quick-start guide ──────────────────────────────────────────────────

echo -e "${GREEN}Quick Start Guide:${NC}"
echo ""
echo "  1. Connect Jellyfin:"
echo "     → Open Jellyfin Dashboard → API Keys"
echo "     → Create a key named 'HomeNest'"
echo "     → In HomeNest Settings, paste the key"
echo ""
echo "  2. Connect Home Assistant:"
echo "     → Open HA Profile → Security → Long-Lived Tokens"
echo "     → Create a token named 'HomeNest'"
echo "     → In HomeNest Settings, paste the token"
echo ""
echo "  3. Add media to your vault:"
echo "     → Drop files into /home/homenest/media/movies/"
echo "     → Or /home/homenest/media/tv/ and /music/"
echo "     → Jellyfin will auto-scan them"
echo ""
echo "  4. Navigate with your keyboard or gamepad:"
echo "     → Arrow keys move between tiles"
echo "     → Enter selects, Escape goes back"
echo "     → 'm' = Media, 't' = TV, 'a' = Automation, 's' = Settings"
echo ""

log "Enjoy your HomeNest!"