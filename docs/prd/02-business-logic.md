# Business Logic

**Document:** InstaTCR Business Logic & User Flows
**Version:** 2.5 (Updated for V2.5.0 - Fast Form, Organizations, Collaborators)
**Last Updated:** 2025-12-15
**Audience:** All engineers, product designers, QA

---

## Table of Contents
- [3. Complete User Flows](#3-complete-user-flows)
- [4. Status System Architecture](#4-status-system-architecture)
- [5. Data Model Reference](#5-data-model-reference)
- [6. Organizations & Authentication](#6-organizations--authentication)

---

## 3. Complete User Flows

### Flow 1: Complete Information Path (Happy Path)

**When:** Staff has all crash details including driver name from the start.

**Actors:** Law Firm User, InstaTCR Staff, CHP Wrapper

**Steps:**

1. **Law Firm creates request**
   - Submits client name: "Dora Cruz-Arteaga"
   - Submits report number: "9465-2025-02802"
   - Job created with status: `NEW` → Law firm sees: `SUBMITTED`

2. **Staff enters Page 1 data**
   - Opens job in Staff Job Detail
   - Clicks "Call CHP" button (status → `CALL_IN_PROGRESS`)
   - Enters crash date: "12/01/2025"
   - Enters crash time: "1430" (2:30 PM)
   - NCIC auto-derived: "9465"
   - Enters officer ID: "012345"
   - Saves Page 1

3. **Staff enters Page 2 data**
   - First name auto-populated: "Dora"
   - Last name auto-populated: "Cruz-Arteaga"
   - Optionally adds plate, license, VIN
   - Saves Page 2

4. **Staff triggers CHP Wrapper**
   - Prerequisites met (Page 1 complete + Page 2 has name)
   - Clicks "Run CHP Wrapper"
   - Status → `AUTOMATION_RUNNING` → Law firm sees: `CONTACTING_CHP`
   - Wrapper runs for 8-13 seconds

5. **Result: Full Report Downloaded**
   - Wrapper returns: `FULL`
   - Status → `COMPLETED_FULL_REPORT` → Law firm sees: `REPORT_READY`
   - Staff downloads PDF, reviews, marks complete
   - Law firm can download full report

**Timeline:** ~5-10 minutes total

---

### Flow 2: Incomplete Information Path

**When:** Staff only has Page 1 details, no driver name yet.

**Actors:** Law Firm User, InstaTCR Staff, CHP Wrapper

**Steps:**

1. **Law Firm creates request** (same as Flow 1)

2. **Staff enters Page 1 data only**
   - Has crash date, time, NCIC, officer ID
   - Does NOT have driver name (law firm didn't provide)
   - Saves Page 1

3. **Staff attempts to run wrapper**
   - Button disabled: "Complete Page 1 and add at least one Page 2 field"
   - OR if forced: Wrapper returns `ERROR` - "Verification required"

4. **Job paused**
   - Status → `NEEDS_MORE_INFO` → Law firm sees: `NEEDS_INFO`
   - Message: "We need a bit more information to continue"
   - Auto-checker: LOCKED

**Resolution:** Staff must obtain driver name (from law firm or CHP call) before retrying.

---

### Flow 3: Face Page Upload & Driver Name Entry

**When:** Staff received physical face page from CHP (in-person pickup) or wrapper returned face page only.

**Actors:** InstaTCR Staff

**Steps:**

1. **Starting state:** Job in `FACE_PAGE_ONLY` or `NEEDS_MORE_INFO`

2. **Staff opens Manual Completion card**
   - Selects file type: "Face Page"
   - Clicks "Upload File"
   - Selects PDF from computer

3. **Staff enters guaranteed name**
   - Required field appears: "Guaranteed Name"
   - Enters name exactly as shown on face page: "DORA CRUZ-ARTEAGA"
   - This is the verified name from the official document

4. **Staff saves**
   - Face page stored in Convex Storage
   - Guaranteed name stored on job
   - Status → `FACE_PAGE_ONLY` (if wasn't already)
   - Auto-checker: UNLOCKED

5. **Result**
   - Law firm can download face page
   - Staff can use auto-checker to monitor for full report
   - Message: "We've received a preliminary copy (face page) from CHP"

---

### Flow 4: Auto-Checker ("Is This Ready Yet?")

**When:** Job has face page AND driver name (auto-checker unlocked).

**Actors:** InstaTCR Staff, CHP Wrapper

**Unlock Conditions:**
- Has face page document (uploaded or from wrapper)
- Has driver name (guaranteed name from face page OR firstName/lastName from Page 2)

**Steps:**

1. **Staff opens Auto-Checker card**
   - Shows "Unlocked" status with green checkmarks
   - Conditions displayed:
     - ✅ Has face page: Yes
     - ✅ Has driver name: Yes

2. **Staff clicks "Check if Full Report Ready"**
   - Button shows loading state
   - System calls CHP wrapper with stored info
   - Checks if full report now available

3. **Result A: Still Only Face Page**
   - Wrapper returns: `FACE_PAGE`
   - Message: "The full report isn't ready yet. Check back later."
   - Status remains: `FACE_PAGE_ONLY`
   - Auto-checker stays unlocked (can check again)

4. **Result B: Full Report Now Available**
   - Wrapper returns: `FULL`
   - Message: "Great news! We just grabbed the full report."
   - Full report downloaded and stored
   - Status → `COMPLETED_FULL_REPORT` → Law firm sees: `REPORT_READY`

**Note:** Auto-checker can still be run even after full report obtained (for re-downloading if needed).

---

### Flow 5: Manual Escalation

**When:** Automation fails repeatedly or cannot proceed.

**Actors:** InstaTCR Staff, Specialist

**Escalation Triggers:**
- Multiple `ERROR` results from wrapper
- `NO_RESULT` with no additional party info available
- Special circumstances (corrupt files, portal issues)

**Steps:**

1. **Staff opens Escalation card**
   - Clicks "Escalate to Manual Pickup"

2. **Staff enters escalation notes**
   - Explains why escalating: "Wrapper failed 3 times, CHP portal may be down"
   - Confirms escalation

3. **Job escalated**
   - Status → `NEEDS_IN_PERSON_PICKUP` → Law firm sees: `IN_PROGRESS`
   - Job visible to all staff globally (V1: no individual assignment)

4. **Specialist retrieves report**
   - Goes to CHP office in person
   - Obtains physical copy
   - Returns to InstaTCR

5. **Specialist uploads and completes**
   - Opens Manual Completion card
   - Selects "Full Report"
   - Uploads PDF
   - Adds completion notes
   - Clicks "Mark as Completed"
   - Status → `COMPLETED_MANUAL` → Law firm sees: `REPORT_READY`

---

### Flow 6: VAPI AI Caller (Future V3)

**When:** Staff needs crash time and officer ID but doesn't want to call manually.

**Actors:** InstaTCR Staff, VAPI AI Caller, CHP Office

**Steps:**

1. **Staff opens Page 1 Data card**
   - Sees two buttons: "Call CHP" (manual) and "AI Caller" (automatic)
   - Clicks "AI Caller" button

2. **VAPI initiates call**
   - Button shows: "🔄 AI calling Los Angeles CHP..."
   - Status display: "Attempt 1 of 5 • 00:45 elapsed"

3. **AI speaks to CHP dispatcher**
   - Introduces as calling from law firm
   - Provides report number (digit by digit)
   - Requests crash time and officer ID
   - Confirms information received

4. **Result A: Success**
   - AI obtained crash time and officer ID
   - Fields auto-filled in Page 1 form
   - Button shows: "✅ Call Complete - Data Filled"
   - Staff reviews and saves

5. **Result B: Office Failed**
   - AI couldn't get info (office closed, no match, etc.)
   - System tries next office (office hopping)
   - "Attempt 2 of 5 • Trying East LA CHP..."

6. **Result C: All Offices Failed**
   - After 5 attempts, all failed
   - Button shows: "❌ Call Failed - Try Manual"
   - Staff must call manually

**Office Hopping Logic:**
- Retryable outcomes: `OFFICE_CLOSED_OR_VOICEMAIL`, `CALL_DROPPED_OR_TOO_NOISY`, `TRANSFERRED_LOOP_OR_TIMEOUT`
- Non-retryable: `SUCCESS`, `REPORT_NOT_FOUND`, `NO_INFORMATION_GIVEN`

---

### Flow 7: Rescue/Retry Flow (V1.2.0+)

**When:** Wrapper returns `PAGE1_NOT_FOUND` or `PAGE2_VERIFICATION_FAILED`.

**Actors:** Law Firm User, CHP Wrapper

**Purpose:** Allow law firms to correct information or provide additional identifiers to retry the wrapper when initial attempts fail.

**Flow Diagram:**

```
Flow Wizard Complete
        ↓
  [Wrapper Runs]
        ↓
   ┌────┴────┐
   ↓         ↓
SUCCESS   FAILURE
   ↓         ↓
Timeline   ┌─────┴─────┬─────────────┐
+ Download ↓           ↓             ↓
        PAGE1_NOT_FOUND  PAGE2_FAIL  PORTAL_ERROR
             ↓              ↓              ↓
        InlineFieldsCard  RescueForm   Auto-retry
             ↓              ↓
        [Retry Wrapper]  [Retry Wrapper]
```

---

#### Flow 7A: Page 1 Not Found (Correction Path)

**When:** Wrapper returns `PAGE1_NOT_FOUND` - report not found with given date/time/officer.

**Steps:**

1. **Wrapper returns PAGE1_NOT_FOUND**
   - Timeline message: "We couldn't find a report matching those details."
   - InlineFieldsCard shown for corrections

2. **Law firm corrects Page 1 data**
   - Can update crash date, crash time, officer ID
   - "Save & Check for Report" button

3. **Wrapper re-runs automatically**
   - Checks with corrected information
   - Status: `AUTOMATION_RUNNING`

4. **Result:** Success or another failure type

---

#### Flow 7B: Page 2 Verification Failed (Rescue Path)

**When:** Wrapper returns `PAGE2_VERIFICATION_FAILED` - Page 1 succeeded but verification failed.

**Key Feature:** reportTypeHint is preserved from Page 1 success, so law firm knows whether to expect full report or face page.

**Steps:**

1. **Wrapper returns PAGE2_VERIFICATION_FAILED**
   - Timeline message: "We found your report, but need additional identifiers to verify and retrieve it."
   - Shows reportTypeHint: "The full report is available" or "A preliminary copy (face page) is available"
   - DriverInfoRescueForm shown

2. **Law firm fills rescue form**
   - Can provide: License Plate, Driver's License, VIN
   - Can add additional names (repeatable)
   - All fields optional, but at least one improves chances

3. **Law firm submits rescue form**
   - Button: "Save & Check Again"
   - Timeline event: `rescue_info_saved`
   - Wrapper re-runs automatically with new data

4. **Wrapper re-runs**
   - Uses original Page 1 data + new verification data
   - Timeline event: `rescue_wrapper_triggered`

5. **Result:** Success (FULL or FACE_PAGE) or another failure

---

#### Flow 7C: Portal Error (Auto-Retry Path)

**When:** Wrapper returns `PORTAL_ERROR` - technical failure.

**Behavior:**
- Timeline message: "We're experiencing technical difficulties. We'll automatically retry."
- No user action required
- System may auto-retry or staff can manually trigger

---

#### Rescue Form Visibility Conditions

**DriverInfoRescueForm shown when ALL true:**
1. At least one wrapper run with `result === 'PAGE2_VERIFICATION_FAILED'`
2. `rescueInfoProvided` is not yet true
3. Job status is not completed/cancelled

**InlineFieldsCard for corrections shown when ALL true:**
1. At least one wrapper run with `result === 'PAGE1_NOT_FOUND'`
2. Job status is not completed/cancelled
3. Flow wizard is complete (`flowStep === 'done'`)

---

### Flow 8: Fast Form (V2.5.0+) — PRIMARY ENTRY POINT

**When:** Law firm has all crash details upfront (72-hour window use case).

**Purpose:** Accelerated entry for time-sensitive cases where accident just occurred (same day or within 72 hours). **99% of the time, this will result in a face page**, which activates the auto-checker — the most critical feature of the application.

**Actors:** Law Firm User, CHP Wrapper

**Steps:**

1. **Law firm accesses Fast Form**
   - Navigates to `/law/jobs/new-fast`
   - Form shows 3 sections: Page 1 Portal Information, Page 2 Verification, Legal & Collaboration

2. **Law firm fills Page 1 (all required)**
   - Report Number: "9465-2025-02802"
   - Crash Date: "12/15/2025"
   - Crash Time: "1430" (2:30 PM)
   - Officer ID: "012345"
   - NCIC: auto-derived "9465" (read-only)

3. **Law firm fills Page 2 (at least one required)**
   - Client Full Name: "John Doe" (always present)
   - License Plate (optional): "8ABC123"
   - Driver License (optional): "D1234567"
   - VIN (optional): "1HGBH41JXMN109186"

4. **Law firm fills Legal & Collaboration**
   - **Perjury Checkbox (required):** ☑ "I declare under penalty of perjury..."
   - **Collaborators (optional):** Selects colleague "Jane Smith" from organization

5. **Law firm submits**
   - Clicks "Submit Fast Form"
   - Loading state: "Running wrapper... 8-13 seconds"
   - Wrapper runs with all provided data

6. **Result A: Success - Face Page (65% of cases)**
   - Wrapper returns: `FACE_PAGE`
   - Job created with status: `FACE_PAGE_ONLY`
   - Face page downloaded and stored
   - Law firm sees: "We've received a preliminary copy (face page)"
   - Auto-checker unlocked and offered
   - Redirected to job detail at `/law/jobs/{jobId}`

7. **Result B: Success - Full Report (30% of cases)**
   - Wrapper returns: `FULL_REPORT`
   - Job created with status: `COMPLETED_FULL_REPORT`
   - Full report downloaded and stored
   - Law firm sees: "Your report is ready to download"
   - Redirected to job detail with download button

8. **Result C: Failure - Auto-escalation (5% of cases)**
   - Wrapper returns: `PAGE2_BLOCKED`
   - Law firm has NO Page 2 verification info (only client name)
   - **Auto-escalation triggered immediately**
   - Modal appears: "We need your help"
   - Prompts: "Please upload your Authorization to Obtain Governmental Agency Records and Reports"
   - See Flow 9 for auto-escalation details

**Key Value:**
- 99% success rate (face page or full report)
- Immediate access to auto-checker for face pages
- Real-time tracking once face page uploaded
- Collaborators automatically notified of all updates

**Timeline:** ~10-15 seconds total (wrapper execution time)

---

### Flow 9: Fast Form Failure + Auto-escalation (V2.5.0+)

**When:** Fast Form wrapper cannot surpass Page 2 verification (law firm has no verification info).

**Purpose:** Gracefully handle cases where client is a passenger OR driver but law firm has zero Page 2 data.

**Actors:** Law Firm User, InstaTCR Staff

**High Possibility of Failure If:**
- Client is a **passenger** (passenger name won't match verification on driver's report)
- Law firm only has client full name, nothing else

**Steps:**

1. **Wrapper fails Page 2**
   - Wrapper successfully enters Page 1 (report found)
   - Face page hint detected (alert on portal screen)
   - Page 2 verification fails (name doesn't match, no other identifiers)
   - Wrapper returns: `PAGE2_BLOCKED` with `reportTypeHint: 'FACE_PAGE'`

2. **Auto-escalation triggered**
   - Status set to: `NEEDS_IN_PERSON_PICKUP`
   - Escalation reason: `auto_exhausted`
   - Event: `escalation_auto_triggered`

3. **Modal shown immediately**
   - Title: "We need your help"
   - Message: "To complete your request, please upload your Authorization to Obtain Governmental Agency Records and Reports."
   - File upload field (PDF only)
   - "Submit" button

4. **Law firm uploads authorization**
   - Selects authorization PDF
   - Optionally updates client full name (for better UI + invoicing)
   - Clicks "Submit"

5. **Job created with escalation**
   - Job created with all Fast Form data
   - Authorization document uploaded: `authorizationDocumentToken` set
   - Escalation status: `authorization_received`
   - Event: `authorization_uploaded`
   - Notification sent to staff: "Authorization Uploaded"

6. **Staff picks up**
   - Job appears in Staff Queue under "Escalated" tab
   - Shows as **Ready to Claim** (Tier 1 - auth uploaded, unclaimed)
   - Staff claims job → Downloads authorization packet (auto-generated cover letter + auth)
   - Staff schedules CHP office pickup
   - Staff manually uploads face page or full report

**Result:**
- Job in system with full context (Fast Form data + authorization)
- Staff can proceed with manual pickup
- Law firm receives notifications throughout process

---

### Flow 10: Report Checker via Face Page Upload (V2.5.0+)

**When:** Law firm already has a face page (from another source) and wants to check if full report is ready.

**Purpose:** Alternative entry method for law firms who obtained face page elsewhere.

**Actors:** Law Firm User, CHP Wrapper (in check-only mode)

**Steps:**

1. **Law firm accesses Report Checker**
   - Navigates to `/law/report-checker`
   - Sees simple upload interface

2. **Law firm uploads face page**
   - Selects face page PDF they already have
   - Clicks "Check if Report Ready"

3. **System scans face page**
   - OCR extracts report number and client name
   - Validates extracted data
   - Shows preview: "Report #9465-2025-02802 for John Doe"

4. **Law firm confirms and checks**
   - Clicks "Yes, check this report"
   - Loading state: "Checking CHP portal..."

5. **System runs wrapper in check-only mode**
   - Wrapper uses extracted data
   - Mode: `check_only` (doesn't download again, just checks status)

6. **Result A: Full report ready + not in system**
   - Wrapper returns: `FULL_REPORT` available
   - System checks: Report number + client name NOT in jobs database
   - **Job created automatically**
   - Status: `COMPLETED_FULL_REPORT`
   - Tagged: `submittedVia: 'report_checker'`
   - Full report downloaded
   - Law firm sees: "Good news! The full report is ready. We've created a job and downloaded it for you."
   - Redirected to job detail with download button

7. **Result B: Full report ready + already in system**
   - Wrapper returns: `FULL_REPORT` available
   - System checks: Job already exists for this report
   - **Existing job updated** with full report
   - Status updated to: `COMPLETED_FULL_REPORT`
   - Law firm sees: "The full report is now ready for your existing request."
   - Redirected to existing job detail

8. **Result C: Still only face page**
   - Wrapper returns: `FACE_PAGE` (not ready yet)
   - Law firm sees: "The full report isn't ready yet. Check back later, or submit a full request to enable auto-checker."
   - Option to create full job with auto-checker

**Key Value:**
- Law firms can quickly check reports they already have
- Auto-creates jobs if full report ready
- No duplicate jobs (checks existing first)
- Seamless integration with existing flow

---

### Update to Flow 1: Standard Flow Button

**NEW (V2.5.0+):** On the Fast Form page, there's a secondary link/button: **"Use Standard Flow"**

This routes to `/law/jobs/new` (the original 2-field form) for law firms who:
- Don't have all crash details upfront
- Prefer the step-by-step wizard approach
- Want to trigger driver/passenger selection flow

All existing Flow 1 logic remains unchanged. Standard Flow is now the **legacy entry method**, while Fast Form is the **primary entry point**.

---

## 4. Status System Architecture

### Status Design Philosophy

The status system has two layers:
1. **Internal Status:** What staff sees - technical, detailed, reflects actual system state
2. **Public Status:** What law firms see - friendly, simplified, hides technical details

This separation is critical: law firms should never know about automation, manual pickups, or technical errors.

### Complete Status Mapping Table

| Internal Status | Public Status | Badge Color | Description (Staff) | Message (Law Firm) |
|-----------------|---------------|-------------|---------------------|-------------------|
| `NEW` | `IN_PROGRESS` | Blue | Job just created, entering active state | "We're working on your request." |
| `NEEDS_CALL` | `IN_PROGRESS` | Blue | Requires phone call to CHP for crash details | "We're working on your request" |
| `CALL_IN_PROGRESS` | `CONTACTING_CHP` | Blue (pulse) | Currently calling CHP | "We're contacting CHP about your report" |
| `READY_FOR_AUTOMATION` | `IN_PROGRESS` | Blue | Ready to trigger CHP wrapper | "We're working on your request" |
| `AUTOMATION_RUNNING` | `CONTACTING_CHP` | Blue (animated) | CHP wrapper currently executing | "We're contacting CHP about your report" |
| `FACE_PAGE_ONLY` | `FACE_PAGE_READY` | Yellow | Face page downloaded, full report not ready | "We've received a preliminary copy (face page) from CHP" |
| `WAITING_FOR_FULL_REPORT` | `WAITING_FOR_REPORT` | Yellow | Checking if full report available | "We're waiting for the full report from CHP" |
| `COMPLETED_FULL_REPORT` | `REPORT_READY` | Green | Full report successfully downloaded | "Your report is ready to download" |
| `COMPLETED_MANUAL` | `REPORT_READY` | Green | Manually completed by specialist | "Your report is ready to download" |
| `COMPLETED_FACE_PAGE_ONLY` | `REPORT_READY` | Green | Law firm completed with face page only (V1.6.0) | "Your report is ready to download" |
| `NEEDS_MORE_INFO` | `NEEDS_INFO` | Amber | Missing verification info (driver name) | "We need a bit more information to continue" |
| `NEEDS_IN_PERSON_PICKUP` | `IN_PROGRESS` | Blue | Requires manual retrieval from CHP office | "We're working on your request" |
| `AUTOMATION_ERROR` | `IN_PROGRESS` | Blue | Wrapper encountered error | "We're working on your request" |
| `CANCELLED` | `CANCELLED` | Red | Request cancelled | "This request has been cancelled" |

### Status Badge Colors

```typescript
const statusColors = {
  // Success states
  REPORT_READY: 'green',
  COMPLETED_FULL_REPORT: 'green',
  COMPLETED_MANUAL: 'green',

  // In progress states
  CONTACTING_CHP: 'blue',
  IN_PROGRESS: 'blue',
  CALL_IN_PROGRESS: 'blue',
  AUTOMATION_RUNNING: 'blue',

  // Waiting states
  FACE_PAGE_READY: 'yellow',
  FACE_PAGE_ONLY: 'yellow',
  WAITING_FOR_REPORT: 'yellow',
  WAITING_FOR_FULL_REPORT: 'yellow',

  // Action needed
  NEEDS_INFO: 'amber',
  NEEDS_MORE_INFO: 'amber',

  // Initial/terminal
  SUBMITTED: 'gray',
  NEW: 'blue',  // V1.0.6+: NEW maps to IN_PROGRESS (active state)
  CANCELLED: 'red',
};
```

### Status Transition Rules

```mermaid
stateDiagram-v2
    [*] --> NEW: Job created
    NEW --> NEEDS_CALL: Missing Page 1 data
    NEW --> CALL_IN_PROGRESS: Staff clicks Call CHP
    NEW --> READY_FOR_AUTOMATION: Has all data

    NEEDS_CALL --> CALL_IN_PROGRESS: Staff starts call
    CALL_IN_PROGRESS --> READY_FOR_AUTOMATION: Page 1 complete

    READY_FOR_AUTOMATION --> AUTOMATION_RUNNING: Wrapper triggered

    AUTOMATION_RUNNING --> COMPLETED_FULL_REPORT: Full report found
    AUTOMATION_RUNNING --> FACE_PAGE_ONLY: Face page only
    AUTOMATION_RUNNING --> NEEDS_MORE_INFO: Verification failed
    AUTOMATION_RUNNING --> AUTOMATION_ERROR: Wrapper error

    FACE_PAGE_ONLY --> WAITING_FOR_FULL_REPORT: Auto-checker running
    WAITING_FOR_FULL_REPORT --> COMPLETED_FULL_REPORT: Full report found
    WAITING_FOR_FULL_REPORT --> FACE_PAGE_ONLY: Still face page only

    NEEDS_MORE_INFO --> READY_FOR_AUTOMATION: Info added
    AUTOMATION_ERROR --> READY_FOR_AUTOMATION: Retry
    AUTOMATION_ERROR --> NEEDS_IN_PERSON_PICKUP: Escalate

    NEEDS_IN_PERSON_PICKUP --> COMPLETED_MANUAL: Manual upload

    COMPLETED_FULL_REPORT --> [*]
    COMPLETED_MANUAL --> [*]
    CANCELLED --> [*]
```

---

## 5. Data Model Reference

### Job Record (chpJobs)

The primary data structure for crash report requests.

```typescript
interface Job {
  // ========== V1 MVP FIELDS ==========
  // Identity
  _id: string;                      // Unique job ID (Convex ID)

  // Law Firm Info
  lawFirmId: string;                // Which law firm owns this job
  lawFirmName: string;              // Law firm display name

  // Client Info (V1 basic tracking)
  clientName: string;               // Full name: "Dora Cruz-Arteaga"

  // Report Info
  reportNumber: string;             // Format: "9XXX-YYYY-ZZZZZ"

  // Page 1 Data (Crash Details)
  crashDate?: string;               // Format: "mm/dd/yyyy"
  crashTime?: string;               // Format: "HHMM" (24-hour, e.g., "1430")
  ncic?: string;                    // 4 digits, starts with "9" (auto-derived from reportNumber)
  officerId?: string;               // 5 digits, left-padded with zeros
  locationDescription?: string;     // Optional location reference

  // Page 2 Data (Verification)
  firstName?: string;               // Auto-split from clientName
  lastName?: string;                // Auto-split from clientName
  plate?: string;                   // License plate number
  driverLicense?: string;           // Driver's license number
  vin?: string;                     // Vehicle identification number

  // Status & Files
  internalStatus: InternalStatus;   // Staff-facing status
  facePageToken?: string;           // Convex storage ID for face page PDF
  fullReportToken?: string;         // Convex storage ID for full report PDF

  // CHP Wrapper History (V1 basic runs)
  wrapperRuns?: WrapperRun[];       // Array of all wrapper executions

  // Timestamps
  createdAt: number;                // Unix timestamp (ms)
  updatedAt: number;                // Unix timestamp (ms)

  // ========== V1.0.5+ INTERACTIVE STATE ==========
  // Frontend state tracking for interactive flows
  clientType?: 'driver' | 'passenger' | null; // V1.0.5+: null until selected
  interactiveState?: InteractiveState;        // V1.0.5+: Flow wizard and rescue tracking
  passengerProvidedData?: PassengerProvidedData; // V1.0.5+: Data from passenger mini form

  // ========== V2 BACKEND FIELDS ==========
  // Additional tracking for enhanced workflow
  caseReference?: string;           // Law firm's internal case number
  additionalPartyInfo?: string;     // Other driver/passenger details
  createdBy?: string;               // User ID who created job
  wasAutoEscalated?: boolean;       // True if auto-escalated to manual
  guaranteedName?: string;          // Verified name from manually uploaded face page
  lastWrapperRun?: number;          // Timestamp of most recent run
  lastWrapperResult?: WrapperResultType; // Result of most recent run
  escalationNotes?: string;         // Notes about why escalated

  // ========== V3 VAPI FIELDS ==========
  // Voice AI caller integration
  officeAttemptIndex?: number;      // Current office index for hopping
  officeAttempts?: OfficeAttempt[]; // History of VAPI call attempts

  // ========== V2.5 FAST FORM & ORGANIZATIONS ==========
  // Multi-tenant + Fast Form + Collaborators
  organizationId?: string;          // Clerk organization ID (V2.5.1+)
  organizationName?: string;        // Organization display name (V2.5.1+)
  collaboratorIds?: string[];       // Clerk user IDs of collaborators (V2.5.0+)
  submittedVia?: 'fast_form' | 'standard_flow' | 'report_checker' | 'fatal_form'; // Entry method (V2.5.0+)
  fastFormData?: FastFormData;      // Fast Form submission metadata (V2.5.0+)
  perjuryCheckboxAcknowledged?: boolean; // Required checkbox checked (V2.5.0+)

  // ========== V2.5 ESCALATION ENHANCEMENTS ==========
  // Staff authorization packet generation
  escalationData?: EscalationData;  // Escalation workflow tracking (V1.6.0+, enhanced V2.5.2+)
}
```

### Status Enums

```typescript
type InternalStatus =
  | 'NEW'
  | 'NEEDS_CALL'
  | 'CALL_IN_PROGRESS'
  | 'READY_FOR_AUTOMATION'
  | 'AUTOMATION_RUNNING'
  | 'FACE_PAGE_ONLY'
  | 'WAITING_FOR_FULL_REPORT'
  | 'COMPLETED_FULL_REPORT'
  | 'COMPLETED_MANUAL'
  | 'NEEDS_MORE_INFO'
  | 'NEEDS_IN_PERSON_PICKUP'
  | 'AUTOMATION_ERROR'
  | 'CANCELLED';

type PublicStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'CONTACTING_CHP'
  | 'FACE_PAGE_READY'
  | 'WAITING_FOR_REPORT'
  | 'REPORT_READY'
  | 'NEEDS_INFO'
  | 'CANCELLED';
```

### Interactive State (V1.0.5+)

```typescript
// V1.1.0+: Flow wizard step tracking
type FlowStep = 'selection' | 'verification' | 'speedup' | 'crash_details' | 'done';

// V1.0.5+: Interactive state tracking for law firm job view
interface InteractiveState {
  // V1.0.5+ Interactive prompts
  driverPassengerAsked: boolean;    // Has driver/passenger prompt been shown?
  chpNudgeDismissed: boolean;       // Has CHP call nudge been dismissed?

  // V1.1.0+ Flow wizard tracking
  flowStep?: FlowStep;              // Current step in flow wizard
  speedUpOffered?: boolean;         // Has speed-up prompt been shown?
  speedUpAccepted?: boolean;        // Did user accept speed-up?
  passengerVerification?: PassengerVerificationData; // Passenger verification form data
  crashDetailsProvided?: boolean;   // Has crash details form been submitted?
  flowCompletedAt?: number;         // Timestamp when flow completed

  // V1.2.0+ Rescue form tracking
  rescueInfoProvided?: boolean;     // Has rescue form been submitted?
  rescueInfoTimestamp?: number;     // When rescue info was provided
  rescueFormData?: RescueFormData;  // Rescue form data
}

// V1.0.5+: Data provided by passenger from mini form
interface PassengerProvidedData {
  plate?: string;                   // License plate from passenger
  driverLicense?: string;           // Driver license from passenger
  vin?: string;                     // VIN from passenger
  providedAt: number;               // Timestamp when provided
}

// V1.1.0+: Passenger verification form data
interface PassengerVerificationData {
  plate?: string;
  driverLicense?: string;
  vin?: string;
  additionalNames?: Array<{ firstName: string; lastName: string }>;
}

// V1.2.0+: Rescue form data for Page 2 verification failures
interface RescueFormData {
  plate?: string;
  driverLicense?: string;
  vin?: string;
  additionalNames?: Array<{ firstName: string; lastName: string }>;
}
```

### Wrapper Run Record

```typescript
// ========== V1 MVP IMPLEMENTATION (V1.2.0+) ==========
// Wrapper execution tracking with conditional rescue support
interface WrapperRun {
  runId: string;                    // Unique execution ID
  timestamp: number;                // When wrapper was executed
  result: WrapperResult;            // See WrapperResult type below
  duration: number;                 // Execution time in ms
  errorMessage?: string;            // Error details if result === PORTAL_ERROR
  page1Passed?: boolean;            // V1.2.0+: True if Page 1 search succeeded
  reportTypeHint?: ReportTypeHint;  // V1.2.0+: Known report type even when verification fails
}

// V1.2.0+: 5 distinct result types for failure differentiation
type WrapperResult =
  | 'FULL'                      // Success - full report downloaded
  | 'FACE_PAGE'                 // Success - face page only (full report not yet available)
  | 'PAGE1_NOT_FOUND'           // Page 1 failed - report not found with given date/time/officer
  | 'PAGE2_VERIFICATION_FAILED' // Page 1 passed, Page 2 verification failed - needs rescue form
  | 'PORTAL_ERROR';             // Technical error (timeout, portal down, etc.) - auto-retry

// V1.2.0+: Report type hint known after Page 1 succeeds
type ReportTypeHint = 'FULL' | 'FACE_PAGE' | 'UNKNOWN';

// ========== V2+ EXTENDED IMPLEMENTATION ==========
// Full tracking with debugging and reporting capabilities
interface WrapperRunExtended extends WrapperRun {
  message: string;                  // Human-readable result message
  downloadToken?: string;           // Convex storage ID for downloaded PDF
  journeyLog: JourneyStep[];        // Step-by-step automation log
  inputSent: {                      // What data was sent to wrapper
    reportNumber: string;
    crashDate: string;
    crashTime: string;
    ncic: string;
    officerId: string;
    firstName?: string;
    lastName?: string;
    plate?: string;
    driverLicense?: string;
    vin?: string;
  };
}

interface JourneyStep {
  timestamp: string;                // ISO timestamp
  step: string;                     // Step name
  status: 'success' | 'error';
  details?: string;                 // Additional info
}
```

### Office Attempt Record (V3 - VAPI)

```typescript
interface OfficeAttempt {
  officeCalled: string;             // Office phone or name
  outcome: VAPIOutcome;             // Result of the call
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  crashTime24h?: string;            // Extracted crash time
  officerId?: string;               // Extracted officer ID
  rawTimeSpoken?: string;           // Exact words for time
  rawOfficerIdSpoken?: string;      // Exact words for officer ID
  callNotes?: string;               // Summary of what happened
  calledAt: number;                 // Timestamp
}

type VAPIOutcome =
  | 'SUCCESS'
  | 'REPORT_NOT_FOUND'
  | 'NO_INFORMATION_GIVEN'
  | 'OFFICE_CLOSED_OR_VOICEMAIL'
  | 'CALL_DROPPED_OR_TOO_NOISY'
  | 'TRANSFERRED_LOOP_OR_TIMEOUT';
```

### Event Record (jobEvents)

Timeline events for each job.

```typescript
interface JobEvent {
  _id: string;                      // Unique event ID
  jobId: string;                    // Reference to job
  eventType: EventType;             // Type of event
  message: string;                  // Human-readable description
  isUserFacing: boolean;            // True = visible to law firm
  userId?: string;                  // Who triggered this event
  timestamp: number;                // When event occurred
  metadata?: Record<string, any>;   // Additional event data
}

type EventType =
  // V1 MVP Event Types (Base)
  | 'job_created'
  | 'status_change'
  | 'page1_updated'
  | 'page2_updated'
  | 'wrapper_triggered'
  | 'wrapper_completed'
  | 'file_uploaded'
  | 'check_requested'              // Auto-checker run
  | 'escalated'
  | 'completed'
  | 'message'

  // V1.0.5+ Interactive Prompt Events
  | 'driver_passenger_prompt'      // Prompt shown asking driver/passenger
  | 'driver_selected'              // User selected "Driver"
  | 'passenger_selected'           // User selected "Passenger"
  | 'passenger_data_provided'      // Passenger submitted mini form
  | 'chp_nudge_shown'              // CHP call nudge displayed

  // V1.0.6+ Auto-Wrapper Events
  | 'page1_details_request'        // Crash details prompt shown
  | 'auto_wrapper_triggered'       // Law firm triggered wrapper
  | 'auto_wrapper_success'         // Auto-wrapper succeeded
  | 'auto_wrapper_failed'          // Auto-wrapper failed

  // V1.1.0+ Flow Wizard Events
  | 'flow_speedup_prompt'          // Speed-up prompt shown
  | 'flow_speedup_yes'             // User accepted speed-up
  | 'flow_speedup_no'              // User declined speed-up
  | 'flow_crash_details_saved'     // Crash details saved in flow
  | 'flow_verification_saved'      // Passenger verification saved in flow
  | 'flow_completed'               // Flow wizard completed

  // V1.2.0+ Rescue Flow Events
  | 'page1_not_found'              // Page 1 search failed
  | 'page2_verification_needed'    // Page 2 verification failed, rescue needed
  | 'rescue_info_saved'            // Rescue form submitted
  | 'rescue_wrapper_triggered'     // Wrapper re-triggered after rescue

  // V3 VAPI Event Types (Future)
  | 'vapi_call_started'
  | 'vapi_call_completed'
  | 'vapi_call_failed';
```

### User-Facing Events

Events with `isUserFacing: true` appear in the law firm chat timeline:

| Event Type | Message Example |
|------------|-----------------|
| `job_created` | "Request submitted" |
| `status_change` to CONTACTING_CHP | "We're contacting CHP about your report" |
| `wrapper_completed` with FACE_PAGE | "We've received a preliminary copy (face page) from CHP" |
| `wrapper_completed` with FULL | "Your report is ready to download" |
| `status_change` to NEEDS_INFO | "We need a bit more information to continue" |
| `completed` | "Your report is ready to download" |

---

### Fast Form Data (V2.5.0+)

```typescript
interface FastFormData {
  page1Complete: boolean;           // All Page 1 fields filled
  page2FieldsProvided: string[];    // Which Page 2 fields were provided: ['name', 'plate', 'driverLicense', 'vin']
  submittedAt: number;              // Timestamp of submission
}
```

---

### Escalation Data (V1.6.0+, Enhanced V2.5.2+)

```typescript
interface EscalationData {
  // V1.6.0+ Core escalation tracking
  status: EscalationStatus;         // 'pending_authorization' | 'authorization_received' | 'claimed' | 'pickup_scheduled' | 'completed'
  escalatedAt: number;              // When escalated
  escalationReason: EscalationReason; // 'manual' | 'auto_exhausted' | 'fatal_report'

  // Authorization tracking
  authorizationRequested?: boolean;
  authorizationRequestedAt?: number;
  authorizationDocumentToken?: string; // Convex storage ID
  authorizationUploadedAt?: number;

  // Staff claiming
  claimedBy?: string;               // Staff member name
  claimedAt?: number;

  // Pickup scheduling
  scheduledPickupTime?: PickupTimeSlot; // '9am' | 'afternoon' | '4pm'
  scheduledPickupDate?: string;     // 'YYYY-MM-DD' format
  pickupNotes?: string;

  // Completion
  completedAt?: number;
  completedBy?: string;

  // Resume flow (V1.6.1+)
  guaranteedName?: string;          // Name from face page (unlocks auto-checker)

  // V2.5.2+ Authorization packet generation
  authPacketGeneratedBy?: string;   // Staff member's full name
  authPacketGeneratedAt?: number;   // When cover letter was generated
  authDocumentAcknowledged?: boolean; // Staff downloaded and acknowledged
  authDocumentAcknowledgedAt?: number;
}

type EscalationStatus = 'pending_authorization' | 'authorization_received' | 'claimed' | 'pickup_scheduled' | 'completed';
type EscalationReason = 'manual' | 'auto_exhausted' | 'fatal_report';
type PickupTimeSlot = '9am' | 'afternoon' | '4pm';
```

---

## 6. Organizations & Authentication

### Organization Model (V2.5.1+)

Multi-tenant organization structure using Clerk.

```typescript
interface Organization {
  id: string;                       // Clerk org ID
  name: string;                     // Display name: "Law Brothers"
  emailDomain: string;              // Domain: "lawbrothers.com"
  createdAt: number;                // Unix timestamp
  memberCount: number;              // Total users in org

  // Admin-configured staff assignments (V2.5.2+)
  staffAssignments?: {
    firmId: string;                 // Organization ID
    assignedStaffIds: string[];     // Staff user IDs
    jobTypes: ('escalated' | 'standard')[];
  }[];
}
```

**Organization Auto-creation:**
- User signs up with email `john@lawbrothers.com`
- System extracts domain: `lawbrothers.com`
- If org doesn't exist for domain → Create "Law Brothers" org
- If org exists → Add user to existing org
- Set `user.organizationId` and `user.organizationName`

---

### User Model (V2.5.1+)

User/Staff model with Clerk authentication.

```typescript
interface User {
  id: string;                       // Clerk user ID
  email: string;                    // User email
  firstName: string;                // First name
  lastName: string;                 // Last name
  organizationId: string;           // Clerk org ID
  role: 'law_firm' | 'staff' | 'admin_staff';

  // Staff-specific fields
  assignedFirms?: string[];         // Org IDs staff manages (for staff/admin_staff)
  assignedJobTypes?: ('escalated' | 'standard')[]; // Job types staff handles
}
```

**Clerk Public Metadata:**
```typescript
interface ClerkPublicMetadata {
  role: 'law_firm' | 'staff' | 'admin_staff';
  assignedFirms?: string[];         // Staff only
  assignedJobTypes?: string[];      // Staff only
}
```

**Role Permissions:**

| Role | Can Do |
|------|--------|
| **law_firm** | Submit requests, view own org's jobs, add collaborators, download reports |
| **staff** | Claim jobs, schedule pickups, upload reports, assign jobs to other staff, message colleagues |
| **admin_staff** | All staff permissions + assign staff to firms, assign job types, see all messages |

---

### Collaborator Settings (V2.5.0+)

Notification preferences for collaborators on jobs.

```typescript
interface CollaboratorSettings {
  userId: string;                   // Clerk user ID of collaborator
  jobId: string;                    // Job ID
  notifyOn: ('status_change' | 'report_ready' | 'escalation' | 'all')[];
  addedBy: string;                  // User ID who added them
  addedAt: number;                  // Timestamp
}
```

**Default Behavior:**
- Collaborators receive all major notifications (status changes, report ready, escalation)
- Can be added during Fast Form or Standard Flow submission
- Can invite new users via email (generates Clerk invite link)
- Invited users auto-added as collaborator once they join org

---

### Wrapper Integration Updates (V2.5.0+)

**Face Page Detection Signal:**

When Playwright worker successfully enters Page 1 portal information, the CHP portal shows an **alert** if the report is a **face page**. No alert is shown if it's a **full report**.

```typescript
interface WrapperResponse {
  outcome: 'FULL_REPORT' | 'FACE_PAGE' | 'PAGE1_FAILED' | 'PAGE2_BLOCKED' | 'PORTAL_ERROR';
  reportTypeHint: 'FACE_PAGE' | 'FULL_REPORT' | 'UNKNOWN';  // ← NEW: From alert detection
  artifacts?: {
    facePageUrl?: string;
    fullReportUrl?: string;
  };
  publicSafeMessageKey?: string;
  debugDetails?: {
    page1Success: boolean;
    page2FieldsTried: ('name' | 'plate' | 'driverLicense' | 'vin')[];
    page2Results: Record<string, 'success' | 'failed'>;
    alertDetected: boolean;         // ← NEW: Whether face page alert was shown on portal
  };
}
```

**Signal Available Even on Page 2 Failure:**
- If wrapper can't surpass Page 2 (no verification info)
- Face page hint still captured from Page 1 success screen
- Helpful for escalation context: "We know it's a face page, even though we couldn't download it"
- Never shows raw alert text to law firms (UI mapping only)

---

**Related Documents:**
- [Product Foundation](01-product-foundation.md) - Vision, roadmap, architecture
- [Screen Specifications](03-screen-specifications.md) - All 6 screen UI/UX specs
- [CHP Wrapper](04-chp-wrapper.md) - Automation engine deep dive
- [Implementation Guide](06-implementation-guide.md) - Validation rules and standards
- [CHANGELOG.md](../../CHANGELOG.md) - What's actually shipped

*Part of the InstaTCR documentation suite. See [INSTATCR-MASTER-PRD.md](../../INSTATCR-MASTER-PRD.md) for navigation.*
