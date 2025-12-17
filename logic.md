# InstaTCR Complete Flow Audit & Business Logic

**Version:** V2.5.0+
**Last Updated:** 2025-12-15
**Scope:** Frontend + Backend flows, entry methods, organizations, staff workspace, Clerk authentication

This document comprehensively describes every user flow, business rule, and logic pattern in the InstaTCR application across all versions (V1-V2.5+). It covers law firm entries, staff operations, wrapper integration, organizations, and edge cases.

---

## Table of Contents

1. [Product Purpose & Core Value](#product-purpose--core-value)
2. [Data + Status Rules](#data--status-rules)
3. [Entry Methods](#entry-methods)
4. [Law Firm Flows](#law-firm-flows)
5. [Staff Flows](#staff-flows)
6. [Organizations & Authentication](#organizations--authentication)
7. [CHP Wrapper Integration](#chp-wrapper-integration)
8. [Collaborators & Notifications](#collaborators--notifications)
9. [Device Context & UX Guidelines](#device-context--ux-guidelines)
10. [Mock Scenario Coverage](#mock-scenario-coverage)
11. [Behavioral Edge Cases & Guarantees](#behavioral-edge-cases--guarantees)

---

## Product Purpose & Core Value

**Primary Use Case:** When a law firm receives a new case where the accident occurred within the past 72 hours (possibly same day or day before), they urgently need the crash report. **99% of the time at this stage, it will be a face page** — the full report isn't ready yet.

**Core Workflow:**
1. Law firm inputs crash details via **Fast Form** (all Page 1 + at least one Page 2 field)
2. System triggers wrapper successfully
3. Law firm receives face page (most common outcome)
4. **AUTO-CHECKER activates** — the most critical feature of the entire application
5. System monitors daily or twice-daily when full report becomes available

**Key Value Proposition:**
Once a face page is uploaded (manual or automated), that job now has **full real-time tracking**. The auto-checker feature alone is invaluable for law firms managing time-sensitive cases.

---

## Data + Status Rules

### Mock Jobs
- `src/lib/mockData.ts` defines 27 jobs (22 prod-style + 5 dev) spanning all 14 internal statuses
- Helper accessors live in `src/lib/mockDataManager.ts`
- V2.5+ adds organization IDs, collaborator IDs, and Fast Form submission metadata

### Status Mapping
- **Canonical source:** `src/lib/statusMapping.ts`
- **14 internal statuses** (staff-only) → **8 public statuses** (law firm visible)
- Law firms only see public status + message (`STATUS_MESSAGES`)
- Colors vary by theme (light/dark mode)

**Internal Statuses:**
`NEW`, `NEEDS_CALL`, `CALL_IN_PROGRESS`, `READY_FOR_AUTOMATION`, `AUTOMATION_RUNNING`, `FACE_PAGE_ONLY`, `WAITING_FOR_FULL_REPORT`, `COMPLETED_FULL_REPORT`, `COMPLETED_MANUAL`, `COMPLETED_FACE_PAGE_ONLY`, `NEEDS_MORE_INFO`, `NEEDS_IN_PERSON_PICKUP`, `AUTOMATION_ERROR`, `CANCELLED`

**Public Statuses:**
`SUBMITTED`, `IN_PROGRESS`, `CONTACTING_CHP`, `FACE_PAGE_READY`, `WAITING_FOR_REPORT`, `REPORT_READY`, `NEEDS_INFO`, `CANCELLED`

### Escalation Helpers
- `src/lib/jobUIHelpers.ts` gates wrapper UI, auto-checker visibility, and escalation steps
- Fatal jobs and terminal escalations hide automation UI
- Face page + guaranteed name unlocks resuming from escalated state

### Events
- `mockJobEvents` cover user-facing timelines plus staff-only entries
- `MockDataManager` appends new events for every interaction
- V2.5+ adds events for Fast Form submission, collaborator additions, authorization packet generation

### Randomized Mocks (V1)
- **Wrapper:** 30% full, 35% face page, 15% page1 fail, 15% page2 fail, 5% portal error
- **Auto-checker/manual reopen:** 20% chance of finding full report

---

## Entry Methods

### 1. Fast Form (V2.5.0+) — **PRIMARY ENTRY POINT**

**Purpose:** Accelerated entry for time-sensitive cases (72-hour window)

**Fields Collected:**

**Page 1 (Portal Information) — All Required:**
- Report Number (format: `9XXX-YYYY-ZZZZZ`)
- Crash Date (MM/DD/YYYY)
- Crash Time (HHMM, 24-hour)
- Officer ID (5 digits, left-padded with zeros)
- NCIC (auto-derived from report number, read-only)

**Page 2 (Verification) — At Least One Required:**
- Client Full Name (always present)
- License Plate (optional)
- Driver License Number (optional)
- VIN (optional)

**Legal & Collaboration:**
- **Perjury Checkbox (Required):** "I declare under penalty of perjury that I am a person having proper interest or an authorized representative therein as outlined above and as required by California law."
- **Collaborators (Optional):** Multi-select colleagues from organization or invite via email

**Submission Flow:**
1. User fills all fields and checks perjury box
2. Clicks "Submit Fast Form"
3. Loading state: "Running wrapper..." (8-13 seconds)
4. **Success (99% of cases):** Face page or full report downloaded → Job created → Redirect to job detail
5. **Failure (1% - no Page 2 verification info):** Auto-escalation triggered → Authorization upload prompt shown immediately

**Outcomes:**
- **Full Report (30%):** Job marked `COMPLETED_FULL_REPORT`, download available
- **Face Page (65%):** Job marked `FACE_PAGE_ONLY`, auto-checker offered
- **Page 2 Blocked (5%):** Auto-escalation → `NEEDS_IN_PERSON_PICKUP`, authorization upload required

**Location:** `/law/jobs/new-fast` (V2.5.0+)

---

### 2. Standard Flow — **LEGACY ENTRY (Still Available)**

**Purpose:** Step-by-step wizard for cases with incomplete information

**Fields Collected:**
- Client Name (Step 1)
- Report Number (Step 1)
- Driver/Passenger selection (Step 2)
- Optional verification fields (Step 3)
- Optional crash details (Step 4)

**Submission Flow:**
1. Job created with status `NEEDS_CALL`
2. Events added: `job_created`, `driver_passenger_prompt`
3. Staff fills Page 1 data via Staff Controls
4. Once Page 1 + any Page 2 field exist → Wrapper can run

**Access:** Link on Fast Form page: "Use Standard Flow" (secondary button)

**Location:** `/law/jobs/new` (V1.0.0+)

---

### 3. Fatal Report Flow — **IMMEDIATE ESCALATION**

**Purpose:** Fatal crashes require manual pickup (death certificate + authorization)

**Fields Collected:**
- Client Name
- Report Number
- Authorization PDF (required)
- "Was client deceased?" (yes/no)
- Death Certificate PDF (required if yes, unless dev skip)

**Submission Flow:**
1. Job created with `isFatal: true`
2. Status: `NEEDS_IN_PERSON_PICKUP`
3. Escalation reason: `fatal_report`
4. Events: `fatal_report_created`, `escalation_fatal_triggered`, `authorization_uploaded`, `death_certificate_uploaded`
5. No wrapper runs (manual pickup only)

**Location:** `/law/jobs/new-fatal` (V1.6.0+)

---

### 4. Report Checker via Face Page Upload (V2.5.0+)

**Purpose:** Law firm already has face page, wants to check if full report is ready

**Fields Collected:**
- Face Page PDF upload

**Submission Flow:**
1. System scans face page (OCR extracts report number + client name)
2. Runs wrapper in `check_only` mode
3. **If successful:**
   - Check if report number + client name already in system
   - **If NOT in system:** Create job + mark `COMPLETED_FULL_REPORT` (checker-complete)
   - **If IN system:** Update existing job with full report
4. **If unsuccessful:** Show message "Report not ready yet, try again later"

**Location:** `/law/report-checker` (V2.5.0+)

---

## Law Firm Flows (App Router `/law`)

### Shell + Navigation (V2.2.0+)
- **AppShell** with collapsible sidebar (ChatGPT-style)
- Sidebar lists jobs filtered by `user.organizationId` (V2.5.1+)
- Welcome canvas (`src/app/law/page.tsx`) shows:
  - Job counts
  - "New Request" CTA → Routes to **Fast Form** (V2.5.0+)
  - "Fatal Request" CTA → Routes to Fatal Form
- Theme: Defaults to dark, user can toggle (light/dark)

### Fast Form Submission (`/law/jobs/new-fast`) — V2.5.0+

**UI Layout:**
- Mobile: Full-width stacked sections (48px touch targets)
- Desktop: 2-column grid (Page 1 left, Page 2 right), full-width Legal section

**Validation:**
- Real-time on blur (after field is touched)
- All-field validation on submit
- Inline error messages below fields
- Perjury checkbox must be checked

**Loading State:**
- Progress bar: "Running wrapper... 8-13 seconds"
- Disable form during submission

**Success Flow:**
- Toast: "Request submitted successfully"
- Navigate to `/law/jobs/{jobId}`
- Show appropriate status card (face page choice, completed, etc.)

**Failure Flow (Auto-escalation):**
- Modal appears immediately: "We need your help"
- Prompt: "To complete your request, please upload your Authorization to Obtain Governmental Agency Records and Reports."
- File upload field + "Submit" button
- On submit with file:
  - Job created with `NEEDS_IN_PERSON_PICKUP` status
  - Escalation reason: `auto_exhausted`
  - Authorization document uploaded
  - Event: `escalation_auto_triggered`, `authorization_uploaded`
  - Navigate to job detail showing "Waiting for staff assignment"

### Standard Flow Submission (`/law/jobs/new`) — V1.0.0+

**Two fields only:**
- Client Name
- Report Number

**On submit:**
- Creates job with status `NEEDS_CALL`
- Adds events: `job_created`, `driver_passenger_prompt`
- Routes to job detail (`/law/jobs/{jobId}`)

**10% simulated network failure** (V1 mock mode)

### Job Detail (`/law/jobs/[jobId]`) — V1.0.0+

**Status Badge:** Uses public mapping (never shows internal status)

**Current Status Card:**
- Hidden for completed/cancelled jobs
- Shows public status message
- Color-coded by status (blue, yellow, green, amber, red)

**Downloads:**
- If `COMPLETED_*`: Show "Download Full Report" or "Download Face Page" buttons
- Mock alert in V1, real download in V2+

**Flow Wizard (`FlowWizard`) — V1.0.5+:**
- Driver/passenger selection
- Passenger verification form (if passenger)
- Speed-up prompt (if passenger with verification)
- Optional crash details
- Completion records `flow_completed` event
- Auto-wrapper trigger: Runs when Page 1 (crash date/time) + any Page 2 field exist

**CHP Nudge (V1.0.5+):**
- Appears after wizard completion on `NEW` status
- Dismissible helper suggesting to contact CHP
- Logs `chp_nudge_dismissed` event

**Page Corrections:**
- **InlineFieldsCard (V1.2.0+):** Appears after Page 1 failure, collects crash date/time/officer + Page 2 identifiers
- **DriverInfoRescueForm (V1.2.0+):** Appears after Page 2 verification failure, collects name/plate/license/VIN

**Contacting CHP Banner (V1.0.5+):**
- For passengers when status is `CONTACTING_CHP` and no passenger info on file

**Face Page Path:**
- **FacePageCompletionChoice (V1.4.0+):** Law firm chooses "Complete with face page" or "Set up auto-checker"
- **Auto-checker setup:** Daily (4:30pm PT) or twice-daily (9am/4:30pm)
- **Reopen banner (V1.4.0+):** If completed with face page, can "Check now" (20% success rate)
- **Manual check button:** Unlimited clicks when waiting

**Escalation/Authorization:**
- **AuthorizationUploadCard (V1.6.0+):** If `NEEDS_IN_PERSON_PICKUP` + `pending_authorization`, requests PDF upload
- Upload sets status to `authorization_received`
- Emits notification to staff
- Logs event: `authorization_uploaded`

**Timeline:**
- Active jobs: Full scrollable timeline with connectors
- Closed jobs: Collapse/expand toggle
- Uses **user-facing events only** (staff-only events hidden)

---

## Staff Flows (App Router `/staff`)

**Device Context:** All staff actions performed on **mobile device** (320px-768px optimized)

### Queue Dashboard (`/staff`) — V1.7.0+

**Firm Filter Dropdown (V2.5.2+):**
- Options: "All Firms" / "Law Brothers" / "Johnson Law" / etc.
- Shows escalated request count per firm
- Example: "Law Brothers: 5 escalated"
- Filters job list by selected firm

**Tabs/Filters:**
- Escalated (default)
- All
- Needs Action
- In Progress
- Completed
- Cancelled

**Escalated Sorting (V1.9.0+):**
- **Tier 1:** Ready to claim (auth uploaded, unclaimed)
- **Tier 2:** Has auth but claimed
- **Tier 3:** Others
- All sorted newest first

**Stats Cards:**
- Derive counts from filtered jobs
- Refresh button re-sorts mock data

**Job Cards:**
- Show internal status badge (staff view)
- Show public status badge (what law firm sees)
- Show law firm name (V2.5.0+)
- Show report metadata (client name, report #, date)
- **Escalated jobs:** Embed `EscalationQuickActions`

### Escalation Quick Actions (`EscalationQuickActions`) — V1.7.0+

**Step Flow:**
1. **Claim** → Staff claims pickup (sets `claimedBy`)
2. **Schedule** → Staff sets pickup date/time (sets `scheduledPickupTime/Date`)
3. **Download Auth** → Staff downloads authorization packet (V2.5.2+: **auto-generates cover letter**)
4. **Upload Report** → Staff uploads face or full report
5. **Auto-check** (optional, non-fatal only) → Check if full report ready

**Gating:**
- All actions require authorization uploaded
- Fatal jobs skip auto-check step

**Download Auth Behavior (V2.5.2+):**
- Generates cover letter PDF with:
  - Law firm name
  - Request details (client, report #, crash date)
  - Authorization confirmation
  - Text: "Dear Sir/Madam: This letter will advise you that our office has been retained..."
  - **Authorized person for pick up:** {Staff's real name from Clerk user}
- Merges cover letter with authorization PDF
- Downloads as single file: `{jobId}_authorization_packet.pdf`
- Sets `authPacketGeneratedBy: staffUser.firstName + ' ' + staffUser.lastName`
- Sets `authPacketGeneratedAt: Date.now()`

**Upload Sheet:**
- Choose face or full report
- Face upload can capture guaranteed name (unlocks auto-checker)
- Full upload marks `COMPLETED_MANUAL`

**Notifications:**
- Claim → Law firm notified "A team member is working on your request"
- Schedule → Law firm notified "Pickup scheduled for {date} at {time}"
- Report ready → Law firm notified "Your report is ready for download"

### Staff Job Detail (`/staff/jobs/[jobId]`) — V1.3.0+

**Dual Tabs (Mobile < 768px):**
- Tab 1: Law Firm View (public timeline)
- Tab 2: Staff Controls (7 cards)

**Split View (Desktop ≥ 768px):**
- Left: Law Firm View
- Right: Staff Controls (7 cards)

**Staff Controls (7 Cards):**

1. **Page 1 Data**
   - Fields: Crash date/time, officer ID, NCIC (auto-filled)
   - "Call CHP" button placeholder
   - VAPI AI Caller placeholder (V3)

2. **Page 2 Verification**
   - Auto-splits client name to first/last
   - Fields: Name, plate, license, VIN
   - Saves and enables wrapper once any identifier exists

3. **CHP Wrapper**
   - Shows prerequisites: Page 1 complete + ≥1 Page 2 field
   - "Run Wrapper" button with progress bar
   - Journey log panel (mock in V1, real in V2+)

4. **Wrapper History**
   - Lists previous runs with colors (green=success, red=fail, yellow=partial)
   - Shows result, duration, timestamp

5. **Auto-Checker**
   - Enabled when face page + name exists
   - Manual check button (20% success rate in mock)
   - Sets status to `WAITING_FOR_FULL_REPORT` on miss

6. **Escalation**
   - Manual escalate dialog (sets `NEEDS_IN_PERSON_PICKUP` with notes)
   - Pickup scheduler
   - Auth download/acknowledge actions
   - Escalation badges show status and auth state

7. **Manual Completion**
   - Upload face or full report
   - Sets tokens, status to `COMPLETED_MANUAL`
   - Optionally save guaranteed name
   - Emits report-ready notification

**Timeline:**
- Law firm view: User-facing events only
- Staff view: All events with visibility markers

**Closed Summary Card (`JobSummaryCard`) — V1.6.2+:**
- Shows report details, verification data, wrapper count
- Allows rerunning wrapper

**Edge Handling:**
- Wrapper/auto-check buttons disable until prerequisites met
- Fatal/terminal escalations hide wrapper UI (`shouldShowWrapperUI`)

### Staff Assignment & Messaging (V2.5.2+)

**Admin Staff Permissions:**
- Assign standard staff to jobs
- Assign staff to responsible law firms
- Assign job types (e.g., "Valerie and Erica handle Escalated Reports for all firms")
- See all messages and participate
- Flexible assignment configurations

**Standard Staff Permissions:**
- Assign jobs to each other ("Hey, I'm busy today. Can you handle this escalated one?")
- Message each other to coordinate
- Assign to admin staff if something goes wrong or both unavailable

**Messaging UI:**
- Threaded conversations per job
- Real-time updates (future: Convex subscriptions)
- Mentions (@Valerie, @Erica)
- Assignment actions: "Assign to Erica" button in message thread

---

## Organizations & Authentication

### Organization Auto-creation (V2.5.1+)

**By Email Domain:**
- User signs up with email `john@lawbrothers.com`
- System extracts domain: `lawbrothers.com`
- Check if org exists for that domain
- **If not:** Create organization "Law Brothers" with ID `org_{uuid}`
- **If yes:** Add user to existing organization
- Set `user.organizationId` and `user.organizationName`

**First User:**
- First user with a domain auto-creates the organization
- Becomes organization member (not admin by default)

**Subsequent Users:**
- Auto-join organization if email domain matches

**Personal Emails:**
- Emails like `@gmail.com`, `@yahoo.com` → Manual org assignment by admin
- Or require users to use work email

### Clerk Integration (V2.5.1+)

**Setup:**
- ClerkProvider wraps root layout
- Middleware protects routes:
  - `/law/*` → requires `user.role === 'law_firm'`
  - `/staff/*` → requires `user.role === 'staff' || user.role === 'admin_staff'`
- Sign-in/sign-up pages at `/sign-in`, `/sign-up`
- Google Auth enabled with Tailwind 4 compatibility (`cssLayerName: 'clerk'`)

**User Roles (Clerk Public Metadata):**
```typescript
interface ClerkPublicMetadata {
  role: 'law_firm' | 'staff' | 'admin_staff'
  assignedFirms?: string[]      // Staff only: Org IDs they manage
  assignedJobTypes?: string[]   // Staff only: ['escalated', 'standard']
}
```

**Organization Model:**
```typescript
interface Organization {
  id: string                    // Clerk org ID
  name: string                  // "Law Brothers"
  emailDomain: string           // "lawbrothers.com"
  createdAt: number
  memberCount: number
  staffAssignments?: {          // Admin-configured
    firmId: string
    assignedStaffIds: string[]
    jobTypes: ('escalated' | 'standard')[]
  }[]
}
```

**User Model:**
```typescript
interface User {
  id: string                    // Clerk user ID
  email: string
  firstName: string
  lastName: string
  organizationId: string
  role: 'law_firm' | 'staff' | 'admin_staff'

  // Staff-specific
  assignedFirms?: string[]      // Org IDs staff manages
  assignedJobTypes?: ('escalated' | 'standard')[]
}
```

### Staff Workspace Organization (V2.5.2+)

**Firm-Scoped Views:**
- Staff logs in → See all firms they manage
- Click "Law Brothers" → Filter dashboard to show only Law Brothers jobs
- Stats update to show firm-specific counts
- Sidebar updates to show firm context

**Dashboard Indicators:**
- Container shows: "Law Brothers: 5 escalated requests"
- Quick navigation between firms
- Dropdown or card grid for firm selection

---

## CHP Wrapper Integration

### Face Page Detection Signal (V2.5.0+)

**Playwright Worker Behavior:**
1. Successfully enters Page 1 portal information
2. CHP portal shows alert if report is a **face page**
3. No alert shown if report is a **full report**
4. Worker detects alert presence and sets `reportTypeHint`

**Signal Available Even on Page 2 Failure:**
- If wrapper can't surpass Page 2 (no verification info)
- Face page hint still captured from Page 1 success screen
- Helpful for escalation context: "We know it's a face page, even though we couldn't download it"

**Response Schema:**
```typescript
interface WrapperResponse {
  outcome: 'FULL_REPORT' | 'FACE_PAGE' | 'PAGE1_FAILED' | 'PAGE2_BLOCKED' | 'PORTAL_ERROR'
  reportTypeHint: 'FACE_PAGE' | 'FULL_REPORT' | 'UNKNOWN'  // From alert detection
  artifacts?: {
    facePageUrl?: string
    fullReportUrl?: string
  }
  publicSafeMessageKey?: string
  debugDetails?: {
    page1Success: boolean
    page2FieldsTried: ('name' | 'plate' | 'driverLicense' | 'vin')[]
    page2Results: Record<string, 'success' | 'failed'>
    alertDetected: boolean      // Whether face page alert was shown
  }
}
```

**UI Handling:**
- Show face page alert badge when `reportTypeHint === 'FACE_PAGE'`
- Show no alert when `reportTypeHint === 'FULL_REPORT'`
- Never show raw technical wording to law firms

### Wrapper Request Schema (V2.5.0+)

```typescript
interface WrapperRequest {
  // Page 1 (all required for Fast Form)
  reportNumber: string
  crashDate: string           // MM/DD/YYYY
  crashTime: string           // HHMM
  officerId: string           // 5 digits, left-padded
  ncic: string                // Auto-derived

  // Page 2 (at least one required)
  clientFullName: string
  plate?: string
  driverLicense?: string
  vin?: string

  // Metadata
  jobId: string
  submittedVia: 'fast_form' | 'standard_flow' | 'report_checker'
  mode: 'full_run' | 'check_only'
}
```

### Wrapper Outcomes (V2.5.0+)

| Outcome | Description | Status Set | Next Action |
|---------|-------------|------------|-------------|
| `FULL_REPORT` | Full report downloaded | `COMPLETED_FULL_REPORT` | Law firm can download |
| `FACE_PAGE` | Face page only | `FACE_PAGE_ONLY` | Offer auto-checker setup |
| `PAGE1_FAILED` | Report not found with Page 1 info | `NEEDS_MORE_INFO` | Show correction card |
| `PAGE2_BLOCKED` | Page 2 verification failed | Auto-escalate or show rescue form | Authorization upload prompt |
| `PORTAL_ERROR` | Technical error | `AUTOMATION_ERROR` | Staff investigates |

### Mock Execution Timing (V1)
- Total: 8-13 seconds
- Phase 1 (Login): 2-3 sec
- Phase 2 (Search): 3-5 sec
- Phase 3 (Verification): 2-3 sec
- Phase 4 (Download): 1-2 sec

---

## Collaborators & Notifications

### Collaborators/CC System (V2.5.0+)

**Purpose:** Allow law firm users to add colleagues to request notifications

**UI:**
- Multi-select field on Fast Form and Standard Flow
- Shows colleagues from same organization (Clerk org members)
- Option to invite via email if not found

**Adding Collaborators:**
1. User types colleague name or email
2. System searches Clerk organization members
3. **If found:** Add to `collaboratorIds` array
4. **If not found:** Generate invite link, send email
5. Invited user joins org → Automatically added as collaborator

**Notification Settings:**
```typescript
interface CollaboratorSettings {
  userId: string
  jobId: string
  notifyOn: ('status_change' | 'report_ready' | 'escalation' | 'all')[]
  addedBy: string
  addedAt: number
}
```

**Default:** Collaborators receive all major updates (status changes, report ready, escalation)

### Notifications (V1.8.0+)

**Types:**
- `ESCALATION_STARTED`
- `AUTHORIZATION_REQUESTED`
- `AUTHORIZATION_UPLOADED` (triggers email in V2+)
- `PICKUP_CLAIMED`
- `PICKUP_SCHEDULED`
- `REPORT_READY`

**Recipients:**
- Job creator (law firm user)
- Collaborators (V2.5.0+)
- Staff (for authorization uploads, messages)

**Email Integration (V1.9.0+):**
- Stub in V1
- Real implementation in V3+ with SendGrid/Resend

**NotificationBell Component (V2.0.0+):**
- Header badge with count
- Dropdown with list
- Keyboard support (Escape to close, Arrow keys to navigate)

---

## Device Context & UX Guidelines

### Staff = Mobile-First (V2.5.0+)

**Optimized for:** 320px-768px

**All staff actions performed on mobile device:**
- Claiming jobs
- Scheduling pickups
- Downloading authorization packets
- Uploading reports
- Messaging colleagues

**Design Requirements:**
- Touch targets ≥ 48px
- Large buttons
- Simple layouts (stacked sections)
- No complex grids
- Thumb-friendly navigation

### Law Firm = Desktop-First (V2.5.0+)

**Optimized for:** 1024px+

**All law firm actions performed on desktop:**
- Submitting Fast Form
- Reviewing job details
- Downloading reports
- Managing collaborators
- Configuring auto-checker

**Design Requirements:**
- Multi-column layouts
- Keyboard shortcuts
- Hover states
- Complex data tables
- Rich text editing

**Note:** Both interfaces work on both devices, but optimization priority differs.

---

## Mock Scenario Coverage

### Status Coverage (V1.0.0+)
All 14 internal statuses represented in mock data:
- `NEW`, `NEEDS_CALL`, `CALL_IN_PROGRESS`, `READY_FOR_AUTOMATION`, `AUTOMATION_RUNNING`, `FACE_PAGE_ONLY`, `WAITING_FOR_FULL_REPORT`, `COMPLETED_FULL_REPORT`, `COMPLETED_MANUAL`, `COMPLETED_FACE_PAGE_ONLY`, `NEEDS_MORE_INFO`, `NEEDS_IN_PERSON_PICKUP`, `AUTOMATION_ERROR`, `CANCELLED`

### Escalation Tiers (V1.6.0+)
- Pending authorization
- Authorization received (ready to claim)
- Claimed
- Pickup scheduled
- Completed
- Fatal auto-escalation (V1.6.0+)

### Fast Form Coverage (V2.5.0+)
- Successful submission → Face page
- Successful submission → Full report
- Failed submission → Auto-escalation → Authorization upload

### Face Page Variants (V1.4.0+)
- Waiting for auto-checker
- Choice pending (complete vs wait)
- Completed with face page only
- Reopened after completion

### Error States (V1.2.0+)
- Page 1 not found → Correction card
- Page 2 verification failed → Rescue form
- Portal error → Automation error status
- Network error (10% mock failure rate)

### Fatal Path (V1.6.0+)
- Auto-escalated on creation
- Skips wizard/wrapper
- Can include death certificate and authorization at creation

---

## Behavioral Edge Cases & Guarantees

### Law Firm Protections
✅ **Law firms NEVER see internal statuses or technical text**
✅ All messaging pulls from `STATUS_MESSAGES` (public mapping)
✅ User-facing events only in timeline
✅ No wrapper debug details exposed

### Auto-checker Visibility Rules
✅ Requires: Face page + name + no full report + not fatal/terminal escalation
✅ Hidden for fatal jobs (manual pickup only)
✅ Hidden for escalations without face page (unless `canResumeFromEscalated`)

### Wrapper UI Visibility Rules
✅ Hidden for fatal jobs
✅ Hidden for terminal escalations (escalated without face page)
✅ Resumes when face page + guaranteed name present

### Fast Form Guarantees (V2.5.0+)
✅ 99% success rate (face page or full report)
✅ 1% failure → Auto-escalation with authorization upload prompt
✅ Perjury checkbox required (cannot submit without)
✅ At least one Page 2 field required (client name always present)

### Organization Rules (V2.5.1+)
✅ Email domain determines organization
✅ First user with domain auto-creates org
✅ Subsequent users auto-join
✅ Staff can manage multiple firms
✅ Admin staff have full visibility

### Staff Authorization Packet (V2.5.2+)
✅ Auto-generates cover letter with staff's real name from Clerk user
✅ Merges with authorization PDF
✅ Downloads as single file
✅ Tracks `authPacketGeneratedBy` and `authPacketGeneratedAt`

### Collaborators (V2.5.0+)
✅ Can only add colleagues from same organization
✅ Can invite new users via email (generates invite link)
✅ Invited users auto-added as collaborator once they join
✅ Receive all major notifications by default

### Wrapper Face Page Detection (V2.5.0+)
✅ Alert detection happens on Page 1 success screen
✅ Signal available even if Page 2 fails
✅ Never shows raw alert text to law firms
✅ Used for context in escalation flows

### Sidebar UX
✅ Clicking selected job in sidebar toggles back to base path (`/law` or `/staff`)
✅ Law firm sidebar defaults open on first visit
✅ Staff sidebar shows firm filter dropdown (V2.5.2+)

### Theme
✅ Staff forced dark mode
✅ Law firms default dark with toggle (light/dark)
✅ System preference detection
✅ Persists to localStorage

### Mock Mode Preservation (V2.5.0+)
✅ V1 mock mode still works behind feature flag
✅ Real wrapper calls gated by env variable
✅ Dev delays configurable in `devConfig.ts`
✅ All mutations go through `MockDataContext` to refresh consumers

---

## Summary

This document represents the complete business logic and flow audit for InstaTCR V2.5.0+, covering:

- **4 Entry Methods:** Fast Form (primary), Standard Flow, Fatal Report, Report Checker
- **14 Internal Statuses** → **8 Public Statuses**
- **Organizations by Email Domain** with Clerk authentication
- **Collaborators/CC System** for team coordination
- **Staff Firm-Scoped Workspace** for managing multiple law firms
- **CHP Wrapper Face Page Detection** for better UX
- **Auto-checker as Core Value** for 72-hour window use cases
- **Staff Authorization Packet Auto-generation** with cover letter
- **Device Context:** Staff=Mobile, Law Firm=Desktop
- **Admin vs Standard Staff Permissions** with messaging and assignment

All flows maintain V1 guarantees (law firms never see technical details, auto-checker visibility gating, wrapper UI hiding for fatal/terminal escalations) while adding new capabilities for multi-tenant operations, accelerated entry, and staff collaboration.

---

*Last Updated: 2025-12-15*
*Version: V2.5.0+*
*Complete flow audit covering V1 MVP through V2.5 enhancements*
