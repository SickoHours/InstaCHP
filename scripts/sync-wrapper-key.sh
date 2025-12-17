#!/bin/bash
# sync-wrapper-key.sh - Sync CHP_WRAPPER_API_KEY from .env.local to Fly.io
# Usage: bash scripts/sync-wrapper-key.sh
set -euo pipefail

APP="chp-wrapper"
ENV_FILE=".env.local"

# ============================================
# STEP 1: Read and clean the local key
# ============================================

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE not found"
  exit 1
fi

# Extract CHP_WRAPPER_API_KEY, strip quotes and trim whitespace
RAW_LINE=$(grep -E "^CHP_WRAPPER_API_KEY=" "$ENV_FILE" || true)
if [[ -z "$RAW_LINE" ]]; then
  echo "❌ CHP_WRAPPER_API_KEY not found in $ENV_FILE"
  exit 1
fi

# Get value after =, strip leading/trailing quotes and whitespace
LOCAL_KEY=$(echo "$RAW_LINE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]')

if [[ -z "$LOCAL_KEY" ]]; then
  echo "❌ CHP_WRAPPER_API_KEY is empty"
  exit 1
fi

LOCAL_LEN=${#LOCAL_KEY}
LOCAL_SHA8=$(echo -n "$LOCAL_KEY" | shasum -a 256 | cut -c1-8)

echo "📋 Local key: len=$LOCAL_LEN sha8=$LOCAL_SHA8"

# ============================================
# STEP 2: Set Fly secret
# ============================================

echo "🔐 Setting Fly secret on $APP..."
fly secrets set "CHP_WRAPPER_API_KEY=$LOCAL_KEY" --app "$APP"

# ============================================
# STEP 3: Wait for app to become healthy
# ============================================

echo "⏳ Waiting for app to become healthy..."
HEALTH_URL="https://${APP}.fly.dev/api/health"
MAX_RETRIES=12
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  echo "   Attempt $i/$MAX_RETRIES: $HEALTH_URL"
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✅ App is healthy!"
    break
  fi
  if [[ $i -eq $MAX_RETRIES ]]; then
    echo "❌ App failed to become healthy after $MAX_RETRIES attempts"
    echo ""
    echo "📊 Fly status:"
    fly status -a "$APP"
    exit 1
  fi
  sleep $RETRY_DELAY
done

# ============================================
# STEP 4: Verify via SSH
# ============================================

echo "🔍 Verifying key on Fly via SSH..."
# Fly VMs run Linux, which uses sha256sum (not shasum)
FLY_SHA8="$(fly ssh console -a "$APP" -C "sh -lc 'printf %s \"\$CHP_WRAPPER_API_KEY\" | sha256sum | cut -d \" \" -f1 | cut -c1-8'" | tr -d '\r\n')"

echo "🔍 Fly key: sha8=$FLY_SHA8"

# ============================================
# STEP 5: Compare fingerprints
# ============================================

if [[ "$LOCAL_SHA8" != "$FLY_SHA8" ]]; then
  echo "❌ SHA8 MISMATCH! local=$LOCAL_SHA8 fly=$FLY_SHA8"
  exit 1
fi

echo "✅ Keys match! sha8=$LOCAL_SHA8"
echo "✅ Sync complete. Run: bash scripts/test-wrapper-direct.sh"
