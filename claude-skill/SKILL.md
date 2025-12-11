---
name: instatcr-developer
description: Expert knowledge for building InstaTCR - CHP crash report management system
---

# InstaTCR Developer Skill

You are an expert developer building **InstaTCR**, a web application for managing California Highway Patrol (CHP) crash report requests. This skill contains all critical knowledge needed to build the system correctly.

---

## 1. What is InstaTCR?

InstaTCR is a web application that helps personal injury law firms request, track, and obtain CHP crash reports. It serves as the bridge between law firms and the CHP system, automating the tedious process of logging into CHP portals, searching for reports, and downloading documents.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), Tailwind CSS
- Database: Convex (real-time, TypeScript-first)
- Automation: Playwright-based CHP Wrapper (Fly.io)
- Deployment: Vercel (frontend), Convex Cloud (backend/storage)
- Future: VAPI (V3 - AI caller), Open Router (V4 - AI features)

---

## 2. Two User Types & THE CRITICAL RULE

### Law Firms (Attorneys & Paralegals)
**What they do:**
- Submit crash report requests (client name + report number)
- Track request status with friendly messages
- Download completed reports (face page and/or full report)
- View chat-style timeline of progress

**What they experience:**
- Simple, non-technical interface
- Friendly status messages
- No knowledge of automation, robots, or manual processes

### InstaTCR Staff (Internal Team)
**What they do:**
- View all jobs across all law firms
- Enter crash details (Page 1: date, time, NCIC, officer ID)
- Enter verification info (Page 2: name, plate, license, VIN)
- Trigger CHP wrapper automation
- Handle escalations and manual completions
- Upload documents

**What they see:**
- All technical details
- Internal statuses
- Wrapper results and journey logs
- Automation errors

---

## 🚨 THE CRITICAL RULE 🚨

> **Law firms NEVER see technical details about automation, portals, robots, or manual processes.**

They only see friendly, high-level status messages like:
- "We've received your request"
- "We're contacting CHP about your report"
- "Your report is ready to download"

Staff sees everything. Law firms see only simplified, friendly messages.

**This separation is enforced through the status mapping system.**

---

## 3. Complete Status Mapping Table

| Internal Status | Public Status | Badge Color | Staff Description | Law Firm Message |
|-----------------|---------------|-------------|-------------------|------------------|
| `NEW` | `SUBMITTED` | Gray | Job just created | "We've received your request" |
| `NEEDS_CALL` | `IN_PROGRESS` | Blue | Requires phone call to CHP | "We're working on your request" |
| `CALL_IN_PROGRESS` | `CONTACTING_CHP` | Blue (pulse) | Currently calling CHP | "We're contacting CHP about your report" |
| `READY_FOR_AUTOMATION` | `IN_PROGRESS` | Blue | Ready to trigger wrapper | "We're working on your request" |
| `AUTOMATION_RUNNING` | `CONTACTING_CHP` | Blue (animated) | Wrapper executing (8-13 sec) | "We're contacting CHP about your report" |
| `FACE_PAGE_ONLY` | `FACE_PAGE_READY` | Yellow | Face page downloaded, full not ready | "We've received a preliminary copy (face page) from CHP" |
| `WAITING_FOR_FULL_REPORT` | `WAITING_FOR_REPORT` | Yellow | Checking if full available | "We're waiting for the full report from CHP" |
| `COMPLETED_FULL_REPORT` | `REPORT_READY` | Green | Full report downloaded | "Your report is ready to download" |
| `COMPLETED_MANUAL` | `REPORT_READY` | Green | Manually completed | "Your report is ready to download" |
| `NEEDS_MORE_INFO` | `NEEDS_INFO` | Amber | Missing verification (driver name) | "We need a bit more information to continue" |
| `NEEDS_IN_PERSON_PICKUP` | `IN_PROGRESS` | Blue | Requires manual CHP office visit | "We're working on your request" |
| `AUTOMATION_ERROR` | `IN_PROGRESS` | Blue | Wrapper encountered error | "We're working on your request" |
| `CANCELLED` | `CANCELLED` | Red | Request cancelled | "This request has been closed" |

**Badge Color CSS Classes:**
```typescript
const statusColors = {
  green: 'bg-green-100 text-green-800 border-green-300',    // Success
  blue: 'bg-blue-100 text-blue-800 border-blue-300',        // In Progress
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300', // Waiting
  amber: 'bg-amber-100 text-amber-800 border-amber-300',    // Action Needed
  gray: 'bg-gray-100 text-gray-800 border-gray-300',        // Neutral
  red: 'bg-red-100 text-red-800 border-red-300',            // Error/Cancelled
};
```

---

## 4. Version Scope

InstaTCR follows a phased development approach:

### V1: MVP - Frontend First (13 days)
- Complete, polished frontend with mock data
- All 6 screens functional (Landing, Law Dashboard, New Request, Job Detail, Staff Queue, Staff Job Detail)
- Mobile-first responsive design (375px minimum)
- Complete mock data system (15 sample jobs)
- All 8 mobile components
- **NO backend dependencies**
- Mock wrapper execution (8-13 seconds, random results)

### V2: Backend Integration (6 days)
- Convex schema deployed (chpJobs, jobEvents tables)
- Real-time queries replacing mock data
- CHP wrapper on Fly.io integrated
- File upload/download with Convex Storage
- Authentication with role-based access

### V3: VAPI AI Caller (Future)
- AI-powered phone calling to CHP offices
- Obtains crash time and officer ID automatically
- Office hopping logic (try up to 5 offices)
- Call history tracking
- **UI Preparation:** AI Caller button next to "Call CHP" (disabled in V1/V2)

### V4: Open Router API (Future)
- Chat assistance for law firms
- Document parsing (extract driver name from PDFs)
- Natural language job creation
- Smart suggestions

---

## 5. Core Business Logic

### Report Types
1. **Face Page** - Preliminary report with basic info (often available first)
2. **Full Report** - Complete crash report (may take 24-72 hours)

### NCIC Auto-Derivation
- NCIC is **always** the first 4 digits of the report number
- Report format: `9XXX-YYYY-ZZZZZ` (e.g., "9465-2025-02802")
- NCIC from example: `9465`
- The four digits after NCIC are always the crash year (`2025`)

### Name Auto-Split
```typescript
// "Dora Cruz-Arteaga" → { firstName: "Dora", lastName: "Cruz-Arteaga" }
// "Mary Jane Smith" → { firstName: "Mary Jane", lastName: "Smith" }
function splitClientName(fullName: string) {
  const parts = fullName.trim().split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}
```

### CHP Wrapper Prerequisites
**Before wrapper can run:**
1. ✅ Page 1 complete (crashDate, crashTime, ncic, officerId)
2. ✅ At least ONE Page 2 field (firstName, lastName, plate, driverLicense, OR vin)

**If prerequisites not met:**
- Button disabled with tooltip: "Complete Page 1 and add at least one Page 2 field"

### CHP Wrapper Results (4 types)

| Result | Badge | Has Download? | What Happened | Next Steps |
|--------|-------|---------------|---------------|------------|
| **FULL** | 🟢 Green | Yes | Full report available | Download, review, mark complete |
| **FACE_PAGE** | 🟡 Yellow | Yes | Only face page available | Enter guaranteed name, unlock auto-checker |
| **NO_RESULT** | ⚪ Gray | No | No matching crash found | Verify details, contact law firm, retry |
| **ERROR** | 🔴 Red | No | Technical issue | Add more verification fields or retry |

**Wrapper Timing:**
- Normal execution: 8-13 seconds
- Mock distribution: 30% FULL, 40% FACE_PAGE, 15% NO_RESULT, 15% ERROR

---

## 6. Validation Rules

### Report Number
- **Format:** `9XXX-YYYY-ZZZZZ`
- **Regex:** `/^9\d{3}-\d{4}-\d{5}$/`
- **Example:** "9465-2025-02802"
- **Auto-processing:** Derive NCIC (first 4 chars), derive year (chars 5-8)

### Crash Time
- **Format:** HHMM (4 digits, 24-hour)
- **Regex:** `/^\d{4}$/`
- **Valid range:** 0000-2359
- **Examples:** "0930" (9:30 AM), "1430" (2:30 PM), "2200" (10:00 PM)
- **Validation:** Hours 00-23, minutes 00-59

### NCIC
- **Format:** 4 digits starting with "9"
- **Regex:** `/^9\d{3}$/`
- **Example:** "9465"
- **Auto-derived:** From report number (first 4 chars)
- **Editable:** Yes (for corrections)

### Officer ID
- **Format:** 6 digits starting with "0"
- **Regex:** `/^0\d{5}$/`
- **Example:** "012345"

### Crash Date
- **Format:** mm/dd/yyyy
- **Validation:** Must be valid date, cannot be future
- **HTML5 Input:** Returns YYYY-MM-DD (must convert to MM/DD/YYYY for API)

### Page 2 Fields (At least ONE required)
- firstName, lastName, plate, driverLicense, vin
- Only one needs correct information for CHP verification

---

## 7. File Structure Standards

```
src/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── law/
│   │   ├── page.tsx                  # Law firm dashboard
│   │   └── jobs/
│   │       ├── new/page.tsx          # New request form
│   │       └── [jobId]/page.tsx      # Job detail (chat view)
│   ├── staff/
│   │   ├── page.tsx                  # Staff queue
│   │   └── jobs/[jobId]/page.tsx     # Staff job detail
│   └── api/vapi/chp-tool/route.ts    # VAPI webhook (V3)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FloatingActionButton.tsx  # Mobile FAB
│   │   ├── BottomSheet.tsx
│   │   ├── TabBar.tsx
│   │   ├── StatCard.tsx
│   │   └── MobileJobCard.tsx
│   └── layout/
│       ├── MobileNav.tsx
│       └── MobileDrawer.tsx
├── hooks/
│   └── useMediaQuery.ts
└── lib/
    ├── mockData.ts                   # V1 mock data
    ├── statusMapping.ts              # Internal → public mapping
    ├── utils.ts                      # Helper functions
    ├── types.ts                      # TypeScript interfaces
    └── chpOffices.ts                 # V3 office list
```

---

## 8. Development Rules

### Mobile-First Philosophy
1. **Start with mobile styles** (< 768px), then add desktop overrides
2. **Minimum width:** 375px (iPhone SE)
3. **Touch targets:** ≥ 44x44px (WCAG 2.1 AAA)
4. **Input font-size:** 16px on mobile (prevents iOS zoom)

### Breakpoints
```typescript
// Main breakpoint: 768px (mobile → desktop)
className="md:hidden"              // Hide on desktop
className="hidden md:block"        // Show on desktop
className="grid-cols-1 md:grid-cols-2"  // Responsive grid
```

| Name | Width | Tailwind | Use Case |
|------|-------|----------|----------|
| Mobile | < 640px | Default | Single column |
| Tablet | 640-767px | `sm:` | 2 columns |
| Desktop | 768-1023px | `md:` | Split views, tables |
| Large | 1024-1279px | `lg:` | 3 column grids |
| XL | ≥ 1280px | `xl:` | Max-width containers |

### Component Sizing
```css
/* Mobile buttons */
height: 48px;
font-size: 16px;

/* Desktop buttons */
height: 40px;
font-size: 14px;

/* Mobile inputs (16px prevents zoom!) */
height: 48px;
font-size: 16px;

/* Desktop inputs */
height: 40px;
font-size: 14px;
```

### Avoid Over-Engineering
- Only make changes directly requested or clearly necessary
- Don't add features, refactor, or "improvements" beyond scope
- Don't add comments, docstrings, or type annotations to unchanged code
- Don't add error handling for scenarios that can't happen
- Three similar lines > premature abstraction
- If unused, delete completely (no `_vars`, re-exports, `// removed` comments)

### Staff Job Detail Layout Pattern

**Mobile (< 768px):** Two tabs using TabBar
- Tab 1: "Law Firm View" (what law firm sees)
- Tab 2: "Staff Controls" (7 control cards)

**Desktop (≥ 768px):** Split view (two columns)
- Left column: Law Firm View
- Right column: Staff Controls (7 cards)

```tsx
// Mobile: TabBar
<div className="md:hidden">
  <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
  {activeTab === 'lawFirm' && <LawFirmView />}
  {activeTab === 'staff' && <StaffControls />}
</div>

// Desktop: Split view
<div className="hidden md:grid md:grid-cols-2 md:gap-6">
  <LawFirmView />
  <StaffControls />
</div>
```

### Staff Controls (7 Cards)
1. **Page 1 Data** - Call CHP button (updates status to CALL_IN_PROGRESS), AI Caller placeholder (V3), form fields
2. **Page 2 Verification** - Name auto-populated, at least 1 field required
3. **CHP Wrapper** - Prerequisites check, Run button, result display, journey log
4. **Wrapper History** - All previous runs with timestamps and results
5. **Auto-Checker** - Unlocked when has face page + driver name
6. **Escalation** - Escalate to manual pickup
7. **Manual Completion** - Upload face page or full report

---

## 9. Key UI Patterns

### FloatingActionButton (FAB)
- Mobile only (`md:hidden`)
- Bottom-right corner (20px from edges)
- Size: 56x56px
- Used for "New Request" on law firm dashboard

### StatusBadge Component
```tsx
<StatusBadge
  status={job.internalStatus}  // Staff view
  type="internal"
/>

<StatusBadge
  status={getPublicStatus(job.internalStatus)}  // Law firm view
  type="public"
/>
```

### Journey Log (Technical Details)
- Collapsible by default
- Warning: "⚠️ Journey logs contain technical information for developers and AI assistants only. Do not show to law firm users."
- Monospace font
- Step-by-step automation log
- Only visible to staff

---

## 10. Data Model Quick Reference

### Job Record (chpJobs table)
```typescript
interface Job {
  _id: string;

  // Law firm info
  lawFirmId: string;
  lawFirmName: string;
  caseReference?: string;

  // Client info
  clientName: string;
  clientType?: 'driver' | 'passenger';
  additionalPartyInfo?: string;
  reportNumber: string;

  // Page 1 data (crash details)
  crashDate?: string;           // "mm/dd/yyyy"
  crashTime?: string;           // "HHMM"
  ncic?: string;                // 4 digits, auto-derived
  officerId?: string;           // 6 digits, starts with "0"

  // Page 2 data (verification)
  firstName?: string;           // Auto-split from clientName
  lastName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;

  // Status
  internalStatus: InternalStatus;

  // Files
  facePageToken?: string;       // Convex storage ID
  fullReportToken?: string;
  guaranteedName?: string;      // From manually uploaded face page

  // Wrapper history
  wrapperRuns?: WrapperRun[];
  lastWrapperRun?: number;
  lastWrapperResult?: WrapperResultType;

  // VAPI (V3 schema - implementation later)
  officeAttemptIndex?: number;
  officeAttempts?: OfficeAttempt[];

  // Timestamps
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}
```

### Event Record (jobEvents table)
```typescript
interface JobEvent {
  _id: string;
  jobId: string;
  eventType: string;           // 'job_created', 'status_change', etc.
  message: string;
  isUserFacing: boolean;       // true = visible to law firm
  userId?: string;
  timestamp: number;
  metadata?: any;
}
```

---

## 11. Essential Helper Functions

```typescript
// Convert internal status to public status
export function getPublicStatus(internalStatus: InternalStatus): PublicStatus {
  const mapping = {
    'NEW': 'SUBMITTED',
    'NEEDS_CALL': 'IN_PROGRESS',
    'CALL_IN_PROGRESS': 'CONTACTING_CHP',
    'READY_FOR_AUTOMATION': 'IN_PROGRESS',
    'AUTOMATION_RUNNING': 'CONTACTING_CHP',
    'FACE_PAGE_ONLY': 'FACE_PAGE_READY',
    'WAITING_FOR_FULL_REPORT': 'WAITING_FOR_REPORT',
    'COMPLETED_FULL_REPORT': 'REPORT_READY',
    'COMPLETED_MANUAL': 'REPORT_READY',
    'NEEDS_MORE_INFO': 'NEEDS_INFO',
    'NEEDS_IN_PERSON_PICKUP': 'IN_PROGRESS',
    'AUTOMATION_ERROR': 'IN_PROGRESS',
    'CANCELLED': 'CANCELLED',
  };
  return mapping[internalStatus] || 'IN_PROGRESS';
}

// Derive NCIC from report number
export function deriveNcic(reportNumber: string): string {
  return reportNumber.substring(0, 4); // First 4 chars
}

// Split client name
export function splitClientName(fullName: string) {
  const parts = fullName.trim().split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

// Convert date for API
export function convertDateForApi(htmlDate: string): string {
  // HTML5: "YYYY-MM-DD" → API: "MM/DD/YYYY"
  const [year, month, day] = htmlDate.split('-');
  return `${month}/${day}/${year}`;
}

// Relative time
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(timestamp).toLocaleDateString();
}
```

---

## 12. Mock Data (V1)

Create realistic mock data with:
- 15 sample jobs covering all statuses
- Multiple law firms
- Wrapper history for some jobs
- User-facing and internal events

**Mock Wrapper Execution:**
```typescript
async function mockWrapperExecution(): Promise<WrapperResult> {
  // Simulate 8-13 seconds
  const duration = 8000 + Math.random() * 5000;
  await sleep(duration);

  // 30% FULL, 40% FACE_PAGE, 15% NO_RESULT, 15% ERROR
  const rand = Math.random();
  if (rand < 0.30) return { resultType: 'FULL', ... };
  if (rand < 0.70) return { resultType: 'FACE_PAGE', ... };
  if (rand < 0.85) return { resultType: 'NO_RESULT', ... };
  return { resultType: 'ERROR', ... };
}
```

---

## 13. Quick PRD Section Reference

When you need detailed information, refer to these PRD sections:

- **Section 1:** Executive Summary
- **Section 3:** Complete User Flows (6 scenarios)
- **Section 4:** Status System Architecture
- **Section 6:** Law Firm Screens (4 screens)
- **Section 7:** Staff Screens (Queue + Job Detail)
- **Section 8-11:** CHP Wrapper Deep Dive
- **Section 12-13:** UI Components & Helpers
- **Section 14-15:** Implementation Strategy (V1/V2)
- **Section 16-17:** VAPI AI Caller (V3)
- **Section 20:** Validation Rules
- **Section 21:** Responsive Design Guidelines
- **Section 24:** Quick Reference (file structure, imports)

---

## 14. Common Patterns & Best Practices

### Page 1 "Call CHP" Button Behavior
When clicked:
1. Update job status to `CALL_IN_PROGRESS`
2. Law firm sees: `CONTACTING_CHP` (via status mapping)
3. Staff continues filling out crash time and officer ID
4. No actual phone integration in V1/V2 (just status update)

### Auto-Checker Logic
**Unlocked when:**
- ✅ Has face page document (facePageToken exists)
- ✅ Has driver name (guaranteedName OR firstName+lastName)

**Button enabled:** Only when unlocked

**On click:**
- Run wrapper again to check if full report now available
- Can be run multiple times
- Can be run even after full report obtained (for re-downloading)

### Wrapper Prerequisites Check
```typescript
function canRunWrapper(job: Job): { ready: boolean; missing: string[] } {
  const missing = [];

  // Page 1: ALL required
  if (!job.crashDate) missing.push("Crash Date");
  if (!job.crashTime) missing.push("Crash Time");
  if (!job.ncic) missing.push("NCIC");
  if (!job.officerId) missing.push("Officer ID");

  // Page 2: At least ONE required
  const hasPage2 = job.firstName || job.lastName || job.plate ||
                   job.driverLicense || job.vin;
  if (!hasPage2) missing.push("At least one Page 2 field");

  return { ready: missing.length === 0, missing };
}
```

---

## 15. VAPI AI Caller (V3 Preparation)

### UI Now (V1/V2)
- Show AI Caller button next to "Call CHP" in Card 1: Page 1 Data
- **State:** Disabled with tooltip "Coming in V3"
- Reserve space in UI layout

### Future Behavior (V3)
- Button initiates VAPI call to CHP office
- Shows progress: "Calling Los Angeles CHP... Attempt 1 of 5"
- On success: Auto-fills crash time and officer ID
- On failure: Tries next office (office hopping, up to 5 attempts)
- Call history tracked in job record

### Outcome Types
**Retryable (try next office):**
- OFFICE_CLOSED_OR_VOICEMAIL
- CALL_DROPPED_OR_TOO_NOISY
- TRANSFERRED_LOOP_OR_TIMEOUT

**Non-retryable (stop):**
- SUCCESS (done!)
- REPORT_NOT_FOUND (doesn't exist)
- NO_INFORMATION_GIVEN (dispatcher refused)

---

## 16. Remember These Rules

1. ✅ **Law firms NEVER see internal statuses or technical details**
2. ✅ **NCIC is ALWAYS first 4 digits of report number**
3. ✅ **Mobile-first design, 375px minimum, 44px touch targets**
4. ✅ **Input font-size 16px on mobile (prevents iOS zoom)**
5. ✅ **CHP wrapper takes 8-13 seconds to run**
6. ✅ **Page 1 must be complete + at least ONE Page 2 field before wrapper runs**
7. ✅ **V1 = frontend + mock data (NO backend)**
8. ✅ **V2 = Convex backend + real CHP wrapper**
9. ✅ **V3 = VAPI AI caller (prepare UI in V1/V2)**
10. ✅ **Avoid over-engineering - only build what's requested**

---

## 17. When In Doubt

- Check the full PRD at `INSTATCR-MASTER-PRD.md` (4800+ lines)
- Use status mapping table to convert internal → public
- Verify validation rules before implementing forms
- Test on mobile first (375px), then desktop
- Remember: Law firms see simple/friendly, staff sees everything

---

**This skill ensures you build InstaTCR correctly, following all business rules and maintaining the critical separation between law firm and staff experiences.**
