#!/usr/bin/env bash
# ============================================================================
# HomeNest Uninstaller
# ============================================================================
# Removes HomeNest services, systemd units, and optionally the install
# directory. Does NOT remove Jellyfin, nginx, or system dependencies
# (they may be used by other services).
#
# Usage:
#   sudo bash scripts/uninstall.sh
#   sudo bash scripts/uninstall.sh --purge  (also remove /opt/homenest + media)
# ============================================================================

set -euo pipefail

PURGE=0
if [[ "${1:-}" == "--purge" ]]; then
  PURGE=1
fi

HOMENEST_HOME="${HOMENEST_HOME:-/opt/homenest}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
log()  { echo -e "${GREEN}[HomeNest]${NC} $1"; }
warn() { echo -e "${RED}[HomeNest]${NC} $1"; }

if [[ "$(id -u)" -ne 0 ]]; then
  warn "This script must be run as root (sudo bash scripts/uninstall.sh)"
  exit 1
fi

log "HomeNest Uninstaller"
log "===================="
echo ""

# 1. Stop services
log "[1/5] Stopping services..."
systemctl stop homenest-server.service 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
log "  Services stopped"

# 2. Disable + remove systemd units
log "[2/5] Removing systemd units..."
systemctl disable homenest-server.service 2>/dev/null || true
systemctl disable homenest-console.service 2>/dev/null || true
rm -f /etc/systemd/system/homenest-server.service
rm -f /etc/systemd/system/homenest-console.service
rm -f /etc/nginx/sites-available/homenest
rm -f /etc/nginx/sites-enabled/homenest
systemctl daemon-reload
log "  systemd units removed"

# 3. udev rules
log "[3/5] Removing udev rules..."
rm -f /etc/udev/rules.d/99-uhome.rules
udevadm control --reload-rules 2>/dev/null || true
log "  udev rules removed"

# 4. nginx default site restore
log "[4/5] Restoring nginx default..."
if [[ ! -f /etc/nginx/sites-enabled/default ]]; then
  if [[ -f /etc/nginx/sites-available/default ]]; then
    ln -sf /etc/nginx/sites-available/default \
      /etc/nginx/sites-enabled/default
  fi
fi
systemctl reload nginx 2>/dev/null || true
log "  nginx restored"

# 5. Purge (optional)
if [[ "${PURGE}" -eq 1 ]]; then
  log "[5/5] Purging HomeNest files..."
  rm -rf "${HOMENEST_HOME}"
  if id homenest &>/dev/null; then
    userdel homenest 2>/dev/null || true
    log "  User 'homenest' removed"
  fi
  log "  ${HOMENEST_HOME} removed"
else
  log "[5/5] Skipping purge (use --purge to remove ${HOMENEST_HOME})"
fi

log ""
log "Uninstall complete."
log ""
if [[ "${PURGE}" -eq 0 ]]; then
  warn "Note: ${HOMENEST_HOME} was NOT removed."
  warn "Run with --purge to fully remove."
fi

log ""
log "To reinstall:"
log "  sudo bash scripts/install.sh"