#!/usr/bin/env bash
set -euo pipefail
ROOT=/workspace
PORT=43127
SUB=invitacion-joselyn-enrique
URL="https://${SUB}.loca.lt"
cd "$ROOT"

ensure_out() {
  if [[ ! -f out/index.html ]]; then
    npm run build
  fi
}

ensure_serve() {
  if curl -sf -o /dev/null --max-time 3 "http://127.0.0.1:${PORT}/"; then
    return 0
  fi
  echo "$(date -u +%FT%TZ) restarting serve"
  # free port politely
  pkill -f "serve out -l ${PORT}" 2>/dev/null || true
  sleep 1
  npx --yes serve out -l "$PORT" --no-port-switching > /tmp/serve-43127.log 2>&1 &
  sleep 2
}

ensure_tunnel() {
  if curl -sf -o /dev/null --max-time 15 "$URL/"; then
    return 0
  fi
  echo "$(date -u +%FT%TZ) restarting localtunnel $URL"
  pkill -f "localtunnel --port ${PORT} --subdomain ${SUB}" 2>/dev/null || true
  sleep 1
  npx --yes localtunnel --port "$PORT" --subdomain "$SUB" > /tmp/lt-fixed.log 2>&1 &
  sleep 5
}

ensure_out
echo "$(date -u +%FT%TZ) keep-public started → $URL"
printf '%s\n' "# Link público" "" "**Principal:** $URL" "" "Watchdog: npm run keep:public" > "$ROOT/PUBLIC_URL.md"
while true; do
  ensure_serve || true
  ensure_tunnel || true
  if curl -sf -o /dev/null --max-time 15 "$URL/"; then
    echo "$(date -u +%FT%TZ) OK $URL"
    printf '%s\n' "{\"publicUrl\":\"$URL\",\"healthy\":true,\"updatedAt\":\"$(date -u +%FT%TZ)\"}" > "$ROOT/.public-host.json"
  else
    echo "$(date -u +%FT%TZ) FAIL $URL"
  fi
  sleep 45
done
