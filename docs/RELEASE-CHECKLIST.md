# InstaTCR Release Checklist

**Version:** 1.0  
**Last Updated:** 2025-12-16  
**Purpose:** Pre-production verification steps for CHP wrapper releases

---

## ⚠️ Page 1 Attempt Guardrails - CRITICAL

CHP limits Page 1 lookup attempts. After ~2 failed attempts, the report number may be **permanently locked** on CHP's side. There is no reset mechanism.

### Before Any Live CHP Testing

1. **Staging Test Matrix First**
   - Run all test scenarios on staging environment
   - Use the dev test panel (`/staff/dev/page1-test`) to verify guardrail logic
   - Confirm `page1FailureCount` only increments on *consumed* attempts
   - Test the confirmation modal appears after 1 consumed failure
   - Test the locked banner appears after 2 consumed failures

2. **One Known-Good Real Run**
   - For the first real CHP run, use a **known-valid** report number
   - Verify all Page 1 inputs exactly match CHP records:
     - Crash date (YYYY-MM-DD)
     - Crash time (24-hour HHMM)
     - Report number (exact format)
     - Officer ID (5 digits, left-padded)
   - Have a backup plan if the first run fails

3. **Never Intentionally Fail Page 1 on Live CHP**
   - Do NOT test "what happens on failure" against real CHP
   - All failure scenarios must use mock mode or staging
   - Real Page 1 failures are irreversible

---

## Pre-Production Checklist

### Environment Configuration

- [ ] `CHP_WRAPPER_BASE_URL` is set to production wrapper URL
- [ ] `CHP_WRAPPER_API_KEY` is synced with production wrapper
- [ ] `DEV_TOOLS_ENABLED` is **NOT** set to `1` (or removed entirely)
- [ ] Environment is set to `production` (not `development`)

### Security Verification

- [ ] `/staff/dev/page1-test` returns Access Denied in production
- [ ] Wrapper route strips `mockScenario` from all requests
- [ ] No test/mock data is present in production database

### Wrapper Connectivity

- [ ] `/api/wrapper/run` returns `{ ok: true }` on GET
- [ ] Safety check endpoint is responding
- [ ] Rate limiting is properly configured

### Page 1 Guardrail Verification

- [ ] Warning banner shows before first Page 1 attempt
- [ ] Confirmation modal appears after 1 consumed failure
- [ ] Locked banner appears after 2 consumed failures
- [ ] Run button is hidden when locked
- [ ] `page1FailureCount` persists across sessions

---

## Emergency Procedures

### If Page 1 Gets Locked on CHP

1. **Do NOT retry** - Further attempts may extend the lockout
2. Escalate job to manual pickup workflow
3. Contact CHP directly if the lockout seems permanent
4. Document the incident for post-mortem

### If Mock Data Appears in Production

1. Immediately stop all wrapper runs
2. Check environment variables are correct
3. Verify `NODE_ENV=production`
4. Clear any cached mock data
5. Restart the application

---

## Rollback Procedure

If critical issues are discovered post-deployment:

1. Revert to previous deployment
2. Verify wrapper connectivity with previous config
3. Check no jobs were affected by the issue
4. Document what went wrong

---

*Last Updated: 2025-12-16*

