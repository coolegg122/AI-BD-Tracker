#!/usr/bin/env bash
# Smoke-test deployed or local API: root, login, GET /api/v1/users/me
# Usage:
#   BASE_URL=https://your-app.vercel.app SMOKE_EMAIL=a@b.com SMOKE_PASSWORD=secret ./scripts/vercel-api-smoke.sh
#   BASE_URL=http://127.0.0.1:8000 SMOKE_EMAIL=... SMOKE_PASSWORD=... ./scripts/vercel-api-smoke.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
SMOKE_EMAIL="${SMOKE_EMAIL:-}"
SMOKE_PASSWORD="${SMOKE_PASSWORD:-}"

if [[ -z "$SMOKE_EMAIL" || -z "$SMOKE_PASSWORD" ]]; then
  echo "Set SMOKE_EMAIL and SMOKE_PASSWORD to a valid account on the target environment."
  exit 1
fi

echo "==> GET $BASE_URL/"
curl -sS -f "$BASE_URL/" | head -c 200 || true
echo ""
echo ""

echo "==> POST $BASE_URL/api/v1/auth/login"
LOGIN_JSON=$(curl -sS -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"$SMOKE_PASSWORD\"}")

TOKEN=$(python3 -c "import json,sys; d=json.loads(sys.argv[1]); print(d.get('access_token',''))" "$LOGIN_JSON" 2>/dev/null || true)
if [[ -z "$TOKEN" ]]; then
  echo "Login failed or invalid JSON:"
  echo "$LOGIN_JSON"
  exit 1
fi
echo "Got access_token (length ${#TOKEN})"
echo ""

echo "==> GET $BASE_URL/api/v1/users/me"
curl -sS -f "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""
echo ""
echo "Smoke test passed."
