---
title: CHP Wrapper Specification
version: 2.0
last_updated: 2025-12-11
audience: Backend engineers, DevOps, automation specialists
---

# CHP Wrapper Specification

## Document Metadata

- **Title:** CHP Wrapper Specification
- **Version:** 2.0
- **Last Updated:** 2025-12-11
- **Target Audience:** Backend engineers, DevOps, automation specialists
- **Part of:** InstaTCR Documentation Suite (Part 4)

## Table of Contents

1. [CHP Wrapper Architecture](#8-chp-wrapper-architecture)
2. [CHP Wrapper Behavior Patterns](#9-chp-wrapper-behavior-patterns)
   - [Pattern 1: Successful Full Report Download](#pattern-1-successful-full-report-download)
   - [Pattern 2: Face Page Only](#pattern-2-face-page-only-most-common)
   - [Pattern 3: Missing Verification Info](#pattern-3-missing-verification-info-requires-retry)
   - [Pattern 4: No Matching Records](#pattern-4-no-matching-records)
   - [Pattern 5: Automation Error](#pattern-5-automation-error)
3. [CHP Wrapper Result Types Reference](#10-chp-wrapper-result-types-reference)
4. [CHP Wrapper Execution Timeline](#11-chp-wrapper-execution-timeline)

---

## 8. CHP Wrapper Architecture

### What is the CHP Wrapper?

The CHP Wrapper is a Playwright-based browser automation service that:
1. Logs into the CHP portal
2. Searches for a specific crash report
3. Fills verification information
4. Downloads available documents (face page or full report)

It runs on Fly.io as a separate service from the main application.

### Prerequisites Enforcement

The wrapper requires specific data to function. The UI must enforce these prerequisites before allowing the wrapper to run.

```typescript
interface WrapperPrerequisites {
  page1Complete: boolean;  // All 4 fields filled
  page2HasField: boolean;  // At least 1 verification field
}

function checkPrerequisites(job: Job): WrapperPrerequisites {
  const page1Complete = Boolean(
    job.crashDate &&
    job.crashTime &&
    job.ncic &&
    job.officerId
  );

  const page2HasField = Boolean(
    job.firstName ||
    job.lastName ||
    job.plate ||
    job.driverLicense ||
    job.vin
  );

  return { page1Complete, page2HasField };
}

function canRunWrapper(job: Job): { ready: boolean; missing: string[] } {
  const missing: string[] = [];

  // Page 1: All 4 fields required
  if (!job.crashDate) missing.push("Crash Date");
  if (!job.crashTime) missing.push("Crash Time");
  if (!job.ncic) missing.push("NCIC");
  if (!job.officerId) missing.push("Officer ID");

  // Page 2: At least 1 field required
  const hasPage2 = job.firstName || job.lastName || job.plate ||
                   job.driverLicense || job.vin;
  if (!hasPage2) missing.push("At least one Page 2 field (name, plate, license, or VIN)");

  return { ready: missing.length === 0, missing };
}
```

### Wrapper Input Schema

```typescript
interface WrapperInput {
  // Required - Report identification
  reportNumber: string;        // "9465-2025-02802"

  // Required - Page 1 data
  crashDate: string;           // "12/01/2025" (mm/dd/yyyy)
  crashTime: string;           // "1430" (HHMM)
  ncic: string;                // "9465"
  officerId: string;           // "012345"

  // At least one required - Page 2 verification
  firstName?: string;          // "Dora"
  lastName?: string;           // "Cruz-Arteaga"
  plate?: string;              // "ABC1234"
  driverLicense?: string;      // "D1234567"
  vin?: string;                // "1HGBH41JXMN109186"

  // Metadata
  jobId: string;               // For callback/tracking
}
```

### Wrapper Output Schema

```typescript
interface WrapperOutput {
  resultType: 'FULL' | 'FACE_PAGE' | 'NO_RESULT' | 'ERROR';
  message: string;             // Human-readable result
  downloadToken?: string;      // If PDF available
  journeyLog: JourneyStep[];   // Step-by-step log
  duration: number;            // Execution time in ms
}
```

### Fly.io Deployment Considerations

**Why Fly.io?**
- Playwright requires persistent browser sessions (8-13 seconds)
- Serverless functions timeout too quickly
- Can maintain warm browser contexts for faster subsequent runs
- Isolated from main app (wrapper crash doesn't affect frontend)

**API Endpoint:**
```
POST https://chp-wrapper.fly.dev/api/run-chp
```

**Request/Response:**
```typescript
// Request
{
  "jobId": "abc123",
  "reportNumber": "9465-2025-02802",
  "crashDate": "12/01/2025",
  "crashTime": "1430",
  "ncic": "9465",
  "officerId": "012345",
  "firstName": "Dora",
  "lastName": "Cruz-Arteaga"
}

// Response
{
  "resultType": "FULL",
  "message": "Full CHP crash report downloaded successfully.",
  "downloadToken": "storage_xyz789",
  "journeyLog": [...],
  "duration": 11234
}
```

---

## 9. CHP Wrapper Behavior Patterns

### Pattern 1: Successful Full Report Download

**Scenario:** Staff has all information from the start, full report is available.

**Steps:**
1. Staff enters Page 1 data (date, time, NCIC, officer ID)
2. Staff enters Page 2 data (driver first/last name)
3. Staff clicks "Run CHP Wrapper"
4. Wrapper runs for 8-13 seconds
5. **Result: FULL** - Full report downloaded

**UI Flow:**
```
[Run CHP Wrapper]
    ↓ Click
"Running CHP automation... (8-13 sec expected)"
    ↓ 12 seconds
[🟢 Full Report Found]
"Full CHP crash report downloaded successfully."
[📄 Download Full Report]
```

**Staff Actions:**
1. Click download button, get PDF
2. Review for completeness
3. Mark job as complete
4. Law firm receives "Your report is ready"

---

### Pattern 2: Face Page Only (Most Common)

**Scenario:** Recent crash, full report not processed by CHP yet.

**Steps:**
1. Staff enters Page 1 and Page 2 data
2. Wrapper runs successfully
3. **Result: FACE_PAGE** - Only face page available

**UI Flow:**
```
[Run CHP Wrapper]
    ↓ Click
"Running CHP automation... (8-13 sec expected)"
    ↓ 11 seconds
[🟡 Face Page Only]
"CHP report found (Face Page only). Full report not yet available."
[📄 Download Face Page]
```

**Staff Actions:**
1. Download face page
2. Enter "guaranteed name" from face page (unlocks auto-checker)
3. Save
4. Auto-checker can now periodically check if full report ready
5. Law firm receives "We've received a preliminary copy"

**Why This Happens:**
- CHP processes face pages immediately
- Full reports take 24-72 hours after crash
- Some crashes take weeks for full report

---

### Pattern 3: Missing Verification Info (Requires Retry)

**Scenario:** Law firm didn't provide driver name, Page 2 is empty.

**Steps:**
1. Staff enters Page 1 data only
2. Page 2 has no verification fields
3. **UI prevents run** - Button disabled

**UI Flow:**
```
Prerequisites:
  ✓ Page 1 complete
  ✗ Page 2 has at least one verification field

[Run CHP Wrapper] ← DISABLED
Tooltip: "Add at least one Page 2 verification field"
```

**Resolution Steps:**
1. Staff calls CHP office manually
2. CHP provides driver name from their records
3. Staff enters name in Page 2 (firstName, lastName)
4. Prerequisites now met
5. Staff clicks "Run CHP Wrapper"
6. Wrapper runs successfully

**Note:** This is why the AI Caller (V3) is valuable - it automates step 1-2.

---

### Pattern 4: No Matching Records

**Scenario:** Crash details are incorrect or crash not in system.

**Steps:**
1. Staff enters all data
2. Wrapper runs successfully (no errors)
3. **Result: NO_RESULT** - No matching crash found

**UI Flow:**
```
[Run CHP Wrapper]
    ↓ Click
"Running CHP automation... (8-13 sec expected)"
    ↓ 10 seconds
[⚪ No Result]
"No matching CHP reports were found for the provided search parameters."
```

**Staff Actions:**
1. Double-check crash date (common error: wrong day)
2. Verify crash time (24-hour format)
3. Confirm NCIC matches report number
4. Verify officer ID format
5. Contact law firm to verify details
6. Correct any errors
7. Re-run wrapper

**Common Causes:**
- Crash date off by one day
- Crash time in wrong format
- Typo in officer ID
- Report number transcription error

---

### Pattern 5: Automation Error

**Scenario:** Technical issue with CHP portal or wrapper.

**Steps:**
1. Staff enters all data
2. Wrapper attempts to run
3. **Result: ERROR** - Something went wrong

**UI Flow:**
```
[Run CHP Wrapper]
    ↓ Click
"Running CHP automation... (8-13 sec expected)"
    ↓ 15 seconds
[🔴 Error]
"CHP portal took too long to respond. Please try again in a few minutes."
```

**Error Types:**

| Error | Message | Action |
|-------|---------|--------|
| Portal timeout | "CHP portal took too long to respond" | Wait 5-10 min, retry |
| Verification failed | "Crash found but verification required" | Add more Page 2 fields |
| Portal layout changed | "CHP portal layout may have changed" | Contact tech support |
| Login failed | "Unable to log into CHP portal" | Check credentials, retry |

**Staff Actions:**
1. Read error message carefully
2. If timeout: Wait and retry
3. If verification: Add more Page 2 fields (try different combo)
4. If persistent: Check journey log for details
5. If unresolvable: Escalate to manual pickup

---

## 10. CHP Wrapper Result Types Reference

### Complete Result Type Table

| Result Type | Badge Color | Has Download | What Happened | Staff Next Steps |
|-------------|-------------|--------------|---------------|------------------|
| **FULL** | 🟢 Green | Yes | Automation found crash, verified identity, full report available, PDF downloaded | 1. Download PDF<br>2. Review for completeness<br>3. Mark job complete<br>4. Law firm notified |
| **FACE_PAGE** | 🟡 Yellow | Yes | Automation found crash, verified identity, but only face page available (full report still processing) | 1. Download face page<br>2. Enter guaranteed name from document<br>3. This unlocks auto-checker<br>4. Check periodically for full report |
| **NO_RESULT** | ⚪ Gray | No | Automation searched CHP database but found no crashes matching Page 1 criteria | 1. Verify crash date is correct<br>2. Check crash time format<br>3. Confirm NCIC and officer ID<br>4. Contact law firm<br>5. Correct and retry |
| **ERROR** | 🔴 Red | No | Automation encountered a problem - could be verification failure, portal issue, or technical error | 1. Read error message<br>2. If verification: Add Page 2 fields<br>3. If timeout: Wait and retry<br>4. If persistent: Check journey log<br>5. If unresolvable: Escalate |

### Result Messages Examples

**FULL Result Messages:**
- "Full CHP crash report downloaded successfully."
- "Complete crash report downloaded and ready for review."

**FACE_PAGE Result Messages:**
- "CHP report found (Face Page only). Full report not yet available."
- "Face page downloaded successfully. Full report processing - check back later."

**NO_RESULT Result Messages:**
- "No matching CHP reports were found for the provided search parameters."
- "No crashes found with the provided date, time, NCIC, and officer ID."

**ERROR Result Messages:**
- "Crash report found but verification required. Add driver name or plate number and try again."
- "CHP portal took too long to respond. Please try again in a few minutes."
- "CHP portal layout may have changed. Contact technical support."
- "Unable to verify crash report. Try adding more Page 2 verification fields."

### Download Token Behavior

| Aspect | Details |
|--------|---------|
| **Present when** | Result type is FULL or FACE_PAGE |
| **Not present when** | Result type is NO_RESULT or ERROR |
| **What it is** | Convex storage ID for the downloaded PDF |
| **How to use** | Pass to download function to retrieve file |
| **Expiration** | Convex storage IDs don't expire, but should download promptly |
| **UI Rule** | Only show "Download PDF" button when downloadToken exists |

---

## 11. CHP Wrapper Execution Timeline

### Phase Breakdown

The CHP wrapper typically takes 8-13 seconds to complete. Here's what happens during that time:

```mermaid
gantt
    title CHP Wrapper Execution Timeline
    dateFormat ss
    axisFormat %S sec

    section Phase 1: Login
    Navigate to CHP portal    :a1, 00, 1s
    Fill email field          :a2, after a1, 500ms
    Fill password field       :a3, after a2, 500ms
    Submit login form         :a4, after a3, 500ms
    Wait for dashboard        :a5, after a4, 500ms

    section Phase 2: Search
    Navigate to Crash Search  :b1, after a5, 1s
    Fill crash date           :b2, after b1, 500ms
    Fill crash time           :b3, after b2, 500ms
    Fill NCIC                 :b4, after b3, 500ms
    Fill officer ID           :b5, after b4, 500ms
    Check perjury checkbox    :b6, after b5, 500ms
    Submit Page 1             :b7, after b6, 1s
    Wait for results          :b8, after b7, 1s

    section Phase 3: Verify
    Detect crash found        :c1, after b8, 500ms
    Fill firstName            :c2, after c1, 500ms
    Fill lastName             :c3, after c2, 500ms
    Fill other fields         :c4, after c3, 500ms
    Submit verification       :c5, after c4, 1s

    section Phase 4: Download
    Detect download button    :d1, after c5, 500ms
    Classify result type      :d2, after d1, 500ms
    Click download            :d3, after d2, 500ms
    Save PDF                  :d4, after d3, 500ms
    Return result             :d5, after d4, 500ms
```

### Detailed Phase Descriptions

#### Phase 1: Login (2-3 seconds)

| Step | Duration | Description |
|------|----------|-------------|
| Navigate to portal | 1s | Open CHP portal URL |
| Fill email | 0.5s | Type email credential |
| Fill password | 0.5s | Type password credential |
| Submit login | 0.5s | Click login button |
| Wait for dashboard | 0.5s | Confirm successful login |

#### Phase 2: Search (3-5 seconds)

| Step | Duration | Description |
|------|----------|-------------|
| Navigate to search | 1s | Click "Crash Search" link |
| Fill Page 1 fields | 2s | Enter date, time, NCIC, officer ID |
| Check perjury box | 0.5s | Required acknowledgment |
| Submit search | 1s | Click search button |
| Wait for results | 1s | Wait for page to load |

#### Phase 3: Verification (2-3 seconds)

| Step | Duration | Description |
|------|----------|-------------|
| Detect crash | 0.5s | Check if crash was found |
| Fill verification | 1.5s | Enter Page 2 fields |
| Submit verification | 1s | Click verify button |

#### Phase 4: Download (1-2 seconds)

| Step | Duration | Description |
|------|----------|-------------|
| Detect result | 0.5s | Check for download button |
| Classify type | 0.5s | Full report vs face page |
| Download PDF | 0.5s | Click download, save file |
| Return result | 0.5s | Send response to frontend |

### Total Time Breakdown

| Scenario | Typical Duration |
|----------|------------------|
| Fast (portal responsive) | 8-9 seconds |
| Normal | 10-12 seconds |
| Slow (portal sluggish) | 13-15 seconds |
| Timeout threshold | 30 seconds |

### Mock Behavior (V1)

For V1 with mock data, simulate realistic timing:

```typescript
async function mockWrapperExecution(): Promise<WrapperOutput> {
  // Simulate 8-13 second execution
  const duration = 8000 + Math.random() * 5000;
  await sleep(duration);

  // Random result distribution
  const rand = Math.random();
  if (rand < 0.30) {
    return { resultType: 'FULL', message: 'Full report downloaded...', ... };
  } else if (rand < 0.70) {
    return { resultType: 'FACE_PAGE', message: 'Face page only...', ... };
  } else if (rand < 0.85) {
    return { resultType: 'NO_RESULT', message: 'No matching reports...', ... };
  } else {
    return { resultType: 'ERROR', message: 'Verification required...', ... };
  }
}
```

**Mock Distribution:**
- 30% FULL - Represents cases where full report is immediately available
- 40% FACE_PAGE - Most common, represents recent crashes
- 15% NO_RESULT - Represents incorrect crash details
- 15% ERROR - Represents verification or technical issues

---

## Related Documents

- [01-product-foundation.md](./01-product-foundation.md) - Product overview and vision
- [02-business-logic.md](./02-business-logic.md) - Core business rules and workflows
- [03-screen-specifications.md](./03-screen-specifications.md) - UI/UX specifications
- [06-implementation-guide.md](./06-implementation-guide.md) - Implementation roadmap
- [../../CHANGELOG.md](../../CHANGELOG.md) - Release notes and version history

---

*Part of the InstaTCR documentation suite. See [INSTATCR-MASTER-PRD.md](../../INSTATCR-MASTER-PRD.md) for navigation.*
