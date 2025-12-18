#!/bin/bash
# test-proxy-local.sh - Test the Next.js proxy route locally
# Usage: bash scripts/test-proxy-local.sh
#
# Prerequisites: Next.js dev server must be running (npm run dev)
set -euo pipefail

PROXY_URL="http://localhost:3000/api/wrapper/run"

echo "🌐 Testing local proxy route: $PROXY_URL"
echo ""

# ============================================
# STEP 1: Check if dev server is running
# ============================================

echo "🔍 Checking if Next.js dev server is running..."

# Quick GET to verify the route exists
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  --connect-timeout 5 \
  --max-time 10 \
  "$PROXY_URL" 2>/dev/null || echo "000")

if [[ "$HEALTH_CODE" == "000" ]]; then
  echo "❌ Cannot reach localhost:3000"
  echo "   Make sure the Next.js dev server is running:"
  echo "   npm run dev"
  exit 1
fi

echo "   ✅ Dev server is responding"
echo ""

# ============================================
# STEP 2: POST to proxy endpoint
# ============================================

echo "📤 POSTing to proxy (empty body to test auth)..."

HTTP_CODE=$(curl -s -o /tmp/proxy-response.txt -w "%{http_code}" \
  --connect-timeout 15 \
  --max-time 120 \
  -X POST "$PROXY_URL" \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null || echo "000")

RESPONSE=$(cat /tmp/proxy-response.txt 2>/dev/null || echo "")

echo ""
echo "📡 HTTP code: $HTTP_CODE"
echo "📄 Response: $RESPONSE"

# ============================================
# STEP 3: Verify result
# ============================================

echo ""
if [[ "$HTTP_CODE" == "401" ]]; then
  echo "❌ AUTH FAILED (401) - Proxy forwarded but wrapper rejected key"
  echo "   Check .env.local has correct CHP_WRAPPER_API_KEY"
  echo "   Then run: bash scripts/sync-wrapper-key.sh"
  exit 1
elif [[ "$HTTP_CODE" == "400" ]]; then
  echo "✅ AUTH PASSED! Got 400 (missing required fields - expected)"
  echo "   The proxy is working correctly."
  echo "   Authorization header is being forwarded properly."
  exit 0
elif [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ AUTH PASSED! Got 200 - proxy and wrapper responded successfully"
  exit 0
elif [[ "$HTTP_CODE" == "503" ]]; then
  echo "❌ SERVICE UNAVAILABLE (503) - Proxy configuration error"
  echo "   Check .env.local has both:"
  echo "   - CHP_WRAPPER_BASE_URL=https://chp-wrapper.fly.dev"
  echo "   - CHP_WRAPPER_API_KEY=your-key-here"
  echo ""
  echo "   Response: $RESPONSE"
  exit 1
elif [[ "$HTTP_CODE" == "502" ]]; then
  echo "❌ BAD GATEWAY (502) - Proxy couldn't reach wrapper"
  echo "   The Fly.io wrapper may be down."
  echo "   Check: fly status --app chp-wrapper"
  exit 1
elif [[ "$HTTP_CODE" == "000" ]]; then
  echo "❌ NETWORK ERROR - Could not reach proxy"
  echo "   Make sure: npm run dev is running"
  exit 1
else
  echo "⚠️  Unexpected HTTP code: $HTTP_CODE"
  echo "   Response: $RESPONSE"
  exit 1
fi


