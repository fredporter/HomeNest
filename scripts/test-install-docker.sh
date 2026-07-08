#!/usr/bin/env bash
# ============================================================================
# HomeNest Docker-based Install Test — Linux Mint 22
# ============================================================================
# Uses uCore's Docker infrastructure (via Snackbar :8484) or direct Docker
# to spin up a Mint 22 container and run the full install/uninstall cycle.
#
# Prerequisites:
#   - Docker installed and running
#   - uCore Snackbar running (optional, for uCore-managed containers)
#
# Usage:
#   bash scripts/test-install-docker.sh
# ============================================================================

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTAINER_NAME="homenest-install-test-$$"
IMAGE="linuxmintd/mint22-amd64:latest"

# ── cleanup ────────────────────────────────────────────────────────────────

cleanup() {
  docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
}
trap cleanup EXIT

# ── check prerequisites ────────────────────────────────────────────────────

echo -e "${GREEN}HomeNest Docker Install Test${NC}"
echo "============================="
echo ""

if ! command -v docker &>/dev/null; then
  fail "Docker not installed"
  echo "Install Docker and try again."
  exit 1
fi
pass "Docker available"

# ── pull Mint 22 image ─────────────────────────────────────────────────────

echo ""
echo "Pulling Mint 22 image..."
if docker pull "${IMAGE}" 2>&1 | tail -3; then
  pass "Mint 22 image pulled"
else
  fail "Failed to pull Mint 22 image"
  exit 1
fi

# ── start container ────────────────────────────────────────────────────────

echo ""
echo "Starting Mint 22 container..."
docker run -d --name "${CONTAINER_NAME}" \
  --privileged \
  -v "${REPO_ROOT}:/home/homenest-repo:ro" \
  "${IMAGE}" \
  tail -f /dev/null

sleep 3

if docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Names}}' | grep -q "${CONTAINER_NAME}"; then
  pass "Container started"
else
  fail "Container failed to start"
  exit 1
fi

# ── install systemd dependencies in container ──────────────────────────────

docker_exec() {
  docker exec "${CONTAINER_NAME}" bash -c "$1" 2>&1
}

echo ""
echo "Installing systemd + base deps in container..."
docker_exec "apt-get update -qq && apt-get install -y -qq systemd systemd-sysv python3 curl nginx nodejs npm sqlite3 2>&1 | tail -1" || true
pass "System deps staged"

# ── run HomeNest installer ─────────────────────────────────────────────────

echo ""
echo "Running HomeNest install.sh..."
docker_exec "cd /home/homenest-repo && bash scripts/install.sh" 2>&1 | tail -10 || true
echo ""

# Verify install artifacts
if docker_exec "test -f /opt/homenest/server/api/main.py && echo 'exists'"; then
  pass "API server files installed"
else
  fail "API server files missing"
fi

if docker_exec "test -f /etc/systemd/system/homenest-server.service && echo 'exists'"; then
  pass "systemd unit installed"
else
  fail "systemd unit missing"
fi

if docker_exec "test -f /etc/nginx/sites-available/homenest && echo 'exists'"; then
  pass "nginx site config installed"
else
  fail "nginx site config missing"
fi

if docker_exec "test -f /usr/share/applications/homenest.desktop && echo 'exists'"; then
  pass "Desktop shortcut installed"
else
  fail "Desktop shortcut missing"
fi

if docker_exec "test -f /opt/homenest/scripts/first-run-launch.sh && echo 'exists'"; then
  pass "first-run-launch.sh installed"
else
  fail "first-run-launch.sh missing"
fi

# ── test API health ────────────────────────────────────────────────────────

echo ""
echo "Testing API health..."

if docker_exec "cd /opt/homenest/server && python3 api/main.py &>/tmp/homenest-api.log & sleep 2; curl -s http://localhost:7890/api/health | grep 'status.*ok'" 2>/dev/null; then
  pass "API health endpoint responds"
else
  fail "API health endpoint failed"
fi

# ── test locale endpoint ───────────────────────────────────────────────────

if docker_exec "curl -s http://localhost:7890/api/system/locale" 2>/dev/null | grep -q "timezone"; then
  pass "Locale endpoint works"
else
  fail "Locale endpoint failed"
fi

# ── test playback targets ──────────────────────────────────────────────────

if docker_exec "curl -s http://localhost:7890/api/playback/targets" 2>/dev/null | grep -q "console"; then
  pass "Playback targets endpoint works"
else
  fail "Playback targets endpoint failed"
fi

# ── run uninstall ──────────────────────────────────────────────────────────

echo ""
echo "Running uninstall --purge..."
docker_exec "cd /home/homenest-repo && bash scripts/uninstall.sh --purge" 2>&1 | tail -5 || true
echo ""

if docker_exec "test ! -f /etc/systemd/system/homenest-server.service && echo 'removed'"; then
  pass "systemd unit removed"
else
  fail "systemd unit not removed"
fi

if docker_exec "test ! -d /opt/homenest && echo 'removed'"; then
  pass "HomeNest directory purged"
else
  fail "HomeNest directory not purged"
fi

# ── summary ────────────────────────────────────────────────────────────────

echo ""
echo "============================="
echo -e "${GREEN}Results: ${PASS} passed, ${RED}${FAIL} failed${NC}"
echo "============================="

if [[ "${FAIL}" -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}All tests passed! HomeNest installer is ready for Mint 22.${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}${FAIL} test(s) failed. Review output above.${NC}"
  exit 1
fi