---
title: "Part 3: Complete Screen Specifications"
version: "2.5"
last_updated: "2025-12-15"
audience: "Product Managers, Designers, Developers"
---

# Part 3: Complete Screen Specifications

## Table of Contents

1. [Law Firm Screens](#law-firm-screens)
   - [Screen 1: Landing Page](#screen-1-landing-page)
   - [Screen 2: Law Firm Dashboard](#screen-2-law-firm-dashboard)
   - [Screen 3: New Request Form](#screen-3-new-request-form)
   - [Screen 4: Job Detail / Chat View](#screen-4-job-detail--chat-view)
   - [Screen 7: Fast Form (V2.5.0+)](#screen-7-fast-form-v250)
2. [Staff Screens](#staff-screens)
   - [Screen 5: Staff Job Queue](#screen-5-staff-job-queue)
   - [Screen 6: Staff Job Detail](#screen-6-staff-job-detail)
   - [Staff Controls: 7 Management Cards](#staff-controls-7-management-cards)

---

## Law Firm Screens

### Screen 1: Landing Page (`/`)

**File:** `src/app/page.tsx`

**Purpose:** Entry point of the application with role selection.

#### Content

- App title "InstaTCR" at the top
- Subtitle or tagline (optional)
- Two large buttons:
  - "Law Firm Dashboard" → links to `/law`
  - "Staff Dashboard" → links to `/staff`

#### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│             ┌─────────────┐             │
│             │             │             │
│             │  InstaTCR   │             │
│             │             │             │
│             └─────────────┘             │
│                                         │
│     ┌───────────────────────────┐       │
│     │    Law Firm Dashboard     │       │
│     └───────────────────────────┘       │
│                                         │
│     ┌───────────────────────────┐       │
│     │    Staff Dashboard        │       │
│     └───────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (< 768px) | Full screen height, buttons full width, centered |
| Desktop (≥ 768px) | Same layout, buttons fixed width (300px), centered |

#### Visual Design

- Atmospheric gradient background (animated orbs or subtle patterns)
- Frosted glass card effect (backdrop-blur)
- Buttons: 64px height, gradient backgrounds
- Hover: Scale 1.02
- Active: Scale 0.98
- Page load animation: Scale-in with fade

---

### Screen 2: Law Firm Dashboard (`/law`)

**File:** `src/app/law/page.tsx`

**Purpose:** Shows list of all crash report requests for the law firm.

#### Data Source

```typescript
// V1: Mock data
import { mockJobs } from '@/lib/mockData';
const jobs = mockJobs.filter(job => job.lawFirmId === currentLawFirmId);

// V2: Convex query
const jobs = useQuery(api.chpJobs.getJobsByLawFirm, { lawFirmId });
```

#### Content

**Header:**
- Page title: "My Requests"
- Desktop: "New Request" button (top right) → routes to `/law/jobs/new-fast` **(V2.5.0+: Primary entry point)**
- Desktop: "Create Fatal Request" button (secondary) → routes to `/law/jobs/new-fatal` **(V2.5.0+)**
- Mobile: FloatingActionButton (bottom right) → routes to `/law/jobs/new-fast` **(V2.5.0+)**

**Job Grid:**
Each card shows:
- Client name (primary text)
- Report number (secondary text)
- Public status badge (use `getPublicStatus()`)
- Created date (relative time: "3 hours ago")

#### Layout

```
Desktop (≥ 768px):
┌─────────────────────────────────────────────────────────┐
│  My Requests                        [+ New Request]    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Dora Cruz   │ │ John Smith  │ │ Maria Lopez │        │
│ │ 9465-2025.. │ │ 9220-2024.. │ │ 9315-2025.. │        │
│ │ [SUBMITTED] │ │ [READY]     │ │ [CONTACTING]│        │
│ │ 2 hours ago │ │ Yesterday   │ │ Just now    │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ ...         │ │ ...         │ │ ...         │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘

Mobile (< 768px):
┌─────────────────────────┐
│  My Requests            │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Dora Cruz-Arteaga   │ │
│ │ 9465-2025-02802     │ │
│ │ [SUBMITTED]         │ │
│ │ 2 hours ago         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ John Smith          │ │
│ │ 9220-2024-12345     │ │
│ │ [REPORT_READY]      │ │
│ │ Yesterday           │ │
│ └─────────────────────┘ │
│           ...           │
│                    [+]  │ ← FAB
└─────────────────────────┘
```

#### Responsive Behavior

| Breakpoint | Grid Columns | New Request Button |
|------------|--------------|-------------------|
| Mobile (< 640px) | 1 column | FAB (bottom-right) |
| Tablet (640-1023px) | 2 columns | FAB or header button |
| Desktop (≥ 1024px) | 3 columns | Header button |

#### Card Design

- Status-based left border color:
  - Green: `REPORT_READY`
  - Blue: `CONTACTING_CHP`, `IN_PROGRESS`
  - Yellow: `FACE_PAGE_READY`
  - Amber: `NEEDS_INFO`
  - Red: `CANCELLED`
  - Gray: `SUBMITTED` (default)
- Tappable with scale feedback (0.98 on press)
- Staggered fade-in animation (50ms delays)
- Click → Navigate to `/law/jobs/{jobId}`

#### Sorting

Jobs sorted by `createdAt`, newest first.

---

### Screen 3: New Request Form (`/law/jobs/new`)

**File:** `src/app/law/jobs/new/page.tsx`

**Purpose:** Form for law firms to create a new crash report request.

#### Form Fields (V1 MVP)

Law firms submit only 2 fields on the new request form. Client type and additional party information are collected later via the chat interface or by staff during Page 2 data entry.

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| Client Name | text | Yes | Min 2 chars | "Dora Cruz-Arteaga" |
| Report Number | text | Yes | Format: 9XXX-YYYY-ZZZZZ | "9465-2025-02802" |

**Note:** Client Type and Additional Party Info are collected later in the job workflow:
- **Client Type:** Collected via chat interface once job is created
- **Additional Party Info:** Entered by staff on Page 2 during verification setup
- This minimalist design reduces law firm friction during initial submission

#### Layout - Mobile (< 768px)

Full-screen form with sticky header and footer:

```
┌─────────────────────────┐
│ ← Back   New Request    │ ← Sticky header
├─────────────────────────┤
│                         │
│ Client Name *           │
│ [____________________]  │
│                         │
│ Report Number *         │
│ [____________________]  │
│ Format: 9XXX-YYYY-ZZZZZ │
│                         │
├─────────────────────────┤
│ [   Submit Request    ] │ ← Sticky footer
└─────────────────────────┘
```

> **Note:** Only 2 fields are collected on this form. Client Type is collected later via the Flow Wizard (see V1.1.0).

**Visual Design Implementation Note:**

The actual V1 implementation uses a distinctive dark mode aesthetic that deviates from the simple wireframe above:

- **Dark Mode:** Deep slate background (`bg-slate-950`) with glass-morphism form card
- **Glass-Morphism:** Form container uses `bg-slate-800/50 backdrop-blur-xl border border-slate-700/50`
- **Animated Background:** Floating gradient orbs (teal, cyan, slate) create visual interest
- **Focus Glow:** Input focus state shows teal ring (`ring-teal-500 ring-offset-slate-900`)
- **Validation Feedback:** Green emerald glow for valid fields, red for errors
- **Premium Aesthetic:** Creates modern, professional look that differentiates InstaTCR from generic CRM tools while maintaining WCAG accessibility and touch-target compliance

#### Layout - Desktop (≥ 768px)

Centered card with traditional form layout:

```
┌─────────────────────────────────────────────────────────┐
│           ┌───────────────────────────────┐             │
│           │        New Request            │             │
│           ├───────────────────────────────┤             │
│           │ Client Name *                 │             │
│           │ [________________________]    │             │
│           │                               │             │
│           │ Report Number *               │             │
│           │ [________________________]    │             │
│           │ Format: 9XXX-YYYY-ZZZZZ       │             │
│           │                               │             │
│           │ [     Submit Request      ]   │             │
│           └───────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

#### Behavior

1. **Validation:** On submit, validate required fields
2. **Error Display:** Show inline errors below invalid fields
3. **Success:**
   - V1 (Mock): Navigate to `/law/jobs/job_001`
   - V2 (Real): Create job, navigate to `/law/jobs/{newJobId}`
4. **Mobile Keyboard:** Use `inputMode="numeric"` for report number

---

### Screen 4: Job Detail / Chat View (`/law/jobs/[jobId]`)

**File:** `src/app/law/jobs/[jobId]/page.tsx`

**Purpose:** Shows details of a specific crash report request to the law firm.

#### Data Source

```typescript
// Get job and user-facing events
const job = getJobById(jobId);
const events = getUserFacingEvents(jobId);
const publicStatus = getPublicStatus(job.internalStatus);
```

#### Content

**Header Section:**
- Client name (large text, h1)
- Report number (smaller text)
- Public status badge
- Case reference (if available)

**Chat Timeline Section:**
- List of user-facing events only (`isUserFacing: true`)
- Each event shows:
  - Message text
  - Relative timestamp ("2 hours ago")
  - Icon based on event type
- Sorted chronologically (oldest first, newest at bottom)
- Auto-scroll to latest message

**Download Section (conditional):**
- "Download Face Page" button (if `facePageToken` exists)
- "Download Full Report" button (if `fullReportToken` exists)
- File type and size indicators

#### Layout

```
┌─────────────────────────┐
│ ← Back                  │
├─────────────────────────┤
│ Dora Cruz-Arteaga       │
│ 9465-2025-02802         │
│ [CONTACTING_CHP]        │
│ Case: PI-2025-0123      │
├─────────────────────────┤
│ ○ Request submitted     │
│   2 hours ago           │
│                         │
│ ○ We're contacting CHP  │
│   about your report     │
│   1 hour ago            │
│                         │
│ ○ We've received a      │
│   preliminary copy...   │
│   30 minutes ago        │
│                         │
├─────────────────────────┤
│ [📄 Download Face Page] │
│ [📄 Download Full...]   │ ← Only if available
└─────────────────────────┘
```

#### Status-Specific Messages

| Public Status | Message Displayed |
|---------------|-------------------|
| `SUBMITTED` | "We've received your request and will begin processing shortly." |
| `IN_PROGRESS` | "We're working on your request." |
| `CONTACTING_CHP` | "We're contacting CHP about your report." |
| `FACE_PAGE_READY` | "We've received a preliminary copy (face page) from CHP. The full report isn't ready yet." |
| `WAITING_FOR_REPORT` | "We're still waiting on the full report from CHP." |
| `REPORT_READY` | "Your report is ready to download." |
| `NEEDS_INFO` | "We need a bit more information to continue. Our team will reach out if we need anything from you." |
| `CANCELLED` | "This request has been closed." |

#### Download Behavior

- V1 (Mock): Show alert "Download would happen here"
- V2 (Real): Fetch from Convex Storage, trigger browser download

---

### Screen 7: Fast Form (V2.5.0+) (`/law/jobs/new-fast`)

**File:** `src/app/law/jobs/new-fast/page.tsx`

**Purpose:** Primary entry point for law firms to submit crash report requests with immediate CHP wrapper execution. Designed for 72-hour window use case where speed is critical.

#### Design Philosophy

Fast Form is optimized for the most common workflow:
- **Primary Use Case:** Law firm receives a client immediately after a crash (within 72 hours)
- **Key Value:** Instant verification of report availability via real-time CHP portal check
- **Success Rate:** ~99% of submissions successfully run wrapper (Page 1 + at least one Page 2 field)
- **Device Context:** Optimized for desktop (law firm primary workflow)

#### Form Sections

**Section 1: Page 1 Portal Information (5 required fields)**

All fields required for CHP portal Page 1 submission:

| Field | Type | Required | Validation | Placeholder | Notes |
|-------|------|----------|------------|-------------|-------|
| Report Number | text | Yes | `9XXX-YYYY-ZZZZZ` | "9465-2025-02802" | CHP report format |
| Crash Date | date | Yes | MM/DD/YYYY, not future | "12/15/2025" | HTML date input |
| Crash Time | text | Yes | HHMM (00:00-23:59) | "1430" | 24-hour format |
| Officer ID | text | Yes | 5 digits, left-padded | "01234" | CHP officer badge |
| NCIC | text | No (auto) | 4 digits, starts with 9 | "9465" | Auto-derived from report # (read-only) |

**Section 2: Page 2 Verification Information (at least 1 required)**

CHP portal requires at least one matching identifier for report verification:

| Field | Type | Required | Validation | Placeholder | Notes |
|-------|------|----------|------------|-------------|-------|
| Client Full Name | text | Yes | Min 2 chars | "Dora Cruz-Arteaga" | Always required, auto-splits for wrapper |
| License Plate | text | Optional | 2-8 alphanumeric | "8ABC123" | CA format preferred |
| Driver License # | text | Optional | Alphanumeric | "D1234567" | Any state |
| VIN | text | Optional | 17 alphanumeric | "1HGBH41JXMN109186" | Full 17-digit VIN |

**Validation Rule:** Client name is always provided, ensuring Page 2 has at least one field.

**Section 3: Legal & Collaboration**

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| Perjury Checkbox | checkbox | Yes | Unchecked | See text below |
| Collaborators | multi-select | No | Empty | Select from org members or invite via email |

**Perjury Checkbox Text:**
```
☐ I declare under penalty of perjury that I am a person having proper
  interest or an authorized representative therein as outlined above
  and as required by California law.
```

**Collaborators Field:**
- Multi-select dropdown showing organization members (via Clerk)
- Option to invite external collaborators via email
- Displays selected users as chips
- Collaborators receive notifications on status changes

#### Layout

**Desktop (≥ 1024px):**

```
┌───────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard    Fast Form                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌────────────────────────┐  ┌────────────────────────┐       │
│ │ Section 1: Page 1 Info │  │ Section 2: Verification│       │
│ ├────────────────────────┤  ├────────────────────────┤       │
│ │ Report Number *        │  │ Client Full Name *     │       │
│ │ [__________________]   │  │ [__________________]   │       │
│ │                        │  │                        │       │
│ │ Crash Date *           │  │ License Plate          │       │
│ │ [__________________]   │  │ [__________________]   │       │
│ │                        │  │                        │       │
│ │ Crash Time *           │  │ Driver License #       │       │
│ │ [__________________]   │  │ [__________________]   │       │
│ │                        │  │                        │       │
│ │ Officer ID *           │  │ VIN                    │       │
│ │ [__________________]   │  │ [__________________]   │       │
│ │                        │  │                        │       │
│ │ NCIC (auto)            │  │                        │       │
│ │ [9465] (read-only)     │  │                        │       │
│ └────────────────────────┘  └────────────────────────┘       │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Section 3: Legal & Collaboration                       │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ ☐ I declare under penalty of perjury that I am a      │   │
│ │   person having proper interest or an authorized       │   │
│ │   representative... (required)                         │   │
│ │                                                        │   │
│ │ Collaborators (optional)                               │   │
│ │ [Select team members...              ▼]               │   │
│ │ 🏷️ john@lawfirm.com  🏷️ sarah@lawfirm.com            │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │         [      Submit Fast Form       ]                │   │
│ │                                                        │   │
│ │         Use Standard Flow instead                      │   │
│ └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (< 768px):**

```
┌─────────────────────────┐
│ ← Back   Fast Form      │
├─────────────────────────┤
│ Page 1 Portal Info      │
│                         │
│ Report Number *         │
│ [___________________]   │
│                         │
│ Crash Date *            │
│ [___________________]   │
│                         │
│ Crash Time *            │
│ [___________________]   │
│                         │
│ Officer ID *            │
│ [___________________]   │
│                         │
│ NCIC (auto)             │
│ [9465] (read-only)      │
│                         │
├─────────────────────────┤
│ Page 2 Verification     │
│                         │
│ Client Full Name *      │
│ [___________________]   │
│                         │
│ License Plate           │
│ [___________________]   │
│                         │
│ Driver License #        │
│ [___________________]   │
│                         │
│ VIN                     │
│ [___________________]   │
│                         │
├─────────────────────────┤
│ Legal & Collaboration   │
│                         │
│ ☐ I declare under       │
│   penalty of perjury... │
│   (required)            │
│                         │
│ Collaborators           │
│ [Select...         ▼]   │
│                         │
├─────────────────────────┤
│ [  Submit Fast Form  ]  │
│                         │
│ Use Standard Flow       │
└─────────────────────────┘
```

#### Responsive Behavior

| Breakpoint | Layout | Input Height | Font Size | Grid |
|------------|--------|--------------|-----------|------|
| Mobile (< 768px) | Stacked sections | 48px | 16px | 1 column |
| Desktop (≥ 1024px) | 2-column for Sections 1+2 | 40px | 14px | 2 columns |

#### Validation

**Real-time Validation (on blur):**
- Report Number format check
- Crash Date not in future
- Crash Time valid range (0000-2359)
- Officer ID 5 digits, left-padded with zeros
- NCIC auto-derived and displayed

**Submit Validation:**
- All Page 1 fields required
- Client Full Name required (ensures ≥1 Page 2 field)
- Perjury checkbox must be checked
- Collaborators optional

**Error Display:**
- Inline errors below each field
- Red border on invalid inputs
- Scroll to first error on submit

#### Submission Flow

**Step 1: Form Submit**
- Validate all fields
- Check perjury checkbox
- Disable submit button
- Show loading state

**Step 2: Wrapper Execution**
```
┌─────────────────────────────────────────┐
│  Running CHP automation...              │
│  ████████████░░░░░░░░░░░░░░░░░ 60%      │
│  Checking report availability...        │
└─────────────────────────────────────────┘
```

**Step 3a: Success (95% of cases)**
- Wrapper returns FULL_REPORT or FACE_PAGE
- Redirect to `/law/jobs/{newJobId}`
- Show success toast: "Report request submitted! Checking CHP portal..."
- Job status: `AUTOMATION_RUNNING` → result status

**Step 3b: Failure (5% of cases)**
- Wrapper returns PAGE2_BLOCKED (verification failed)
- Show modal immediately:

```
┌─────────────────────────────────────────────────────────┐
│  We Need Your Help                                      │
├─────────────────────────────────────────────────────────┤
│  The CHP portal couldn't verify the report with the     │
│  information provided. We'll need your help to obtain   │
│  this report manually.                                  │
│                                                         │
│  Please upload your signed "Authorization to Obtain     │
│  Governmental Agency Records" form.                     │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │  [📄 Upload Authorization Document]            │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  [ Skip for Now ]           [ Upload & Continue ]      │
└─────────────────────────────────────────────────────────┘
```

**Step 3b Continued: After Upload**
- Job created with `escalationData.authorizationToken`
- Job status: `NEEDS_IN_PERSON_PICKUP`
- Staff can download authorization packet (auth PDF + auto-generated cover letter)
- Redirect to `/law/jobs/{newJobId}`

#### Actions

**Primary Action:** "Submit Fast Form"
- Full-width button
- Desktop: Height 40px, gradient background
- Mobile: Height 48px (touch target)
- Disabled until perjury checkbox checked

**Secondary Action:** "Use Standard Flow" (text link)
- Routes to `/law/jobs/new` (legacy 2-field form)
- For edge cases where law firm doesn't have all Page 1 data
- Smaller text, underlined link style

#### Visual Design

**Form Container:**
- Glass-morphism card with backdrop blur
- Border: `border-slate-700/50`
- Background: `bg-slate-800/50`
- Padding: 32px desktop, 20px mobile

**Section Dividers:**
- Visual separation between sections
- Desktop: Horizontal divider between Section 3 and actions
- Mobile: Background color alternation for section separation

**Input Fields:**
- Focus state: Teal ring (`ring-teal-500`)
- Valid state: Subtle green glow
- Error state: Red border + error text below
- Auto-filled NCIC: Lighter background to indicate read-only

**Perjury Checkbox:**
- Larger checkbox (20px × 20px)
- Wrapping text (not truncated)
- Error state if unchecked on submit

**Collaborators Field:**
- Dropdown with search
- Selected users shown as chips with remove (×) button
- "Add collaborator" button to invite via email

#### Feature Flags (V2.5.0+)

```typescript
const ENABLE_FAST_FORM = process.env.NEXT_PUBLIC_ENABLE_FAST_FORM === 'true';
const ENABLE_WRAPPER = process.env.NEXT_PUBLIC_ENABLE_WRAPPER === 'true';
```

If `ENABLE_FAST_FORM=false`:
- Route `/law/jobs/new-fast` redirects to `/law/jobs/new`
- "New Request" button on dashboard routes to `/law/jobs/new`

If `ENABLE_WRAPPER=false`:
- Fast Form still collects all fields
- Submit creates job with `submittedVia: 'fast_form'`
- No wrapper execution (staff runs manually)

#### Accessibility

- WCAG AAA touch targets (48px mobile)
- Form labels with `for` attribute
- ARIA labels on all inputs
- Error announcements via `aria-live`
- Keyboard navigation: Tab through all fields
- Perjury checkbox reachable via keyboard (Space to toggle)
- High contrast mode support
- Focus visible indicators

---

## Staff Screens

### Screen 5: Staff Job Queue (`/staff`)

**File:** `src/app/staff/page.tsx`

**Purpose:** Dashboard showing all jobs across all law firms for staff to manage.

#### Data Source

```typescript
// Staff sees ALL jobs
// V1: const jobs = mockJobs;
// V2: const jobs = useQuery(api.chpJobs.getAllJobsForStaff);
```

#### Content

**Firm Filter Dropdown (V2.5.0+):**
- Dropdown at top of page: "All Firms" / "Law Brothers" / "Johnson Law" / etc.
- Shows organization names from Clerk
- Updates all stats cards and job list based on selection
- Default: "All Firms" (no filter)

**Stats Cards Section (4 metrics):**

| Card | Count | Color | Filter |
|------|-------|-------|--------|
| Total Jobs | All jobs (filtered by firm if selected) | Default | All |
| Needs Action | Jobs requiring staff action | Amber | NEEDS_MORE_INFO, NEEDS_CALL, READY_FOR_AUTOMATION |
| In Progress | Jobs being processed | Blue | CALL_IN_PROGRESS, AUTOMATION_RUNNING, WAITING_FOR_FULL_REPORT |
| Completed | Finished jobs | Green | COMPLETED_FULL_REPORT, COMPLETED_MANUAL |

**Escalated Requests by Firm Card (V2.5.2+):**
- Shows breakdown of escalated requests per firm
- Format: "Law Brothers: 5 escalated", "Johnson Law: 2 escalated"
- Only shows firms with active escalations
- Click firm name → filters queue to that firm

**Filter Tabs:**
- All
- Needs Action
- In Progress
- Completed
- Cancelled

**Job List:**
- Mobile: MobileJobCard components (stacked) **(V2.5.0+: Show firm name badge below job ID)**
- Desktop: Full table with columns **(V2.5.0+: Add "Organization" column)**

#### Layout - Mobile

```
┌─────────────────────────┐
│ Job Queue               │
├─────────────────────────┤
│ ┌─────────┐ ┌─────────┐ │
│ │ Total   │ │ Needs   │ │
│ │   15    │ │ Action  │ │
│ │         │ │    4    │ │
│ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ │
│ │ In Prog │ │Complete │ │
│ │    6    │ │    5    │ │
│ └─────────┘ └─────────┘ │
├─────────────────────────┤
│ All│Action│Prog│Done│X │ ← Horizontal scroll tabs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Dora Cruz-Arteaga   │ │
│ │ 9465-2025-02802     │ │
│ │ Smith & Associates  │ │
│ │ [NEW] → [SUBMITTED] │ │
│ │ 2 hours ago         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ John Smith          │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Layout - Desktop

```
┌───────────────────────────────────────────────────────────────────────┐
│ Job Queue                                                             │
├───────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│ │ Total   │ │ Needs   │ │ In Prog │ │Complete │                      │
│ │   15    │ │ Action 4│ │    6    │ │    5    │                      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                      │
├───────────────────────────────────────────────────────────────────────┤
│ [All] [Needs Action] [In Progress] [Completed] [Cancelled]           │
├───────────────────────────────────────────────────────────────────────┤
│ Client         │ Report #        │ Law Firm    │ Internal │ Public  │ Created    │ Actions │
│────────────────┼─────────────────┼─────────────┼──────────┼─────────┼────────────┼─────────│
│ Dora Cruz      │ 9465-2025-02802 │ Smith & Co  │ [NEW]    │[SUBMIT] │ 2 hrs ago  │ [View]  │
│ John Smith     │ 9220-2024-12345 │ Jones Law   │ [FACE_P] │[FACE_R] │ Yesterday  │ [View]  │
│ Maria Lopez    │ 9315-2025-00123 │ Smith & Co  │ [COMPL]  │[READY]  │ 3 days ago │ [View]  │
└───────────────────────────────────────────────────────────────────────┘
```

#### Table Columns (Desktop)

| Column | Content |
|--------|---------|
| Client | Client name |
| Report # | Report number |
| Organization | Organization name **(V2.5.0+: from Clerk)** |
| Internal Status | Badge with internal status |
| Public Status | Badge with public status |
| Created | Relative time |
| Actions | "View" link |

#### Behavior

- Click filter tab → Update job list
- Click job card/row → Navigate to `/staff/jobs/{jobId}`
- Refresh button to reload data

---

### Screen 6: Staff Job Detail (`/staff/jobs/[jobId]`)

**File:** `src/app/staff/jobs/[jobId]/page.tsx`

**Purpose:** Complete job management interface for staff.

#### Layout Strategy

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Two tabs: "Law Firm View" and "Staff Controls" |
| Desktop (≥ 768px) | Two-column split view (left: Law Firm View, right: Staff Controls) |

#### Layout - Mobile

```
┌─────────────────────────┐
│ ← Back  Job Detail      │
├─────────────────────────┤
│ [Law Firm View] [Staff] │ ← TabBar (sticky)
├─────────────────────────┤
│                         │
│   (Content for active   │
│    tab displayed here)  │
│                         │
└─────────────────────────┘
```

#### Layout - Desktop

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Back  Job Detail                                                    │
├───────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────────────┐  │
│ │      Law Firm View          │ │        Staff Controls           │  │
│ │                             │ │                                 │  │
│ │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────┐ │  │
│ │ │ Client Info Card        │ │ │ │ Card 1: Page 1 Data         │ │  │
│ │ │ Dora Cruz-Arteaga       │ │ │ │ [Call CHP] [AI Caller] V3   │ │  │
│ │ │ 9465-2025-02802         │ │ │ │ Crash Date: [____]          │ │  │
│ │ │ [CONTACTING_CHP]        │ │ │ │ Crash Time: [____]          │ │  │
│ │ │ Created: 2 hours ago    │ │ │ │ NCIC: [9465]                │ │  │
│ │ └─────────────────────────┘ │ │ │ Officer ID: [____]          │ │  │
│ │                             │ │ │ [Save Page 1]               │ │  │
│ │ ┌─────────────────────────┐ │ │ └─────────────────────────────┘ │  │
│ │ │ Chat Timeline Card      │ │ │                                 │  │
│ │ │ ○ Request submitted     │ │ │ ┌─────────────────────────────┐ │  │
│ │ │   2 hours ago           │ │ │ │ Card 2: Page 2 Verification │ │  │
│ │ │ ○ Contacting CHP...     │ │ │ │ First Name: [Dora]          │ │  │
│ │ │   1 hour ago            │ │ │ │ Last Name: [Cruz-Arteaga]   │ │  │
│ │ └─────────────────────────┘ │ │ │ Plate: [____]               │ │  │
│ │                             │ │ │ License: [____]             │ │  │
│ │ ┌─────────────────────────┐ │ │ │ VIN: [____]                 │ │  │
│ │ │ All Events Card         │ │ │ │ [Save Page 2]               │ │  │
│ │ │ (Internal + User-facing)│ │ │ └─────────────────────────────┘ │  │
│ │ │ ...                     │ │ │                                 │  │
│ │ └─────────────────────────┘ │ │ ┌─────────────────────────────┐ │  │
│ │                             │ │ │ Card 3: CHP Wrapper         │ │  │
│ │                             │ │ │ ...                         │ │  │
│ │                             │ │ └─────────────────────────────┘ │  │
│ │                             │ │ (More cards below)              │  │
│ └─────────────────────────────┘ └─────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

### Tab/Column 1: Law Firm View

Shows exactly what the law firm sees, plus additional context for staff.

#### Card: Client Info

| Field | Value |
|-------|-------|
| Client Name | Heading (h2) |
| Report Number | Subheading |
| Case Reference | If available |
| Public Status | Badge (converted via `getPublicStatus`) |
| Created | Relative time |

#### Card: Chat Timeline

- User-facing events only (`isUserFacing: true`)
- Same format law firm sees
- Chronological order (oldest first)

#### Card: All Events

- Complete event log (user-facing + internal)
- Each event shows:
  - Event type label
  - Message
  - Timestamp
  - User who triggered it (if available)
- Color-coded by event type

---

## Staff Controls: 7 Management Cards

### Card 1: Page 1 Data

**Call Buttons Section:**

```
┌─────────────────────────────────────────────────────────┐
│ Page 1 Data                                             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐               │
│ │  📞 Call CHP    │  │  🤖 AI Caller   │  ← V3 (future)│
│ │  (Manual)       │  │  (Automatic)    │               │
│ └─────────────────┘  └─────────────────┘               │
```

**Call CHP Button Behavior:**
- When clicked: Update job status to `CALL_IN_PROGRESS`
- Shows that staff is actively calling CHP
- In future: Will have hardcoded CHP phone number

**AI Caller Button (V3 - Future):**
- V1: Show as disabled with tooltip "Coming in V3"
- V3: Triggers VAPI AI caller

**Form Fields:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Crash Date | date | - | mm/dd/yyyy, not future |
| Crash Time | text | - | HHMM (0000-2359) |
| NCIC | text | Auto from report # | 4 digits, starts with "9" |
| Officer ID | text | - | 5 digits, left-padded |

**Save Button:** "Save Page 1"

---

### Card 2: Page 2 Verification

**Form Fields:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| First Name | text | Auto-split from clientName | For CHP verification |
| Last Name | text | Auto-split from clientName | For CHP verification |
| License Plate | text | - | Optional |
| Driver License | text | - | Optional |
| VIN | text | - | Optional |

**Note Text:** "Only one of these fields needs correct information for CHP verification. We just need one of these fields filled out with correct information."

**Save Button:** "Save Page 2"

**Name Auto-Split Logic:**
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

---

### Card 3: CHP Wrapper

**Prerequisites Checklist:**

```
Prerequisites:
  ✓ Page 1 complete (crashDate, crashTime, ncic, officerId)
  ✓ Page 2 has at least one verification field

  [Run CHP Wrapper]  ← Enabled when both checked
```

**Button States:**

| State | Appearance | Behavior |
|-------|------------|----------|
| Prerequisites not met | Gray, disabled | Tooltip: "Complete Page 1 and add at least one Page 2 field" |
| Ready | Primary color, enabled | Click to run wrapper |
| Running | Loading spinner | "Running CHP automation... (8-13 sec expected)" |
| Complete | Show result | Display result badge and message |

**Result Display:**

```
Result: [🟢 Full Report Found]
Message: "Full CHP crash report downloaded successfully."
[📄 Download Full Report]
```

**Last Run Info:**
- "Last run: 2 hours ago"
- "Result: FACE_PAGE" (with colored badge)
- Download button if applicable

**Journey Log Panel (Collapsible):**
- Collapsed by default
- Title: "Technical Details (for debugging)" with expand arrow
- Warning: "⚠️ Journey logs contain technical information for developers and AI assistants only. Do not show to law firm users."
- Monospace font for log entries

---

### Card 4: Wrapper History

**Empty State:** "No wrapper runs yet. Results will appear here after running the CHP wrapper."

**With Runs:**

```
┌─────────────────────────────────────────────────────────┐
│ Wrapper History                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dec 10, 2025 at 10:30 AM (2 hours ago)             │ │
│ │ Duration: 12.5 seconds                              │ │
│ │ Result: [🟢 Full Report]                           │ │
│ │                                                     │ │
│ │ "Full CHP crash report downloaded successfully."    │ │
│ │                                                     │ │
│ │ [📄 Download Full Report] [View Journey Log]       │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dec 10, 2025 at 9:15 AM (3 hours ago)              │ │
│ │ Duration: 11.2 seconds                              │ │
│ │ Result: [🟡 Face Page]                             │ │
│ │                                                     │ │
│ │ "CHP report found (Face Page only)..."             │ │
│ │                                                     │ │
│ │ [📄 Download Face Page] [View Journey Log]         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Result Color Coding:**
- FULL → Green left border
- FACE_PAGE → Yellow left border
- NO_RESULT → Gray left border
- ERROR → Red left border

---

### Card 5: Auto-Checker

**Status Indicator:**

| State | Display |
|-------|---------|
| Locked | 🔒 "Locked - Missing requirements" |
| Unlocked | 🔓 "Unlocked - Ready to check" |

**Conditions Display:**
- "Has face page: Yes/No"
- "Has driver name: Yes/No"

**Check Button:**
- "Check if Full Report Ready"
- Only enabled if unlocked
- Loading state for ~2 seconds
- Result: "Still only face page available" or "Full report now available!"

**Note:** "Can be run even if full report already obtained"

---

### Card 6: Escalation

**Escalate Button:** "Escalate to Manual Pickup"

**Behavior:**
1. Click button
2. Show confirmation dialog
3. Enter escalation notes (textarea)
4. Confirm
5. Status → `NEEDS_IN_PERSON_PICKUP`

**Note:** "All staff can see escalated jobs globally (V1: no individual assignment)"

---

### Card 7: Manual Completion

**Authorization Packet Download (V2.5.2+):**

If job has escalation data with authorization uploaded:
```
┌─────────────────────────────────────────────────────────┐
│ Authorization Packet Available                          │
│                                                         │
│ [📄 Download Authorization Packet]                     │
│                                                         │
│ Downloads 2-file bundle:                                │
│ • Authorization PDF (uploaded by law firm)              │
│ • Cover letter (auto-generated with staff name)         │
└─────────────────────────────────────────────────────────┘
```

**Authorization Packet Contents:**
- **File 1:** Original authorization PDF uploaded by law firm
- **File 2:** Auto-generated cover letter with:
  - Header: "Info: InstaTCR on behalf of {law firm name}"
  - Section: "CRASH REPORT REQUEST RECEIVED"
  - Client details: name, report number, crash date
  - Authorization status: "Uploaded"
  - Cover letter body (template)
  - **Authorized person for pickup:** {Staff's real name from Clerk user}

**Behavior:**
- Button enabled only if `job.escalationData.authorizationToken` exists
- On click: Generate cover letter PDF, merge with authorization PDF
- Download single file: `{jobId}_authorization_packet.pdf`
- Staff name auto-filled from Clerk user context (`user.firstName + ' ' + user.lastName`)

---

**File Type Selection:**
- Radio buttons: "Face Page" or "Full Report"

**If Face Page Selected:**
```
┌─────────────────────────────────────────────────────────┐
│ Guaranteed Name *                                       │
│ [____________________________________]                  │
│ Required to unlock auto-checker                         │
└─────────────────────────────────────────────────────────┘
```

**If Full Report Selected:**
```
┌─────────────────────────────────────────────────────────┐
│ Note: Job will auto-complete when uploaded              │
└─────────────────────────────────────────────────────────┘
```

**Upload Button:** "Upload File"
- Click → File picker dialog
- Display selected filename
- Show success message

**Completion Notes:** Textarea for notes

**Complete Button:**
- "Mark as Completed" (only for Full Report)
- Status → `COMPLETED_MANUAL`

---

## Related Documents

- [01-product-foundation.md](./01-product-foundation.md) - Product vision, market analysis, and core requirements
- [02-business-logic.md](./02-business-logic.md) - Status mapping, validation rules, and core workflows
- [04-chp-wrapper.md](./04-chp-wrapper.md) - CHP automation deep dive and wrapper specifications
- [05-component-library.md](./05-component-library.md) - UI components and styling system
- [CHANGELOG.md](../../CHANGELOG.md) - Version history and release notes

---

*Part of the InstaTCR documentation suite. See [INSTATCR-MASTER-PRD.md](../../INSTATCR-MASTER-PRD.md) for navigation.*
