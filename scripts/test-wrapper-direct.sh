#!/bin/bash
# test-wrapper-direct.sh - Test CHP wrapper endpoint directly
# Usage: bash scripts/test-wrapper-direct.sh
set -euo pipefail

ENV_FILE=".env.local"

# ============================================
# STEP 1: Read and clean environment variables
# ============================================

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE not found"
  exit 1
fi

# Function to extract and clean a value from .env.local
get_env_value() {
  local key="$1"
  local raw_line
  raw_line=$(grep -E "^${key}=" "$ENV_FILE" || true)
  
  if [[ -z "$raw_line" ]]; then
    echo ""
    return
  fi
  
  # Get value after =, strip quotes, whitespace, and newlines
  echo "$raw_line" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]' | tr -d '\n' | tr -d '\r'
}

# Extract CHP_WRAPPER_API_KEY
API_KEY=$(get_env_value "CHP_WRAPPER_API_KEY")
if [[ -z "$API_KEY" ]]; then
  echo "❌ CHP_WRAPPER_API_KEY not found or empty in $ENV_FILE"
  exit 1
fi

# Extract CHP_WRAPPER_BASE_URL
BASE_URL=$(get_env_value "CHP_WRAPPER_BASE_URL")
if [[ -z "$BASE_URL" ]]; then
  echo "❌ CHP_WRAPPER_BASE_URL not found or empty in $ENV_FILE"
  echo "   Add: CHP_WRAPPER_BASE_URL=https://chp-wrapper.fly.dev"
  exit 1
fi

# Remove trailing slash from BASE_URL if present
BASE_URL="${BASE_URL%/}"

KEY_LEN=${#API_KEY}
KEY_SHA8=$(echo -n "$API_KEY" | shasum -a 256 | cut -c1-8)

echo "📋 Using key: len=$KEY_LEN sha8=$KEY_SHA8"
echo "📋 Using base URL: $BASE_URL"

# ============================================
# STEP 2: Wake Fly with health check (with retries)
# ============================================

HEALTH_URL="${BASE_URL}/api/health"
MAX_WAKE_RETRIES=5
WAKE_RETRY_DELAY=3

echo ""
echo "🏥 Waking Fly with health check: $HEALTH_URL"

for i in $(seq 1 $MAX_WAKE_RETRIES); do
  echo "   Attempt $i/$MAX_WAKE_RETRIES..."
  
  HEALTH_CODE=$(curl -s -o /tmp/health-response.txt -w "%{http_code}" \
    --connect-timeout 10 \
    --max-time 30 \
    "$HEALTH_URL" 2>/dev/null || echo "000")
  
  HEALTH_RESPONSE=$(cat /tmp/health-response.txt 2>/dev/null || echo "")
  
  if [[ "$HEALTH_CODE" == "200" ]]; then
    echo "   ✅ Fly is awake! (HTTP $HEALTH_CODE)"
    break
  fi
  
  # Check for "no started VMs" error
  if echo "$HEALTH_RESPONSE" | grep -qi "no started VMs\|instance unavailable\|ssh.*not ready"; then
    echo "   ⏳ Fly VM not started yet, retrying in ${WAKE_RETRY_DELAY}s..."
    sleep $WAKE_RETRY_DELAY
    continue
  fi
  
  if [[ "$HEALTH_CODE" == "000" ]]; then
    echo "   ⏳ Network timeout, retrying in ${WAKE_RETRY_DELAY}s..."
    sleep $WAKE_RETRY_DELAY
    continue
  fi
  
  if [[ $i -eq $MAX_WAKE_RETRIES ]]; then
    echo "   ⚠️  Health check failed after $MAX_WAKE_RETRIES attempts (HTTP $HEALTH_CODE)"
    echo "   Continuing anyway - wrapper may still respond..."
  else
    echo "   ⏳ Got HTTP $HEALTH_CODE, retrying in ${WAKE_RETRY_DELAY}s..."
    sleep $WAKE_RETRY_DELAY
  fi
done

# ============================================
# STEP 3: Call wrapper endpoint (with retries)
# ============================================

RUN_URL="${BASE_URL}/api/run-chp"
MAX_RUN_RETRIES=3
RUN_RETRY_DELAY=5

echo ""
echo "🌐 Calling wrapper: $RUN_URL"

for i in $(seq 1 $MAX_RUN_RETRIES); do
  echo "   Attempt $i/$MAX_RUN_RETRIES..."
  
  HTTP_CODE=$(curl -s -o /tmp/wrapper-response.txt -w "%{http_code}" \
    --connect-timeout 15 \
    --max-time 60 \
    -X POST "$RUN_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d '{}' 2>/dev/null || echo "000")
  
  RESPONSE=$(cat /tmp/wrapper-response.txt 2>/dev/null || echo "")
  
  # Check for Fly-specific transient errors
  if echo "$RESPONSE" | grep -qi "no started VMs\|instance unavailable\|ssh.*not ready"; then
    if [[ $i -lt $MAX_RUN_RETRIES ]]; then
      echo "   ⏳ Fly VM not ready, retrying in ${RUN_RETRY_DELAY}s..."
      sleep $RUN_RETRY_DELAY
      continue
    fi
  fi
  
  if [[ "$HTTP_CODE" == "000" ]]; then
    if [[ $i -lt $MAX_RUN_RETRIES ]]; then
      echo "   ⏳ Network timeout, retrying in ${RUN_RETRY_DELAY}s..."
      sleep $RUN_RETRY_DELAY
      continue
    fi
  fi
  
  # Got a real response, break out
  break
done

echo ""
echo "📡 HTTP code: $HTTP_CODE"
echo "📄 Response: $RESPONSE"

# ============================================
# STEP 4: Verify result
# ============================================

echo ""
if [[ "$HTTP_CODE" == "401" ]]; then
  echo "❌ AUTH FAILED (401) - Key mismatch!"
  echo "   Run: bash scripts/sync-wrapper-key.sh"
  exit 1
elif [[ "$HTTP_CODE" == "400" ]]; then
  echo "✅ AUTH PASSED! Got 400 (missing required fields - expected)"
  echo "   The wrapper is working correctly."
  exit 0
elif [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ AUTH PASSED! Got 200 - wrapper responded successfully"
  exit 0
elif [[ "$HTTP_CODE" == "000" ]]; then
  echo "❌ NETWORK ERROR - Could not reach wrapper"
  echo "   Check: fly status --app chp-wrapper"
  exit 1
else
  echo "⚠️  Unexpected HTTP code: $HTTP_CODE"
  echo "   Check wrapper logs: fly logs --app chp-wrapper"
  exit 1
fi
