# CHP Wrapper Integration Notes

**Date:** 2025-12-15  
**Author:** AI Assistant  
**Summary:** Wired InstaTCR frontend to call Fly.io CHP wrapper via secure proxy route

---

## What Changed

### 1. Proxy Route Updates (`src/app/api/wrapper/run/route.ts`)

- **Simplified pass-through**: Now passes request body directly to wrapper instead of re-mapping fields
- **401 debug info**: Temporary debug object on auth failures (no actual values, just booleans/lengths)
- **Better error handling**: Handles non-JSON responses and adds `WRAPPER_AUTH_FAILED` error code

### 2. New Wrapper Client (`src/lib/wrapperClient.ts`)

- Type-safe client for UI to call `/api/wrapper/run`
- Handles success/error responses uniformly
- Exports `runWrapper()` and `isWrapperConfigured()` functions

### 3. Staff Job Detail Page (`src/app/staff/jobs/[jobId]/page.tsx`)

- `handleRunWrapper()` now calls real API via `wrapperClient`
- Falls back to mock behavior in DEV_MODE when API unavailable
- Preserves all existing state machine logic (status updates, auto-escalation, etc.)
- Progress bar shows smooth animation while waiting for real API response

---

## Environment Variable Checklist

### Local Development (`.env.local`)

Create `.env.local` in project root:

```bash
# CHP Wrapper Configuration (server-side only)
CHP_WRAPPER_BASE_URL=https://your-wrapper.fly.dev
CHP_WRAPPER_API_KEY=your-api-key-here
```

**Security notes:**
- These are server-only variables (not prefixed with `NEXT_PUBLIC_`)
- Never committed to git (already in `.gitignore`)
- The proxy route reads these at runtime

### Vercel Deployment

In Vercel dashboard → Project → Settings → Environment Variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `CHP_WRAPPER_BASE_URL` | `https://your-wrapper.fly.dev` | Production |
| `CHP_WRAPPER_API_KEY` | Your API key | Production |

**Important:** Add to Production environment (and Preview if needed)

---

## Test Commands

### 1. Basic proxy health check

```bash
curl -i http://localhost:3000/api/wrapper/run
```

Expected: `{"ok":true}` with 200 status

### 2. Test wrapper call (without proper env vars)

```bash
curl -i -X POST http://localhost:3000/api/wrapper/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected responses:
- **503** + `MISSING_CONFIG` → env vars not set
- **401** + `WRAPPER_AUTH_FAILED` + debug info → key incorrect
- **400** + wrapper validation error → auth works, missing required fields ✓

### 3. Test with mock data

```bash
curl -i -X POST http://localhost:3000/api/wrapper/run \
  -H "Content-Type: application/json" \
  -d '{
    "reportNumber": "9876-2024-12345",
    "crashDate": "12/15/2024",
    "crashTime": "1430",
    "ncic": "9876",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Expected: Wrapper processes request and returns result

---

## Troubleshooting

### "Wrapper service not configured" (503)
- Check `.env.local` exists and has both variables
- Restart Next.js dev server after adding env vars

### "Wrapper authentication failed" (401)
- Check the debug info in response:
  - `hasKey: true, keyLength: N` → key is being read
  - `sentAuthHeader: true` → header is being sent
- Verify API key matches what Fly.io wrapper expects
- Check for trailing whitespace/newlines in env var

### DEV_MODE Fallback
In development (`NODE_ENV=development`), if the wrapper API fails:
- Console shows warning: `[handleRunWrapper] DEV MODE: Falling back to mock wrapper`
- UI uses random mock results (same as before)
- Useful for frontend development when wrapper is unavailable

---

## Files Modified

```
src/app/api/wrapper/run/route.ts  # Proxy route (updated)
src/lib/wrapperClient.ts          # New client library
src/app/staff/jobs/[jobId]/page.tsx  # Updated handleRunWrapper
docs/notes/2025-12-15-wrapper-integration.md  # This file
```

---

## TODO: Remove Temporary Debug

After verifying auth works correctly, remove the `debug` field from the 401 response in `route.ts`:

```typescript
// Remove this block after verification:
debug: {
  hasBaseUrl: boolean;
  baseUrlLength: number;
  hasKey: boolean;
  keyLength: number;
  sentAuthHeader: boolean;
  authHeaderLength: number;
}
```

