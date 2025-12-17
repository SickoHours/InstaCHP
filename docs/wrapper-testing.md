# CHP Wrapper Testing Guide

Quick commands for syncing and testing the CHP wrapper API key.

---

## Quick Start: Local Proxy Testing

Deterministic test steps to verify wrapper connectivity:

```bash
# 1. Start dev server
npm run dev

# 2. Health check (GET)
curl http://localhost:3000/api/wrapper/run
# Expected: {"ok":true}

# 3. Auth test (POST with empty body)
curl -X POST http://localhost:3000/api/wrapper/run -H "Content-Type: application/json" -d '{}'
# Results:
#   503 = env vars missing (MISSING_CONFIG)
#   401 = API key wrong (WRAPPER_AUTH_FAILED)
#   400 = auth works, wrapper validation failed (PASS ✅)
```

Or run the smoke test script:

```bash
bash scripts/test-proxy-local.sh
```

---

## Prerequisites

1. **Fly CLI installed** - https://fly.io/docs/flyctl/install/
2. **Authenticated with Fly** - Run `fly auth login`
3. **`.env.local` configured** with both variables:

```bash
CHP_WRAPPER_BASE_URL=https://chp-wrapper.fly.dev
CHP_WRAPPER_API_KEY=your-secret-key-here
```

---

## Testing Commands

### 1. Test Wrapper Directly (bypasses Next.js)

```bash
bash scripts/test-wrapper-direct.sh
```

**What it does:**
- Loads `CHP_WRAPPER_BASE_URL` and `CHP_WRAPPER_API_KEY` from `.env.local`
- Strips quotes, whitespace, and newlines safely
- Calls `${CHP_WRAPPER_BASE_URL}/api/health` first to wake Fly VM
- POSTs to `${CHP_WRAPPER_BASE_URL}/api/run-chp` with `Authorization: Bearer ${API_KEY}`
- Retries automatically if Fly returns "no started VMs" / SSH not ready errors
- Prints HTTP status code and response body

**Expected results:**
| HTTP Code | Meaning | Status |
|-----------|---------|--------|
| `400` | Auth passed, missing required fields | ✅ SUCCESS |
| `401` | Auth failed, key mismatch | ❌ FAILURE - run sync script |
| `200` | Auth passed, request succeeded | ✅ SUCCESS |
| `000` | Network error, couldn't reach wrapper | ❌ FAILURE - check Fly status |

---

### 2. Test Proxy Route Locally (through Next.js)

```bash
# First, start the dev server in one terminal:
npm run dev

# Then, in another terminal:
bash scripts/test-proxy-local.sh
```

**What it does:**
- POSTs to `http://localhost:3000/api/wrapper/run`
- Verifies the Next.js proxy correctly forwards the `Authorization` header
- Prints HTTP status code and response body

**Expected results:**
| HTTP Code | Meaning | Status |
|-----------|---------|--------|
| `400` | Auth passed, proxy working correctly | ✅ SUCCESS |
| `401` | Auth failed, key mismatch on wrapper | ❌ FAILURE - check API key |
| `200` | Auth passed, request succeeded | ✅ SUCCESS |
| `503` | Proxy misconfigured (missing env vars) | ❌ FAILURE - check .env.local |
| `502` | Proxy couldn't reach wrapper | ❌ FAILURE - wrapper may be down |

---

### 3. Sync Key to Fly.io

```bash
bash scripts/sync-wrapper-key.sh
```

**What it does:**
- Reads `CHP_WRAPPER_API_KEY` from `.env.local`
- Strips quotes and whitespace
- Sets it as a Fly secret on `chp-wrapper`
- Waits for app to become healthy
- Verifies via SSH that the key fingerprints match

---

## Full Workflow

### First-time Setup

```bash
# 1. Ensure .env.local exists with both variables
cat .env.local | grep CHP_WRAPPER

# 2. Sync key to Fly.io (only needed if keys mismatch)
bash scripts/sync-wrapper-key.sh

# 3. Test direct connection to wrapper
bash scripts/test-wrapper-direct.sh
# Expected: HTTP 400 ✅
```

### Ongoing Testing (Development)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test proxy route
bash scripts/test-proxy-local.sh
# Expected: HTTP 400 ✅

# To test wrapper directly (bypasses Next.js):
bash scripts/test-wrapper-direct.sh
# Expected: HTTP 400 ✅
```

---

## Interpreting Results

### ✅ HTTP 400 = SUCCESS

This is the **expected success case** for these test scripts.

The wrapper received and authenticated your request, but returned 400 because we sent an empty `{}` body without the required fields (reportNumber, crashDate, etc.).

**This confirms:**
- Network connectivity to wrapper ✅
- API key authentication working ✅
- Proxy forwarding Authorization header ✅

### ❌ HTTP 401 = AUTH FAILURE

The wrapper rejected your API key.

**Fix:**
1. Verify `.env.local` has the correct `CHP_WRAPPER_API_KEY`
2. Run `bash scripts/sync-wrapper-key.sh` to sync key to Fly
3. Re-test with `bash scripts/test-wrapper-direct.sh`

### ❌ HTTP 503 = PROXY MISCONFIGURED

The Next.js proxy route is missing environment variables.

**Fix:**
1. Ensure `.env.local` has both:
   - `CHP_WRAPPER_BASE_URL=https://chp-wrapper.fly.dev`
   - `CHP_WRAPPER_API_KEY=your-key`
2. Restart dev server: `npm run dev`

### ❌ HTTP 502 = WRAPPER UNREACHABLE

The proxy couldn't reach the Fly.io wrapper.

**Fix:**
1. Check Fly status: `fly status --app chp-wrapper`
2. Check Fly logs: `fly logs --app chp-wrapper`
3. If needed, restart: `fly apps restart chp-wrapper`

---

## Troubleshooting

### "CHP_WRAPPER_API_KEY not found"

Add the key to `.env.local`:

```bash
echo 'CHP_WRAPPER_API_KEY=your-secret-key-here' >> .env.local
```

### "CHP_WRAPPER_BASE_URL not found"

Add the URL to `.env.local`:

```bash
echo 'CHP_WRAPPER_BASE_URL=https://chp-wrapper.fly.dev' >> .env.local
```

### SHA8 mismatch after sync

The SSH command may have issues. Check manually:

```bash
fly ssh console --app chp-wrapper -C 'echo -n "$CHP_WRAPPER_API_KEY" | sha256sum'
```

### Fly CLI not installed

```bash
# macOS
brew install flyctl

# or
curl -L https://fly.io/install.sh | sh
```

### Not authenticated with Fly

```bash
fly auth login
```

### "no started VMs" errors

The test scripts automatically retry when Fly VMs are cold starting. If persistent:

```bash
# Check app status
fly status --app chp-wrapper

# Manually wake it
curl https://chp-wrapper.fly.dev/api/health
```

---

## Security Notes

- Scripts **never print the raw API key**
- Only length and sha256 first 8 chars (fingerprint) are shown
- Keys are piped directly to fly secrets (no temp files)
- The proxy route (`/api/wrapper/run`) keeps credentials server-side only

---

## Dev-Only: Reproducing Rate Limits

The wrapper has built-in safety mechanisms to prevent abuse. You can reproduce these for testing:

### Trigger Rate Limit (RUN_LOCK_ACTIVE)

Call the wrapper twice in quick succession from the staff UI:

1. Open a job detail page at `/staff/jobs/[jobId]`
2. Fill in Page 1 data (crash date + time)
3. Fill in at least one Page 2 field
4. Click "Run CHP Wrapper" 
5. **Immediately** click it again before the first run completes

The second call will return `RUN_LOCK_ACTIVE` with a `retryAfterSeconds` value.

**Expected UI behavior:**
- Button shows countdown: "Retry in Xs"
- Amber banner shows "Run in Progress"
- No error escalation occurs
- After countdown, button re-enables

### Trigger Cooldown (COOLDOWN_ACTIVE)

Complete a wrapper run, then immediately try again:

1. Click "Run CHP Wrapper" and wait for it to complete
2. Immediately click again

The wrapper enforces a cooldown between runs. You'll see `COOLDOWN_ACTIVE`.

### Simulate Safety Blocks in Code (Dev Only)

For local testing without hitting the real wrapper:

```typescript
// In handleRunWrapper, before the real API call, add this to simulate:
if (DEV_MODE && Math.random() < 0.3) {
  // 30% chance of simulated safety block
  const mockSafetyBlock = {
    success: false,
    error: 'Rate limit active',
    code: 'RATE_LIMIT_ACTIVE',
    retryAfterSeconds: 15,
  };
  setSafetyBlockActive(true);
  setSafetyBlockCode('RATE_LIMIT_ACTIVE');
  setSafetyBlockCountdown(15);
  toast.warning('Rate limit active. Please wait 15 seconds.');
  setIsWrapperRunning(false);
  return;
}
```

### Safety Block Codes

| Code | Meaning | Typical Wait |
|------|---------|--------------|
| `RATE_LIMIT_ACTIVE` | Too many requests to CHP portal | 30-60s |
| `RUN_LOCK_ACTIVE` | Another run is in progress | 10-30s |
| `COOLDOWN_ACTIVE` | Cooldown between runs | 5-15s |
| `CIRCUIT_BREAKER_ACTIVE` | CHP portal unavailable | 60-300s |

### Key Points

- Safety blocks are **NOT errors** - don't escalate the job
- The UI shows a countdown timer until retry is allowed
- Users can wait and retry without data loss
- Only `PORTAL_ERROR` and true failures should trigger escalation

---

## Safety Blocks in the Staff UI

When the wrapper returns a safety block, the Staff Job Detail page shows specific visual feedback to help users understand it's a temporary pause, not a failure.

### What Staff See

1. **Amber "Retry in Xs" Button** - The "Run CHP Wrapper" button changes to show a countdown timer (e.g., "Retry in 15s"). The button is disabled until the countdown reaches zero.

2. **Amber Safety Block Banner** - Below the button, an amber-colored banner appears with:
   - An alert icon
   - The block type label (e.g., "Rate Limit Active", "Run in Progress")
   - A message explaining this is not an error

3. **Wrapper Status Section** - A status card shows:
   - Block Type badge (e.g., `RATE LIMIT ACTIVE`)
   - Retry countdown in seconds
   - Last Run ID if a previous run exists

### What Staff Do NOT See

- ❌ No "Error" or "Failure" language
- ❌ No red error banners
- ❌ Job status does NOT change (no escalation triggered)
- ❌ No "AUTOMATION_ERROR" status

### The 4 Safety Block Codes

| Code | UI Label | What Happened | What User Should Do |
|------|----------|---------------|---------------------|
| `RATE_LIMIT_ACTIVE` | Rate Limit Active | Too many requests to CHP portal in a short time | Wait 30-60 seconds, then retry |
| `RUN_LOCK_ACTIVE` | Run in Progress | Another wrapper run is still executing | Wait 10-30 seconds for the other run to finish |
| `COOLDOWN_ACTIVE` | Cooldown Active | Recently completed a run, enforced pause | Wait 5-15 seconds, then retry |
| `CIRCUIT_BREAKER_ACTIVE` | Circuit Breaker | CHP portal is experiencing issues | Wait 1-5 minutes, portal may be down |

### User Actions

**For all safety blocks:**
1. **Wait** - Let the countdown timer complete
2. **Retry** - Click the button again once it re-enables
3. **No escalation needed** - This is normal protective behavior

**Exception:** If the same block code keeps appearing repeatedly (5+ times in a row), the CHP portal may be having broader issues. In that case, wait 15-30 minutes before trying again.

### Dev Testing

To test safety block UI without hitting the real wrapper:

1. Navigate to any job detail page at `/staff/jobs/[jobId]`
2. Scroll to the CHP Wrapper card
3. Expand "Technical Details (for debugging)"
4. Look for the **DEV ONLY - Safety Block Testing** section (only visible in development)
5. Click any of the 4 buttons to simulate that safety block type

**Verify:**
- ✅ Amber banner appears with correct code label
- ✅ Countdown timer works (button shows "Retry in Xs")
- ✅ Button is disabled during countdown
- ✅ No error language or red banners
- ✅ Job internal status unchanged
- ✅ After countdown, button re-enables

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Local Development                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  test-proxy-local.sh                                            │
│         │                                                       │
│         ▼                                                       │
│  localhost:3000/api/wrapper/run  (Next.js proxy)                │
│         │                                                       │
│         │ Forwards: Authorization: Bearer ${API_KEY}            │
│         │                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│         ▼                    Fly.io                             │
│  chp-wrapper.fly.dev/api/run-chp                                │
│         │                                                       │
│         ▼                                                       │
│  CHP Portal (real automation)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

  test-wrapper-direct.sh bypasses the proxy and calls Fly directly
```

---

*Last Updated: 2025-12-17*
