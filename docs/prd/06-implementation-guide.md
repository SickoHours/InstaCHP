---
title: "InstaTCR Implementation Guide"
version: "2.2"
last_updated: "2025-12-13"
audience: "All engineers, QA, DevOps"
document_type: "Technical Reference & Implementation Strategy"
---

# InstaTCR Implementation Guide

## Document Overview

This comprehensive guide consolidates Parts 6-9 of the InstaTCR Master PRD, providing implementation strategy, future integrations, technical reference, and appendices for all team members.

**Document Status:** Complete technical reference for V1-V4+ development
**Last Updated:** December 11, 2025
**Audience:** All engineers, QA, DevOps, and technical stakeholders

---

## Table of Contents

### Part 6: Implementation Strategy
- [14. Frontend-First Development (V1)](#part-6-implementation-strategy)
  - Philosophy
  - Phase 1: Setup & Design System
  - Phase 2: Mock Data System
  - Phase 3: Law Firm Screens
  - Phase 4: Staff Screens
  - Phase 5: Mobile Components
  - Phase 6: Polish & Refinement
- [15. Backend Integration (V2)](#backend-integration-v2)
  - Convex Setup
  - Convex Queries
  - Convex Mutations
  - Convex Actions
  - File Upload/Download Pattern
  - Real-Time Updates

### Part 7: Future Integrations
- [16. VAPI AI Caller - UI Planning (V3)](#vapi-ai-caller---ui-planning-v3)
  - Purpose and Button Placement
  - Button States
  - Call Progress Display
  - Success/Failed Result Display
  - Call History Section
  - V1/V2 Implementation
- [17. VAPI AI Caller - Backend Architecture (V3)](#vapi-ai-caller---backend-architecture-v3)
  - High-Level Flow
  - VAPI Assistant Configuration
  - Tool Schema
  - Webhook Handler
  - Office Hopping Logic
  - CHP Offices Configuration
- [18. Open Router API (V4+)](#open-router-api-v4)
  - Purpose
  - Potential Use Cases
  - Implementation Placeholder
  - V4 Scope
- [19. Future Roadmap Timeline](#future-roadmap-timeline)
  - Visual Roadmap
  - Detailed Timeline
  - Success Criteria per Version

### Part 8: Technical Reference
- [20. Validation Rules](#validation-rules)
  - Client Name
  - Report Number
  - Crash Date
  - Crash Time
  - NCIC
  - Officer ID
  - Page 2 Fields
- [21. Responsive Design Guidelines](#responsive-design-guidelines)
  - Mobile-First Philosophy
  - Breakpoints
  - Touch Target Sizing
  - Input Sizing
  - Grid Layouts
  - Common Patterns
- [22. Accessibility Guidelines (WCAG 2.1)](#accessibility-guidelines-wcag-21-aacaa-compliance)
  - Keyboard Navigation
  - Focus Management
  - Color Contrast
  - Semantic HTML
  - Screen Reader Support
  - Font & Input Sizing
  - Skip Navigation
  - Testing Accessibility
- [23. Testing Checklist](#testing-checklist)
  - General UI Tests
  - CHP Wrapper Tests
  - Mobile Responsiveness Tests
  - VAPI Integration Tests (V3)
- [24. Deployment Architecture](#deployment-architecture)
  - System Overview
  - Service Details
  - Environment Variables
  - Deployment Commands
  - Monitoring

### Part 9: Appendices
- [25. Quick Reference](#quick-reference)
  - File Structure
  - Essential Imports
  - Color Palette
  - Breakpoint Classes
- [26. Mock Data Instructions](#mock-data-instructions)
  - Creating Sample Jobs
  - Mock Wrapper Execution
  - Mock Journey Log Generator
  - Mock Events
- [27. Backend Integration Checklist](#backend-integration-checklist)
  - Convex Queries
  - Convex Mutations
  - Convex Actions
  - HTTP Endpoints
  - Integration Order

---

# Part 6: Implementation Strategy

## 14. Frontend-First Development (V1)

### Philosophy

Build the complete UI with mock data before connecting any backend. This approach:
- Allows rapid iteration on UX without API constraints
- Creates a functional prototype for stakeholder review
- Defines the exact API contracts needed for V2
- Enables parallel backend development

### Phase 1: Setup & Design System (1 day)

**Goal:** Establish foundation for all screens.

**Tasks:**

1. **Create Next.js 15 project**
   ```bash
   npx create-next-app@latest instatcr --typescript --tailwind --app --src-dir
   ```

2. **Install dependencies**
   ```bash
   npm install lucide-react  # Icons
   npm install @fontsource/inter  # Typography (or your chosen font)
   ```

3. **Configure Tailwind theme** (`tailwind.config.ts`)
   ```typescript
   export default {
     theme: {
       extend: {
         colors: {
           primary: {...},
           law: {...},
           staff: {...},
         },
       },
     },
   };
   ```

4. **Create base components**
   - `src/components/ui/Button.tsx`
   - `src/components/ui/Input.tsx`
   - `src/components/ui/Card.tsx`
   - `src/components/ui/Badge.tsx`
   - `src/components/ui/StatusBadge.tsx`
   - `src/components/ui/index.ts` (barrel export)

**Deliverable:** Design system ready, base components working.

---

### Phase 2: Mock Data System (1 day)

**Goal:** Create realistic test data and utility functions.

**Tasks:**

1. **Create TypeScript interfaces** (`src/lib/types.ts`)
   ```typescript
   export interface Job { ... }
   export interface JobEvent { ... }
   export type InternalStatus = ...;
   export type PublicStatus = ...;
   ```

2. **Create sample jobs** (`src/lib/mockData.ts`)
   - 15 sample jobs covering all statuses
   - Multiple law firms
   - Various stages of completion
   - Wrapper run history for some jobs

3. **Create utility functions** (`src/lib/utils.ts`)
   - `getPublicStatus()`
   - `formatRelativeTime()`
   - `splitClientName()`
   - `deriveNcic()`
   - `convertDateForApi()`

4. **Create status mapping** (`src/lib/statusMapping.ts`)

**Sample Jobs Distribution:**

| Status | Count | Notes |
|--------|-------|-------|
| NEW | 1 | Just created |
| CALL_IN_PROGRESS | 1 | Staff on phone |
| AUTOMATION_RUNNING | 2 | Wrapper running |
| FACE_PAGE_ONLY | 2 | Waiting for full report |
| COMPLETED_FULL_REPORT | 3 | Success cases |
| NEEDS_MORE_INFO | 2 | Missing verification |
| NEEDS_IN_PERSON_PICKUP | 1 | Escalated |
| CANCELLED | 1 | Cancelled request |

**Deliverable:** Complete mock data system ready for use.

---

### Phase 3: Law Firm Screens (3 days)

**Goal:** Build all 4 law firm screens.

**Day 1: Landing + Dashboard**
- `src/app/page.tsx` - Landing page
- `src/app/law/page.tsx` - Dashboard
- `src/app/law/layout.tsx` - Law firm layout
- Test responsive behavior

**Day 2: New Request Form**
- `src/app/law/jobs/new/page.tsx`
- Form validation
- Mobile: Sticky header/footer
- Desktop: Centered card
- Form-to-chat transition (optional)

**Day 3: Job Detail / Chat View**
- `src/app/law/jobs/[jobId]/page.tsx`
- Chat timeline component
- Download buttons
- Status-specific messages
- Polish and test

**Deliverable:** Complete law firm flow, fully functional with mock data.

---

### Phase 4: Staff Screens (3 days)

**Goal:** Build staff queue and job detail.

**Day 1: Staff Queue**
- `src/app/staff/page.tsx` - Job queue
- `src/app/staff/layout.tsx` - Staff layout
- Stats cards (4 metrics)
- Filter tabs
- Mobile: Card list
- Desktop: Table view

**Day 2: Staff Job Detail - Law Firm View**
- `src/app/staff/jobs/[jobId]/page.tsx`
- TabBar component (mobile)
- Split view (desktop)
- Client info card
- Chat timeline card
- All events card

**Day 3: Staff Job Detail - Staff Controls**
- Card 1: Page 1 Data (with Call CHP button, AI Caller placeholder)
- Card 2: Page 2 Verification
- Card 3: CHP Wrapper (with prerequisites, mock execution)
- Card 4: Wrapper History
- Card 5: Auto-Checker
- Card 6: Escalation
- Card 7: Manual Completion

**Deliverable:** Complete staff flow, fully functional with mock data.

---

### Phase 5: Mobile Components (2 days)

**Goal:** Build all mobile-specific components.

**Day 1:**
- `MobileDrawer.tsx`
- `MobileNav.tsx`
- `FloatingActionButton.tsx`
- `BottomSheet.tsx`

**Day 2:**
- `TabBar.tsx`
- `StatCard.tsx`
- `MobileJobCard.tsx`
- `useMediaQuery.ts` hook

**Deliverable:** Complete mobile component library.

---

### Phase 6: Polish & Refinement (3 days)

**Goal:** Perfect every detail.

**Day 1: Testing**
- Test on real devices (iPhone, iPad, Android)
- Test all breakpoints (375px, 768px, 1024px, 1920px)
- Verify all touch targets ≥ 44px

**Day 2: Animations**
- Page transitions
- Card animations (staggered fade-in)
- Button feedback (scale)
- Loading states
- Success/error states

**Day 3: Edge Cases**
- Empty states
- Error states
- Very long text handling
- Accessibility audit (keyboard nav, screen reader)

**Deliverable:** Polished, production-ready frontend.

---

## 15. Backend Integration (V2)

### Convex Setup

**Schema Definition** (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chpJobs: defineTable({
    // Basic info
    lawFirmId: v.string(),
    lawFirmName: v.string(),
    clientName: v.string(),
    reportNumber: v.string(),
    caseReference: v.optional(v.string()),
    clientType: v.optional(v.union(v.literal("driver"), v.literal("passenger"))),
    additionalPartyInfo: v.optional(v.string()),

    // Page 1 data
    crashDate: v.optional(v.string()),
    crashTime: v.optional(v.string()),
    ncic: v.optional(v.string()),
    officerId: v.optional(v.string()),

    // Page 2 data
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    plate: v.optional(v.string()),
    driverLicense: v.optional(v.string()),
    vin: v.optional(v.string()),

    // Status
    internalStatus: v.string(),

    // Files
    facePageToken: v.optional(v.id("_storage")),
    fullReportToken: v.optional(v.id("_storage")),
    guaranteedName: v.optional(v.string()),

    // Wrapper history
    wrapperRuns: v.optional(v.array(v.object({
      timestamp: v.number(),
      duration: v.number(),
      resultType: v.string(),
      message: v.string(),
      downloadToken: v.optional(v.id("_storage")),
      journeyLog: v.array(v.object({
        timestamp: v.string(),
        step: v.string(),
        status: v.string(),
        details: v.optional(v.string()),
      })),
    }))),
    lastWrapperRun: v.optional(v.number()),
    lastWrapperResult: v.optional(v.string()),

    // VAPI fields (V3)
    officeAttemptIndex: v.optional(v.number()),
    officeAttempts: v.optional(v.array(v.object({
      officeCalled: v.string(),
      outcome: v.string(),
      confidence: v.string(),
      crashTime24h: v.optional(v.string()),
      officerId: v.optional(v.string()),
      calledAt: v.number(),
    }))),

    // Escalation
    escalationNotes: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_lawFirmId", ["lawFirmId"])
    .index("by_internalStatus", ["internalStatus"])
    .index("by_createdAt", ["createdAt"]),

  jobEvents: defineTable({
    jobId: v.id("chpJobs"),
    eventType: v.string(),
    message: v.string(),
    isUserFacing: v.boolean(),
    userId: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_timestamp", ["timestamp"]),
});
```

---

### Convex Queries

```typescript
// convex/chpJobs.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getJobsByLawFirm = query({
  args: { lawFirmId: v.string() },
  handler: async (ctx, { lawFirmId }) => {
    return await ctx.db
      .query("chpJobs")
      .withIndex("by_lawFirmId", (q) => q.eq("lawFirmId", lawFirmId))
      .order("desc")
      .collect();
  },
});

export const getJobById = query({
  args: { jobId: v.id("chpJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});

export const getAllJobsForStaff = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("chpJobs")
      .order("desc")
      .collect();
  },
});

// convex/jobEvents.ts
export const getEventsByJobId = query({
  args: { jobId: v.id("chpJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("jobEvents")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .order("asc")
      .collect();
  },
});

export const getUserFacingEvents = query({
  args: { jobId: v.id("chpJobs") },
  handler: async (ctx, { jobId }) => {
    const events = await ctx.db
      .query("jobEvents")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .order("asc")
      .collect();
    return events.filter((e) => e.isUserFacing);
  },
});
```

---

### Convex Mutations

```typescript
// convex/chpJobs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createJob = mutation({
  args: {
    clientName: v.string(),
    reportNumber: v.string(),
    caseReference: v.optional(v.string()),
    clientType: v.optional(v.union(v.literal("driver"), v.literal("passenger"))),
    additionalPartyInfo: v.optional(v.string()),
    lawFirmId: v.string(),
    lawFirmName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Split client name
    const names = args.clientName.trim().split(' ');
    const lastName = names.pop() || '';
    const firstName = names.join(' ');

    // Derive NCIC from report number
    const ncic = args.reportNumber.substring(0, 4);

    const jobId = await ctx.db.insert("chpJobs", {
      ...args,
      firstName,
      lastName,
      ncic,
      internalStatus: "NEW",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_placeholder", // Replace with auth
    });

    // Create initial event
    await ctx.db.insert("jobEvents", {
      jobId,
      eventType: "job_created",
      message: "Request submitted",
      isUserFacing: true,
      timestamp: now,
    });

    return jobId;
  },
});

export const updatePageOne = mutation({
  args: {
    jobId: v.id("chpJobs"),
    crashDate: v.string(),
    crashTime: v.string(),
    officerId: v.string(),
  },
  handler: async (ctx, { jobId, ...data }) => {
    await ctx.db.patch(jobId, {
      ...data,
      updatedAt: Date.now(),
    });
  },
});

export const updatePageTwo = mutation({
  args: {
    jobId: v.id("chpJobs"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    plate: v.optional(v.string()),
    driverLicense: v.optional(v.string()),
    vin: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, ...data }) => {
    await ctx.db.patch(jobId, {
      ...data,
      updatedAt: Date.now(),
    });
  },
});

export const triggerChpWrapper = mutation({
  args: { jobId: v.id("chpJobs") },
  handler: async (ctx, { jobId }) => {
    // Update status
    await ctx.db.patch(jobId, {
      internalStatus: "AUTOMATION_RUNNING",
      updatedAt: Date.now(),
    });

    // Add event
    await ctx.db.insert("jobEvents", {
      jobId,
      eventType: "wrapper_triggered",
      message: "We're contacting CHP about your report",
      isUserFacing: true,
      timestamp: Date.now(),
    });

    // Schedule the action to call external wrapper
    await ctx.scheduler.runAfter(0, internal.chpJobs.executeWrapper, { jobId });
  },
});
```

---

### Convex Actions (External API Calls)

```typescript
// convex/chpJobs.ts
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const executeWrapper = internalAction({
  args: { jobId: v.id("chpJobs") },
  handler: async (ctx, { jobId }) => {
    // Get job data
    const job = await ctx.runQuery(internal.chpJobs.getJobInternal, { jobId });
    if (!job) throw new Error("Job not found");

    // Call Fly.io CHP wrapper
    const response = await fetch("https://chp-wrapper.fly.dev/api/run-chp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: jobId,
        reportNumber: job.reportNumber,
        crashDate: job.crashDate,
        crashTime: job.crashTime,
        ncic: job.ncic,
        officerId: job.officerId,
        firstName: job.firstName,
        lastName: job.lastName,
        plate: job.plate,
        driverLicense: job.driverLicense,
        vin: job.vin,
      }),
    });

    const result = await response.json();

    // Update job with result
    await ctx.runMutation(internal.chpJobs.processWrapperResult, {
      jobId,
      resultType: result.resultType,
      message: result.message,
      downloadToken: result.downloadToken,
      journeyLog: result.journeyLog,
      duration: result.duration,
    });
  },
});
```

---

### File Upload/Download Pattern

```typescript
// convex/storage.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Client-side upload
async function uploadFile(file: File) {
  // Step 1: Get upload URL
  const uploadUrl = await generateUploadUrl();

  // Step 2: Upload file
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await result.json();

  // Step 3: Save storage ID to job
  await saveFileToJob({ jobId, storageId, fileType: "full_report" });

  return storageId;
}

// Download file
async function downloadFile(storageId: string) {
  const url = await getFileUrl({ storageId });
  window.open(url, "_blank");
}
```

---

### Real-Time Updates

Convex provides automatic real-time updates via `useQuery`:

```typescript
// Component automatically re-renders when job changes
function JobDetail({ jobId }: { jobId: Id<"chpJobs"> }) {
  const job = useQuery(api.chpJobs.getJobById, { jobId });
  const events = useQuery(api.jobEvents.getEventsByJobId, { jobId });

  // When wrapper completes and updates job.internalStatus,
  // this component re-renders automatically!

  return (
    <div>
      <StatusBadge status={job?.internalStatus} />
      {/* ... */}
    </div>
  );
}
```

No polling needed - Convex pushes updates to all connected clients.

---

# Part 7: Future Integrations

## 16. VAPI AI Caller - UI Planning (V3)

### Purpose

The VAPI AI Caller automates phone calls to CHP offices to obtain crash time and officer ID. This saves staff from manually calling and waiting on hold.

### UI Location

The AI Caller button will be placed in **Card 1: Page 1 Data** of the Staff Job Detail screen, directly next to the "Call CHP" button.

### Button Placement

```
┌─────────────────────────────────────────────────────────────┐
│ Page 1 Data                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  📞 Call CHP     │  │  🤖 AI Caller    │                │
│  │  (Manual)        │  │  (Automatic)     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  [Form fields below...]                                     │
└─────────────────────────────────────────────────────────────┘
```

### Button States

| State | Appearance | Icon | Text | Action |
|-------|------------|------|------|--------|
| **Idle** | Blue gradient | 🤖 Robot | "AI Caller" | Click to start |
| **Calling** | Blue, animated pulse | 📞 Spinning | "Calling LA CHP..." | Show progress |
| **Success** | Green, solid | ✅ Checkmark | "Call Complete" | Show result |
| **Failed** | Red, solid | ❌ X mark | "Call Failed" | Show retry option |
| **Disabled (V1/V2)** | Gray, disabled | 🤖 Robot | "AI Caller" | Tooltip: "Coming in V3" |

### Call Progress Display

When AI Caller is active, show a progress panel:

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Caller Active                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📞 Calling: Los Angeles CHP                               │
│  ⏱️  Elapsed: 00:45                                        │
│  🔄 Attempt: 1 of 5                                        │
│                                                             │
│  Status: Speaking with dispatcher...                        │
│                                                             │
│  [Cancel Call]                                              │
└─────────────────────────────────────────────────────────────┘
```

### Success Result Display

When call succeeds:

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ AI Call Complete                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Crash Time: 14:30 (from "2:30 PM")                        │
│  Officer ID: 012345 (from "one two three four five")       │
│                                                             │
│  Confidence: HIGH ✓                                        │
│  Office: Los Angeles CHP                                   │
│                                                             │
│  [Apply to Form] [Dismiss]                                 │
└─────────────────────────────────────────────────────────────┘
```

### Failed Result Display

When call fails:

```
┌─────────────────────────────────────────────────────────────┐
│ ❌ AI Call Failed                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Outcome: OFFICE_CLOSED_OR_VOICEMAIL                       │
│  Offices Tried: 3 of 5                                     │
│                                                             │
│  Notes: "Reached voicemail at all three offices tried."    │
│                                                             │
│  [Try More Offices] [Call Manually] [Dismiss]              │
└─────────────────────────────────────────────────────────────┘
```

### Call History Section

Add a collapsible section in Wrapper History card (or separate card):

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ AI Call History                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dec 10, 2025 at 10:30 AM                               │ │
│ │ Office: Los Angeles CHP                                 │ │
│ │ Result: [🟢 SUCCESS]                                   │ │
│ │ Confidence: HIGH                                        │ │
│ │ Crash Time: 14:30 | Officer ID: 012345                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dec 10, 2025 at 10:28 AM                               │ │
│ │ Office: East LA CHP                                     │ │
│ │ Result: [⚪ OFFICE_CLOSED]                             │ │
│ │ Notes: "Reached after-hours message only."             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### V1/V2 Implementation

For V1 and V2, the AI Caller button should be visible but disabled:

```typescript
<Button
  variant="secondary"
  disabled={true}
  onClick={() => {}}
  title="Coming in V3 - AI-powered calling"
>
  <RobotIcon className="w-4 h-4 mr-2" />
  AI Caller
</Button>
```

This allows users to see the feature is coming, and the UI layout already accommodates it.

---

## 17. VAPI AI Caller - Backend Architecture (V3)

### High-Level Flow

```
Staff → Frontend → Convex → VAPI → CHP Office
  │        │         │        │        │
  ├→ Click AI Caller
        ├→ startChpCall(jobId)
              ├→ POST /call/phone
                  ├→ Dial CHP office
                  ├→ AI speaks to dispatcher
                  └→ Requests crash time & officer ID
                              ├→ Provides information
                      ├→ Webhook: SubmitCHPCallResult
                        ├→ Update job with result
                        ├→ Real-time update
                └→ Display result
```

### VAPI Assistant Configuration

The VAPI assistant is configured with:
- **Name:** InstaTCR CHP Caller
- **Voice:** Professional, human-sounding
- **System Prompt:** Detailed instructions for obtaining crash time and officer ID

**Key Behaviors:**
- Never mention AI, automation, or bots
- Read report number digit-by-digit
- Confirm information before ending
- Handle various dispatcher responses

### Assistant Variables

Passed via `assistantOverrides.variableValues`:

| Variable | Description | Example |
|----------|-------------|---------|
| `lawFirmName` | Law firm name | "Smith & Associates" |
| `clientName` | Client name | "Dora Cruz-Arteaga" |
| `reportNumber` | Report number | "9465-2025-02802" |
| `crashDate` | Crash date | "2025-12-01" |
| `jobId` | Internal job ID | "abc123" |
| `officeCalled` | Office name/phone | "Los Angeles CHP" |

### Tool Schema: SubmitCHPCallResult

The VAPI assistant calls this tool at the end of every call:

```json
{
  "name": "SubmitCHPCallResult",
  "parameters": {
    "jobId": "string (required)",
    "crashTime24h": "string (HH:MM format)",
    "officerId": "string (5 digits)",
    "outcome": "SUCCESS | REPORT_NOT_FOUND | NO_INFORMATION_GIVEN | OFFICE_CLOSED_OR_VOICEMAIL | CALL_DROPPED_OR_TOO_NOISY | TRANSFERRED_LOOP_OR_TIMEOUT",
    "confidence": "HIGH | MEDIUM | LOW",
    "rawTimeSpoken": "string (exact words)",
    "rawOfficerIdSpoken": "string (exact words)",
    "officeCalled": "string",
    "callNotes": "string (summary)"
  }
}
```

### Webhook Handler

```typescript
// src/app/api/vapi/chp-tool/route.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const payload = await request.json();

  // Only handle tool-calls
  if (payload.message?.type !== "tool-calls") {
    return Response.json({});
  }

  for (const toolCall of payload.message.toolCalls) {
    if (toolCall.function?.name === "SubmitCHPCallResult" ||
        toolCall.function?.name === "submit_chp_call_result") {

      const args = toolCall.function.arguments;

      // Process the call result
      await convex.mutation(api.chpJobs.processVapiResult, {
        jobId: args.jobId,
        crashTime24h: args.crashTime24h || "",
        officerId: args.officerId || "",
        outcome: args.outcome,
        confidence: args.confidence,
        rawTimeSpoken: args.rawTimeSpoken || "",
        rawOfficerIdSpoken: args.rawOfficerIdSpoken || "",
        officeCalled: args.officeCalled || "",
        callNotes: args.callNotes || "",
      });

      return Response.json({
        results: [{
          name: "SubmitCHPCallResult",
          toolCallId: toolCall.id,
          result: JSON.stringify({ status: "ok" }),
        }],
      });
    }
  }

  return Response.json({});
}
```

### Office Hopping Logic

When a call fails with a retryable outcome, try the next office:

**Retryable Outcomes:**
- `OFFICE_CLOSED_OR_VOICEMAIL`
- `CALL_DROPPED_OR_TOO_NOISY`
- `TRANSFERRED_LOOP_OR_TIMEOUT`

**Non-Retryable Outcomes:**
- `SUCCESS` - Done!
- `REPORT_NOT_FOUND` - Report doesn't exist
- `NO_INFORMATION_GIVEN` - Dispatcher refused

```typescript
// convex/chpJobs.ts
export const processVapiResult = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Add to office attempts
    const attempts = job.officeAttempts || [];
    attempts.push({
      officeCalled: args.officeCalled,
      outcome: args.outcome,
      confidence: args.confidence,
      crashTime24h: args.crashTime24h,
      officerId: args.officerId,
      calledAt: Date.now(),
    });

    if (args.outcome === "SUCCESS" && args.confidence !== "LOW") {
      // Success! Update job with data
      await ctx.db.patch(args.jobId, {
        crashTime: args.crashTime24h,
        officerId: args.officerId,
        officeAttempts: attempts,
        internalStatus: "READY_FOR_AUTOMATION",
        updatedAt: Date.now(),
      });
    } else if (isRetryable(args.outcome)) {
      // Try next office
      const nextIndex = (job.officeAttemptIndex || 0) + 1;
      if (nextIndex < MAX_OFFICE_ATTEMPTS) {
        await ctx.db.patch(args.jobId, {
          officeAttemptIndex: nextIndex,
          officeAttempts: attempts,
        });
        // Schedule next call
        await ctx.scheduler.runAfter(0, internal.chpJobs.startNextCall, { jobId: args.jobId });
      } else {
        // Exhausted all offices
        await ctx.db.patch(args.jobId, {
          officeAttempts: attempts,
          internalStatus: "NEEDS_CALL", // Fall back to manual
        });
      }
    } else {
      // Non-retryable failure
      await ctx.db.patch(args.jobId, {
        officeAttempts: attempts,
        internalStatus: "NEEDS_CALL",
      });
    }
  },
});
```

### CHP Offices Configuration

```typescript
// src/lib/chpOffices.ts
export const CHP_OFFICES = [
  { id: "la", name: "Los Angeles CHP", phone: "+1XXXXXXXXXX" },
  { id: "east-la", name: "East LA CHP", phone: "+1XXXXXXXXXX" },
  { id: "santa-fe-springs", name: "Santa Fe Springs CHP", phone: "+1XXXXXXXXXX" },
  { id: "west-la", name: "West LA CHP", phone: "+1XXXXXXXXXX" },
  { id: "south-la", name: "South LA CHP", phone: "+1XXXXXXXXXX" },
  // ... up to 50 offices
];

export const MAX_OFFICE_ATTEMPTS = 5;

export function getOfficeForIndex(index: number) {
  return CHP_OFFICES[index] || null;
}
```

---

## 18. Open Router API (V4+)

### Purpose

Open Router provides access to multiple AI models (GPT-4, Claude, etc.) through a unified API. In V4, we'll use this for enhanced AI features.

### Potential Use Cases

#### 1. Chat Assistance for Law Firms

Help law firms get quick answers about their requests:

```
Law Firm: "What's taking so long with my request?"

AI: "I can see your request for Dora Cruz-Arteaga (report #9465-2025-02802)
was submitted 3 hours ago. We've already obtained the face page from CHP,
but the full report isn't available yet. This typically takes 24-72 hours
after a crash. We'll notify you as soon as it's ready!"
```

#### 2. Document Parsing

Extract driver name from uploaded face pages:

```typescript
async function parseDriverName(pdfStorageId: string): Promise<{ firstName: string; lastName: string }> {
  // 1. Convert PDF to image
  // 2. Send to vision model via Open Router
  // 3. Extract driver name from response
  // 4. Return parsed name
}
```

#### 3. Natural Language Job Creation

Allow voice/text input for creating requests:

```
User: "Create a request for John Smith, report number 9-4-6-5-2-0-2-5-0-2-8-0-2"

System:
- Parses: clientName = "John Smith"
- Parses: reportNumber = "9465-2025-02802"
- Creates job with extracted data
```

#### 4. Smart Field Suggestions

Suggest corrections for invalid data:

```
User enters: Officer ID "12345"
AI suggests: "Officer IDs should be 6 digits starting with 0. Did you mean 012345?"
```

### Implementation Placeholder

```typescript
// src/lib/openrouter.ts
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function chat(messages: Message[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-sonnet",
      messages,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### V4 Scope (TBD)

- Chat widget in law firm dashboard
- Document parsing pipeline
- Natural language processing
- Smart suggestions and autocomplete

---

## 19. Future Roadmap Timeline

### Visual Roadmap

```
V1 MVP (Week 1-2)
├── Frontend-first development
├── All screens functional with mock data
├── Mobile-optimized, 375px+
└── Complete component library

V2 Backend (Week 3)
├── Convex integration
├── Real database, real-time updates
├── Fly.io CHP wrapper
└── File upload/download

V3 VAPI (Week 4+)
├── AI Caller integration
├── Office hopping logic
├── Call history tracking
└── Webhook endpoints

V4 AI Features (Future)
├── Open Router integration
├── Chat assistance
├── Document parsing
└── Smart suggestions
```

### Detailed Timeline

| Version | Duration | Start | Key Deliverables |
|---------|----------|-------|------------------|
| **V1 MVP** | 13 days | Week 1 | Frontend complete with mock data, all screens, all components |
| **V2 Backend** | 6 days | Week 3 | Convex connected, CHP wrapper on Fly.io, files working |
| **V3 VAPI** | TBD | Week 4+ | AI Caller functional, office hopping, full integration |
| **V4 AI** | TBD | Future | Open Router features, enhanced UX |

### Success Criteria per Version

**V1 Complete When:**
- [ ] All 6 screens work on mobile (375px+)
- [ ] All 6 screens work on desktop (1920px)
- [ ] All breakpoints tested
- [ ] All interactions smooth
- [ ] Touch targets ≥ 44px
- [ ] Mock data covers all scenarios

**V2 Complete When:**
- [ ] Real jobs persist in Convex
- [ ] CHP wrapper runs on Fly.io
- [ ] PDFs upload and download
- [ ] Real-time updates work
- [ ] Auth protects routes

**V3 Complete When:**
- [ ] AI Caller button works
- [ ] VAPI calls CHP offices
- [ ] Office hopping retries
- [ ] Results populate form
- [ ] Call history tracked

**V4 Complete When:**
- [ ] Chat widget responds
- [ ] Documents parse names
- [ ] NL job creation works
- [ ] Smart suggestions help

---

# Part 8: Technical Reference

## 20. Validation Rules

### Client Name

| Rule | Value |
|------|-------|
| Required | Yes |
| Minimum length | 2 characters |
| Format | Any string |
| Auto-processing | Split into firstName/lastName |

```typescript
function validateClientName(name: string): ValidationResult {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: "Client name must be at least 2 characters" };
  }
  return { valid: true };
}
```

### Report Number

| Rule | Value |
|------|-------|
| Required | Yes |
| Format | `9XXX-YYYY-ZZZZZ` |
| Example | "9465-2025-02802" |
| Auto-processing | Derive NCIC (first 4 digits), derive year (next 4 digits) |

```typescript
function validateReportNumber(reportNumber: string): ValidationResult {
  const regex = /^9\d{3}-\d{4}-\d{5}$/;

  if (!reportNumber) {
    return { valid: false, error: "Report number is required" };
  }

  if (!regex.test(reportNumber)) {
    return {
      valid: false,
      error: "Format must be 9XXX-YYYY-ZZZZZ (e.g., 9465-2025-02802)"
    };
  }

  return { valid: true };
}
```

### Crash Date

| Rule | Value |
|------|-------|
| Required | For automation |
| Format | mm/dd/yyyy |
| Validation | Must be valid date, cannot be future |
| HTML5 Input | Returns YYYY-MM-DD (requires conversion) |

```typescript
function validateCrashDate(date: string): ValidationResult {
  if (!date) {
    return { valid: false, error: "Crash date is required" };
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  if (parsed > new Date()) {
    return { valid: false, error: "Crash date cannot be in the future" };
  }

  return { valid: true };
}
```

### Crash Time

| Rule | Value |
|------|-------|
| Required | For automation |
| Format | HHMM (4 digits, 24-hour) |
| Valid range | 0000-2359 |
| Examples | "0930" (9:30 AM), "1430" (2:30 PM), "2200" (10:00 PM) |

```typescript
function validateCrashTime(time: string): ValidationResult {
  const regex = /^\d{4}$/;

  if (!time) {
    return { valid: false, error: "Crash time is required" };
  }

  if (!regex.test(time)) {
    return { valid: false, error: "Must be 4 digits (e.g., 1430 for 2:30 PM)" };
  }

  const hours = parseInt(time.substring(0, 2));
  const minutes = parseInt(time.substring(2, 4));

  if (hours > 23) {
    return { valid: false, error: "Hours must be 00-23" };
  }

  if (minutes > 59) {
    return { valid: false, error: "Minutes must be 00-59" };
  }

  return { valid: true };
}
```

### NCIC

| Rule | Value |
|------|-------|
| Required | For automation |
| Format | 4 digits |
| First digit | Must be "9" |
| Auto-derivation | First 4 chars of report number |
| Editable | Yes (in case of correction) |

```typescript
function validateNcic(ncic: string): ValidationResult {
  const regex = /^9\d{3}$/;

  if (!ncic) {
    return { valid: false, error: "NCIC is required" };
  }

  if (!regex.test(ncic)) {
    return { valid: false, error: "Must be 4 digits starting with 9 (e.g., 9465)" };
  }

  return { valid: true };
}
```

### Officer ID

| Rule | Value |
|------|-------|
| Required | For automation |
| Format | 6 digits |
| First digit | Must be "0" |
| Examples | "012345", "098765" |

```typescript
function validateOfficerId(officerId: string): ValidationResult {
  const regex = /^0\d{5}$/;

  if (!officerId) {
    return { valid: false, error: "Officer ID is required" };
  }

  if (!regex.test(officerId)) {
    return { valid: false, error: "Must be 6 digits starting with 0 (e.g., 012345)" };
  }

  return { valid: true };
}
```

### Page 2 Fields (Verification)

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| firstName | At least one P2 field | String | Auto-populated from clientName |
| lastName | At least one P2 field | String | Auto-populated from clientName |
| plate | At least one P2 field | String | License plate, any format |
| driverLicense | At least one P2 field | String | Driver's license number |
| vin | At least one P2 field | 17 characters | Vehicle identification number |

**Note:** At least ONE Page 2 field must be filled for CHP wrapper to run.

---

## 21. Responsive Design Guidelines

### Mobile-First Philosophy

All CSS starts with mobile styles, then adds desktop overrides:

```css
/* Mobile first (default) */
.element {
  padding: 1rem;      /* 16px */
  font-size: 1rem;    /* 16px */
}

/* Desktop override */
@media (min-width: 768px) {
  .element {
    padding: 1.5rem;  /* 24px */
    font-size: 0.875rem; /* 14px */
  }
}
```

### Breakpoints

| Name | Width | Tailwind | Use Case |
|------|-------|----------|----------|
| Mobile | < 640px | Default | Single column, full-width |
| Tablet | 640-767px | `sm:` | 2 columns, larger touch targets |
| Desktop | 768-1023px | `md:` | Split views, tables |
| Large | 1024-1279px | `lg:` | 3 column grids |
| XL | ≥ 1280px | `xl:` | Max-width containers |

### Main Breakpoint: 768px

This is the primary transition point between mobile and desktop layouts:

```tsx
// Mobile layout (< 768px)
<div className="flex flex-col md:hidden">
  <TabBar tabs={tabs} />
  {activeTab === 'tab1' && <TabOneContent />}
  {activeTab === 'tab2' && <TabTwoContent />}
</div>

// Desktop layout (≥ 768px)
<div className="hidden md:grid md:grid-cols-2 md:gap-6">
  <TabOneContent />
  <TabTwoContent />
</div>
```

### Touch Target Sizing

**WCAG 2.1 AAA requires minimum 44x44px touch targets.**

```css
/* Ensure all interactive elements meet minimum size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Button sizes */
.btn-mobile {
  height: 48px;     /* Slightly larger than minimum */
  padding: 0 24px;
}

.btn-desktop {
  height: 40px;
  padding: 0 16px;
}
```

### Input Sizing

| Breakpoint | Height | Font Size | Notes |
|------------|--------|-----------|-------|
| Mobile | 48px | 16px | 16px prevents iOS zoom |
| Desktop | 40px | 14px | Standard desktop size |

```css
.input-mobile {
  height: 48px;
  font-size: 16px;  /* Prevents iOS zoom */
  padding: 0 16px;
}

.input-desktop {
  height: 40px;
  font-size: 14px;
  padding: 0 12px;
}
```

### Grid Layouts

| Screen | Columns | Tailwind Classes |
|--------|---------|------------------|
| Job Cards (Mobile) | 1 | `grid grid-cols-1` |
| Job Cards (Tablet) | 2 | `sm:grid-cols-2` |
| Job Cards (Desktop) | 3 | `lg:grid-cols-3` |
| Stats Cards (Mobile) | 2 | `grid grid-cols-2` |
| Stats Cards (Desktop) | 4 | `md:grid-cols-4` |

### Common Patterns

**Centered Card (Desktop):**
```tsx
<div className="w-full md:max-w-xl md:mx-auto">
  <Card>...</Card>
</div>
```

**Full-Width to Split View:**
```tsx
<div className="flex flex-col md:flex-row md:gap-6">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

**Hide/Show Based on Breakpoint:**
```tsx
{/* Mobile only */}
<div className="md:hidden">Mobile Nav</div>

{/* Desktop only */}
<div className="hidden md:block">Desktop Nav</div>
```

---

## 22. Accessibility Guidelines (WCAG 2.1 AA/AAA Compliance)

InstaTCR is designed to be accessible to all users, including those with disabilities. The application meets WCAG 2.1 Level AA standards with several Level AAA enhancements.

### Keyboard Navigation

#### Tab Order & Arrow Keys
- All interactive elements are keyboard-accessible in logical tab order
- **TabBar Component:** Arrow keys navigate between tabs (Left/Right), Home goes to first tab, End goes to last tab
- **Modals:** Escape key closes, focus returns to trigger button on close

#### ARIA Implementation

```tsx
// TabBar with full ARIA support
<div role="tablist">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls={panelId}
    tabIndex={isActive ? 0 : -1}
  >
    Tab Label
  </button>
</div>
<div role="tabpanel" id={panelId} aria-labelledby={tabId}>
  Content
</div>

// Status badges with live updates
<span role="status" aria-live="polite" aria-atomic="true">
  {publicStatus}
</span>

// Form validation
<input
  id="reportNumber"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-reportNumber' : undefined}
/>
{hasError && (
  <span id="error-reportNumber" role="alert">
    {errorMessage}
  </span>
)}

// Toast notifications
<div role="status" aria-live="polite" aria-atomic="true">
  {toastMessage}
</div>
```

### Focus Management

#### Focus Trapping

Modals and drawers use `focus-trap-react` to prevent focus from escaping:

```tsx
import FocusTrap from 'focus-trap-react';

<FocusTrap active={isOpen} onDeactivate={handleClose}>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Modal Title</h2>
    {/* Focus cannot escape to content behind modal */}
  </div>
</FocusTrap>
```

#### Focus Visible Styling

All interactive elements have visible focus indicators:

```css
/* Teal ring with offset for dark backgrounds */
focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900
```

#### Focus Restoration

When modals close, focus returns to the element that opened them:

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setIsOpen(false);
  // Restore focus after modal closes
  setTimeout(() => triggerRef.current?.focus(), 0);
};
```

### Color Contrast

#### WCAG Compliance Table

| Element | Minimum Ratio | WCAG Level | Implementation |
|---------|---------------|-----------|----------------|
| Normal Text | 4.5:1 | AA | All body text meets 4.5:1 |
| Large Text (≥18pt) | 3:1 | AA | Headings and large UI elements |
| UI Components | 3:1 | AA | Buttons, inputs, badges |
| Focus Indicators | 3:1 | AA | Teal ring on slate background |
| Status Badges | 7:1 | AAA | Enhanced contrast (200-level colors) |

#### Status Badge Colors (WCAG AAA)

Dark mode badge text uses 200-level colors for 7:1 contrast ratio:

```typescript
// Enhanced contrast in DARK_STATUS_COLORS
{
  gray: { text: 'text-slate-200' },    // 7.2:1 contrast
  blue: { text: 'text-blue-200' },     // 7.3:1 contrast
  green: { text: 'text-emerald-200' }, // 7.2:1 contrast
  amber: { text: 'text-amber-200' },   // 7.1:1 contrast
  red: { text: 'text-red-200' },       // 7.8:1 contrast
}
```

### Semantic HTML

Use semantic elements for proper screen reader navigation:

```tsx
// Good: Semantic form elements
<form onSubmit={handleSubmit}>
  <label htmlFor="clientName">Client Name</label>
  <input id="clientName" type="text" required />
  <button type="submit">Submit</button>
</form>

// Good: Semantic landmarks
<header role="banner">
  {/* Site header */}
</header>

<main id="main-content">
  {/* Primary content */}
</main>

<footer role="contentinfo">
  {/* Site footer */}
</footer>

// Avoid: Non-semantic divs with onClick
<div onClick={handleSubmit} className="button-like">
  Submit  {/* Not accessible */}
</div>
```

### Screen Reader Support

#### Meaningful Text

```tsx
// Good: Descriptive button text
<button>Download Report PDF</button>

// Avoid: Generic text
<button>Click here</button>

// Icon-only buttons need aria-label
<button aria-label="Download report PDF">
  <Download className="w-5 h-5" />
</button>

// Hidden context for screen readers
<span className="sr-only">
  Status: {publicStatus} (updated {relativeTime})
</span>
```

#### Alt Text for Images

```tsx
// Descriptive alt text
<img
  src="/logo.png"
  alt="InstaTCR logo - CHP crash report management system"
/>

// Decorative images: empty alt
<img src="/divider.png" alt="" role="presentation" />
```

### Font & Input Sizing

#### Font Size Table

| Context | Mobile | Desktop | Reasoning |
|---------|--------|---------|-----------|
| Body Text | 16px | 14px | 16px prevents iOS zoom on inputs |
| Headings (H1) | 24px | 28px | Sufficient hierarchy |
| Button Text | 16px | 14px | Matches input sizing |
| Small Text | 14px | 12px | Not smaller than 12px |
| Minimum (Captions) | 12px | 12px | Only for non-critical info |

#### Input Size Table

| Breakpoint | Height | Min Width | Touch Target |
|------------|--------|-----------|--------------|
| Mobile (< 768px) | 48px | Full-width | WCAG 2.5 Spacing (44px minimum) |
| Desktop (≥ 768px) | 40px | Varies | Mouse precision allows smaller |

**Why 48px on mobile?** Meets WCAG 2.5.5 Target Size (Level AAA) and prevents iOS zoom with 16px font.

### Skip Navigation

Keyboard-accessible skip link at document start:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2"
>
  Skip to main content
</a>
```

### Testing Accessibility

```bash
# Install accessibility testing tools
npm install --save-dev @testing-library/jest-dom axe-core

# Run automated tests
npm run test:a11y
```

**Manual Testing Checklist:**
- [ ] Keyboard-only navigation (no mouse)
- [ ] Screen reader testing (VoiceOver on macOS/iOS, NVDA on Windows)
- [ ] Color contrast check (WebAIM Contrast Checker)
- [ ] Font sizing at 200% zoom
- [ ] Focus visible on all interactive elements
- [ ] ARIA attributes validated (axe DevTools)

**Recommended Tools:**
- **axe DevTools** (Chrome Extension) - Automated accessibility testing
- **WAVE** (Web Accessibility Evaluation Tool) - Visual accessibility checker
- **WebAIM Contrast Checker** - Color contrast validation
- **Color Oracle** - Color blindness simulator

---

## 23. Testing Checklist

### General UI Tests

| Test | Description | Pass Criteria |
|------|-------------|---------------|
| Mobile rendering | Test on 375px width | All content visible, no horizontal scroll |
| Desktop rendering | Test on 1920px width | Layout uses available space appropriately |
| Breakpoint transitions | Resize from 320px to 1920px | Smooth transitions, no layout breaks |
| Button clicks | Click all buttons | Correct action triggered, feedback shown |
| Form submission | Submit all forms | Validation works, success/error shown |
| Navigation | Click all links | Correct page loads |
| Scroll behavior | Scroll on all pages | Content scrolls, headers stay if sticky |
| Text readability | Check all text | Sufficient contrast, readable size |
| Image loading | Check all images | Images load, alt text present |
| Console errors | Check browser console | No JavaScript errors |

### CHP Wrapper Tests

| Test | Description | Pass Criteria |
|------|-------------|---------------|
| Prerequisites check | Try run without Page 1 | Button disabled, tooltip shows |
| Prerequisites check | Try run without Page 2 | Button disabled, tooltip shows |
| Loading state | Click run wrapper | Shows 8-13 sec loading |
| FULL result | Mock returns FULL | Green badge, download button |
| FACE_PAGE result | Mock returns FACE_PAGE | Yellow badge, download button |
| NO_RESULT result | Mock returns NO_RESULT | Gray badge, no download |
| ERROR result | Mock returns ERROR | Red badge, error message |
| Journey log | Expand journey log | Logs display, warning shown |
| Wrapper history | Check history after runs | All runs listed, sorted by date |
| Date conversion | Enter date, check API | MM/DD/YYYY format sent |

### Mobile Responsiveness Tests

| Test | Description | Pass Criteria |
|------|-------------|---------------|
| FAB visibility | Check on mobile | FAB visible bottom-right |
| FAB hidden | Check on desktop | FAB hidden |
| TabBar | Check staff detail on mobile | Tabs work, content switches |
| Split view | Check staff detail on desktop | Side-by-side columns |
| Touch targets | Tap all interactive elements | All ≥ 44x44px |

### VAPI Integration Tests (V3)

| Test | Description | Pass Criteria |
|------|-------------|---------------|
| AI Caller button | Check V1/V2 | Button visible but disabled |
| AI Caller start | Click in V3 | Call initiates, progress shows |
| Office hopping | First call fails | Next office called |
| Success handling | Call succeeds | Form auto-filled |
| Failure handling | All calls fail | Error shown, manual option |

---

## 24. Deployment Architecture

### System Overview

```
Users
  ├── Law Firm Users
  └── Staff Users
       │
       ├─→ Vercel (Frontend)
       │   ├── Next.js 15 App
       │   └── API Routes
       │
       ├─→ Convex Cloud (Backend)
       │   ├── Database
       │   ├── Queries
       │   ├── Mutations
       │   ├── Actions
       │   └── File Storage
       │
       ├─→ Fly.io (Automation)
       │   ├── CHP Wrapper Service
       │   └── Playwright Browser
       │
       └─→ VAPI Cloud (V3)
           └── CHP Caller Assistant
```

### Service Details

| Service | Platform | Domain | Purpose |
|---------|----------|--------|---------|
| Frontend | Vercel | app.instatcr.com | Next.js 15 application |
| Database | Convex | *.convex.cloud | Real-time database |
| File Storage | Convex | *.convex.cloud | PDF storage |
| CHP Wrapper | Fly.io | chp-wrapper.fly.dev | Browser automation |
| VAPI Webhook | Vercel | app.instatcr.com/api/vapi/* | AI caller webhooks |

### Environment Variables

**Frontend (Vercel):**
```bash
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=xxx
```

**CHP Wrapper (Fly.io):**
```bash
CHP_PORTAL_EMAIL=xxx
CHP_PORTAL_PASSWORD=xxx
CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=xxx
```

**VAPI (V3):**
```bash
VAPI_API_KEY=xxx
VAPI_ASSISTANT_ID=xxx
VAPI_PHONE_NUMBER_ID=xxx
```

### Deployment Commands

**Frontend (Vercel):**
```bash
# Automatic on git push to main
git push origin main

# Manual deploy
vercel --prod
```

**Convex:**
```bash
# Deploy schema and functions
npx convex deploy
```

**CHP Wrapper (Fly.io):**
```bash
# Deploy to Fly.io
fly deploy
```

### Monitoring

| What | Tool | Purpose |
|------|------|---------|
| Frontend errors | Vercel Analytics | Track JS errors |
| API performance | Vercel Functions | Response times |
| Database queries | Convex Dashboard | Query performance |
| Wrapper runs | Custom logs | Track automation success |
| VAPI calls | VAPI Dashboard | Track call success |

---

# Part 9: Appendices

## 25. Quick Reference

### File Structure

```
InstaTCR/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── law/
│   │   │   ├── layout.tsx              # Law firm layout
│   │   │   ├── page.tsx                # Dashboard
│   │   │   └── jobs/
│   │   │       ├── new/
│   │   │       │   └── page.tsx        # New request form
│   │   │       └── [jobId]/
│   │   │           └── page.tsx        # Job detail
│   │   ├── staff/
│   │   │   ├── layout.tsx              # Staff layout
│   │   │   ├── page.tsx                # Job queue
│   │   │   └── jobs/
│   │   │       └── [jobId]/
│   │   │           └── page.tsx        # Staff job detail
│   │   └── api/
│   │       └── vapi/
│   │           └── chp-tool/
│   │               └── route.ts        # VAPI webhook (V3)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── FloatingActionButton.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── MobileJobCard.tsx
│   │   │   └── index.ts
│   │   └── layout/
│   │       ├── MobileNav.tsx
│   │       └── MobileDrawer.tsx
│   ├── hooks/
│   │   └── useMediaQuery.ts
│   └── lib/
│       ├── mockData.ts                 # Mock data (V1)
│       ├── statusMapping.ts            # Status conversion
│       ├── utils.ts                    # Helper functions
│       ├── types.ts                    # TypeScript interfaces
│       └── chpOffices.ts               # CHP office list (V3)
├── convex/
│   ├── schema.ts                       # Database schema
│   ├── chpJobs.ts                      # Job queries/mutations
│   ├── jobEvents.ts                    # Event queries/mutations
│   └── storage.ts                      # File upload/download
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

### Essential Imports

```typescript
// Components
import { Button, Input, Card, Badge, StatusBadge } from '@/components/ui';
import { FloatingActionButton, TabBar, StatCard } from '@/components/ui';
import { MobileNav, MobileDrawer } from '@/components/layout';

// Icons
import { Plus, ArrowLeft, Download, Check, X, Phone, Bot } from 'lucide-react';

// Hooks
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Utils
import {
  getPublicStatus,
  formatRelativeTime,
  splitClientName,
  deriveNcic,
  convertDateForApi
} from '@/lib/utils';

// Mock Data (V1)
import { mockJobs, getJobById, getJobEvents } from '@/lib/mockData';

// Convex (V2)
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
```

### Color Palette

```css
/* Status Colors */
--color-success: #22c55e;     /* green-500 */
--color-warning: #f59e0b;     /* amber-500 */
--color-error: #ef4444;       /* red-500 */
--color-info: #3b82f6;        /* blue-500 */

/* Result Type Colors */
--color-full: #22c55e;        /* green-500 */
--color-face-page: #eab308;   /* yellow-500 */
--color-no-result: #6b7280;   /* gray-500 */
--color-error: #ef4444;       /* red-500 */

/* UI Colors */
--color-primary: #3b82f6;     /* blue-500 */
--color-secondary: #6b7280;   /* gray-500 */
--color-background: #ffffff;
--color-surface: #f9fafb;     /* gray-50 */
--color-border: #e5e7eb;      /* gray-200 */
--color-text: #111827;        /* gray-900 */
--color-text-muted: #6b7280;  /* gray-500 */
```

### Tailwind Color Classes

| Use Case | Tailwind Classes |
|----------|------------------|
| Success (FULL, COMPLETED) | `bg-green-100 text-green-800 border-green-300` |
| Warning (FACE_PAGE, NEEDS_INFO) | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| Error (ERROR, CANCELLED) | `bg-red-100 text-red-800 border-red-300` |
| Info (IN_PROGRESS, CONTACTING) | `bg-blue-100 text-blue-800 border-blue-300` |
| Neutral (SUBMITTED, NO_RESULT) | `bg-gray-100 text-gray-800 border-gray-300` |

### Breakpoint Classes

```typescript
// Hide on mobile, show on desktop
className="hidden md:block"

// Show on mobile, hide on desktop
className="md:hidden"

// Responsive grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Responsive padding
className="p-4 md:p-6 lg:p-8"

// Responsive text
className="text-base md:text-sm"

// Responsive height
className="h-12 md:h-10"
```

### Liquid Glass Classes (V2.1.0)

InstaTCR uses a three-tier glass-morphism design system. See [05-component-library.md](05-component-library.md#liquid-glass-design-system-v210) for complete documentation.

```typescript
// Glass tier hierarchy (highest to lowest prominence)
className="glass-elevated"  // Primary containers, hero sections (85% opacity, 24px blur)
className="glass-surface"   // Secondary containers, cards (70% opacity, 20px blur)
className="glass-subtle"    // Nested elements, child cards (5% white, 8px blur)

// Sticky headers
className="glass-header"    // Sticky nav headers with glass effect

// Section dividers for visual grouping
<div className="section-divider">section label</div>

// Hover effects
className="hover-lift"        // 4px lift + teal glow
className="hover-lift-subtle" // 2px lift

// Spacing tokens
className="p-card"  // 20px padding (use for glass containers)
className="gap-card" // 20px gap (use for card grids)
```

**Usage Pattern:**
```tsx
// Page structure with glass hierarchy
<div className="glass-elevated p-6 md:p-8 mb-6">
  <h1>Page Title</h1>
</div>

<div className="glass-surface p-card mb-6">
  <div className="section-divider">overview</div>
  <div className="grid grid-cols-3 gap-3">
    <div className="glass-subtle rounded-xl p-4 hover-lift-subtle">
      Content
    </div>
  </div>
</div>
```

---

## 26. Mock Data Instructions

### Creating Sample Jobs

Create `src/lib/mockData.ts` with the following structure:

```typescript
import { Job, JobEvent, InternalStatus } from './types';

// Helper to generate timestamps
const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000;
const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

export const mockJobs: Job[] = [
  // NEW - Just created
  {
    _id: 'job_001',
    lawFirmId: 'law_001',
    lawFirmName: 'Smith & Associates',
    clientName: 'Dora Cruz-Arteaga',
    reportNumber: '9465-2025-02802',
    internalStatus: 'NEW',
    firstName: 'Dora',
    lastName: 'Cruz-Arteaga',
    ncic: '9465',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    createdBy: 'user_001',
  },

  // CALL_IN_PROGRESS - Staff calling CHP
  {
    _id: 'job_002',
    lawFirmId: 'law_001',
    lawFirmName: 'Smith & Associates',
    clientName: 'John Michael Smith',
    reportNumber: '9220-2025-01520',
    internalStatus: 'CALL_IN_PROGRESS',
    firstName: 'John Michael',
    lastName: 'Smith',
    ncic: '9220',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(1),
    createdBy: 'user_001',
  },

  // AUTOMATION_RUNNING - Wrapper executing
  {
    _id: 'job_003',
    lawFirmId: 'law_002',
    lawFirmName: 'Jones Legal Group',
    clientName: 'Maria Elena Lopez',
    reportNumber: '9315-2025-00123',
    internalStatus: 'AUTOMATION_RUNNING',
    crashDate: '12/01/2025',
    crashTime: '1430',
    ncic: '9315',
    officerId: '012345',
    firstName: 'Maria Elena',
    lastName: 'Lopez',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(0.1),
    createdBy: 'user_002',
  },

  // FACE_PAGE_ONLY - Has face page, waiting for full
  {
    _id: 'job_004',
    lawFirmId: 'law_001',
    lawFirmName: 'Smith & Associates',
    clientName: 'Robert James Wilson',
    reportNumber: '9180-2025-04521',
    internalStatus: 'FACE_PAGE_ONLY',
    crashDate: '11/28/2025',
    crashTime: '0930',
    ncic: '9180',
    officerId: '098765',
    firstName: 'Robert James',
    lastName: 'Wilson',
    facePageToken: 'storage_fp_001',
    guaranteedName: 'ROBERT JAMES WILSON',
    wrapperRuns: [
      {
        timestamp: hoursAgo(3),
        duration: 11234,
        resultType: 'FACE_PAGE',
        message: 'CHP report found (Face Page only). Full report not yet available.',
        downloadToken: 'storage_fp_001',
        journeyLog: generateMockJourneyLog('FACE_PAGE'),
      },
    ],
    lastWrapperRun: hoursAgo(3),
    lastWrapperResult: 'FACE_PAGE',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(3),
    createdBy: 'user_001',
  },

  // COMPLETED_FULL_REPORT - Success!
  {
    _id: 'job_005',
    lawFirmId: 'law_002',
    lawFirmName: 'Jones Legal Group',
    clientName: 'Sarah Ann Johnson',
    reportNumber: '9465-2024-98765',
    internalStatus: 'COMPLETED_FULL_REPORT',
    crashDate: '10/15/2024',
    crashTime: '2200',
    ncic: '9465',
    officerId: '054321',
    firstName: 'Sarah Ann',
    lastName: 'Johnson',
    fullReportToken: 'storage_fr_001',
    wrapperRuns: [
      {
        timestamp: daysAgo(2),
        duration: 12500,
        resultType: 'FULL',
        message: 'Full CHP crash report downloaded successfully.',
        downloadToken: 'storage_fr_001',
        journeyLog: generateMockJourneyLog('FULL'),
      },
    ],
    lastWrapperRun: daysAgo(2),
    lastWrapperResult: 'FULL',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    createdBy: 'user_002',
  },

  // ... Add more jobs for each status
];

// Generate more jobs to reach 15 total covering all statuses
```

### Mock Wrapper Execution

```typescript
export async function mockWrapperExecution(jobId: string): Promise<WrapperResult> {
  // Simulate realistic 8-13 second execution
  const duration = 8000 + Math.random() * 5000;
  await new Promise(resolve => setTimeout(resolve, duration));

  // Random result distribution
  const rand = Math.random();
  let resultType: WrapperResultType;
  let message: string;
  let downloadToken: string | undefined;

  if (rand < 0.30) {
    // 30% - Full report
    resultType = 'FULL';
    message = 'Full CHP crash report downloaded successfully.';
    downloadToken = `storage_mock_${Date.now()}`;
  } else if (rand < 0.70) {
    // 40% - Face page only
    resultType = 'FACE_PAGE';
    message = 'CHP report found (Face Page only). Full report not yet available.';
    downloadToken = `storage_mock_${Date.now()}`;
  } else if (rand < 0.85) {
    // 15% - No result
    resultType = 'NO_RESULT';
    message = 'No matching CHP reports were found for the provided search parameters.';
  } else {
    // 15% - Error
    resultType = 'ERROR';
    message = 'Crash report found but verification required. Add driver name or plate number and try again.';
  }

  return {
    resultType,
    message,
    downloadToken,
    duration,
    journeyLog: generateMockJourneyLog(resultType),
  };
}
```

### Mock Journey Log Generator

```typescript
function generateMockJourneyLog(resultType: WrapperResultType): JourneyStep[] {
  const baseTime = new Date();
  const steps: JourneyStep[] = [
    { timestamp: addSeconds(baseTime, 0).toISOString(), step: 'Starting automation run', status: 'success' },
    { timestamp: addSeconds(baseTime, 1.5).toISOString(), step: 'Logging into CHP portal', status: 'success' },
    { timestamp: addSeconds(baseTime, 3).toISOString(), step: 'Navigating to Crash Search', status: 'success' },
    { timestamp: addSeconds(baseTime, 5.5).toISOString(), step: 'Filling Page 1 fields (date, time, NCIC, officer)', status: 'success' },
    { timestamp: addSeconds(baseTime, 6).toISOString(), step: 'Submitting Page 1 search', status: 'success' },
  ];

  if (resultType === 'NO_RESULT') {
    steps.push({
      timestamp: addSeconds(baseTime, 8).toISOString(),
      step: 'No matching crash records found',
      status: 'success'
    });
  } else if (resultType === 'ERROR') {
    steps.push({
      timestamp: addSeconds(baseTime, 8).toISOString(),
      step: 'Verification required',
      status: 'error'
    });
  } else {
    steps.push(
      { timestamp: addSeconds(baseTime, 8).toISOString(), step: 'Crash found, proceeding to verification', status: 'success' },
      { timestamp: addSeconds(baseTime, 9).toISOString(), step: 'Filling Page 2 verification fields', status: 'success' },
      { timestamp: addSeconds(baseTime, 10).toISOString(), step: 'Submitting verification', status: 'success' },
      { timestamp: addSeconds(baseTime, 11.5).toISOString(), step: 'Download button detected', status: 'success' },
      { timestamp: addSeconds(baseTime, 12).toISOString(), step: 'Downloading PDF file', status: 'success' },
      {
        timestamp: addSeconds(baseTime, 13).toISOString(),
        step: resultType === 'FULL' ? 'Full report downloaded successfully' : 'Face page downloaded successfully',
        status: 'success'
      }
    );
  }

  return steps;
}

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}
```

### Mock Events

```typescript
export const mockEvents: JobEvent[] = [
  {
    _id: 'event_001',
    jobId: 'job_001',
    eventType: 'job_created',
    message: 'Request submitted',
    isUserFacing: true,
    timestamp: hoursAgo(2),
  },
  {
    _id: 'event_002',
    jobId: 'job_002',
    eventType: 'job_created',
    message: 'Request submitted',
    isUserFacing: true,
    timestamp: hoursAgo(4),
  },
  {
    _id: 'event_003',
    jobId: 'job_002',
    eventType: 'status_change',
    message: "We're contacting CHP about your report",
    isUserFacing: true,
    timestamp: hoursAgo(1),
  },
  // ... more events for each job
];
```

---

## 27. Backend Integration Checklist

### Convex Queries

| Query | Args | Returns | Use Case |
|-------|------|---------|----------|
| `getJobsByLawFirm` | `{ lawFirmId }` | `Job[]` | Law firm dashboard |
| `getJobById` | `{ jobId }` | `Job \| null` | Job detail pages |
| `getAllJobsForStaff` | None | `Job[]` | Staff queue |
| `getEventsByJobId` | `{ jobId }` | `JobEvent[]` | All events (staff) |
| `getUserFacingEvents` | `{ jobId }` | `JobEvent[]` | Chat timeline (law firm) |

### Convex Mutations

| Mutation | Args | Effect | Use Case |
|----------|------|--------|----------|
| `createJob` | `{ clientName, reportNumber, ... }` | Creates job + initial event | New request form |
| `updatePageOne` | `{ jobId, crashDate, crashTime, officerId }` | Updates Page 1 fields | Staff Page 1 form |
| `updatePageTwo` | `{ jobId, firstName, lastName, ... }` | Updates Page 2 fields | Staff Page 2 form |
| `updateStatus` | `{ jobId, internalStatus }` | Changes status | Various actions |
| `triggerChpWrapper` | `{ jobId }` | Starts wrapper + schedules action | Run Wrapper button |
| `escalateJob` | `{ jobId, escalationNotes }` | Escalates to manual | Escalation form |
| `completeManually` | `{ jobId, fileToken, notes }` | Marks complete | Manual completion |

### Convex Actions

| Action | Args | Effect | Use Case |
|--------|------|--------|----------|
| `executeWrapper` | `{ jobId }` | Calls Fly.io, updates result | CHP automation |
| `checkFullReport` | `{ jobId }` | Auto-checker run | Auto-checker button |
| `startVapiCall` | `{ jobId }` | Initiates VAPI call | AI Caller (V3) |
| `processVapiResult` | `{ jobId, ... }` | Handles webhook result | VAPI callback (V3) |

### HTTP Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vapi/chp-tool` | POST | VAPI tool webhook (V3) |
| `/api/storage/download` | GET | Proxy file downloads |

### Integration Order

1. **Week 3, Day 1: Schema & Basic Queries**
   - [ ] Deploy schema to Convex
   - [ ] Implement getJobsByLawFirm
   - [ ] Implement getJobById
   - [ ] Implement getAllJobsForStaff
   - [ ] Connect law firm dashboard

2. **Week 3, Day 2: Mutations**
   - [ ] Implement createJob
   - [ ] Implement updatePageOne
   - [ ] Implement updatePageTwo
   - [ ] Connect new request form
   - [ ] Connect staff forms

3. **Week 3, Day 3-4: CHP Wrapper**
   - [ ] Deploy wrapper to Fly.io
   - [ ] Implement triggerChpWrapper mutation
   - [ ] Implement executeWrapper action
   - [ ] Connect Run Wrapper button
   - [ ] Test all result types

4. **Week 3, Day 5: File Storage**
   - [ ] Implement generateUploadUrl
   - [ ] Implement file download
   - [ ] Connect upload in Manual Completion
   - [ ] Connect download buttons

5. **Week 3, Day 6: Events & Polish**
   - [ ] Implement event queries
   - [ ] Connect chat timeline
   - [ ] Add real-time indicators
   - [ ] Test full flows

---

## Related Documents

For a complete understanding of the InstaTCR project, refer to these companion documents:

- **INSTATCR-MASTER-PRD.md** - Complete product requirements document (Parts 1-5)
- **CLAUDE.md** - Quick reference guide for AI assistants
- **PLAIN-ENGLISH-RESTART-GUIDE.md** - Plain English guide for restarting
- **CHP-WRAPPER-INTEGRATION-SUMMARY.md** - Browser automation details
- **vapi-spec.md** - VAPI AI Caller specifications

---

## Document Footer

---

**Document:** InstaTCR Implementation Guide (Parts 6-9)
**Version:** 2.0
**Created:** December 10, 2025
**Last Updated:** December 11, 2025
**Status:** Complete Technical Reference

**Source:** Extracted from INSTATCR-MASTER-PRD.md (lines 2926-5275)

**Consolidated From:**
- Part 6: Frontend-First Development (V1) + Backend Integration (V2)
- Part 7: Future Integrations (VAPI AI Caller V3, Open Router API V4+)
- Part 8: Technical Reference (Validation, Responsive Design, Accessibility)
- Part 9: Appendices (Quick Reference, Mock Data, Backend Integration)

**Maintained by:** InstaTCR Development Team

**How to Use This Document:**
1. Use Table of Contents for quick navigation
2. Reference validation rules for form implementation
3. Follow responsive design guidelines for all layouts
4. Apply accessibility standards for WCAG 2.1 AA/AAA compliance
5. Use testing checklist to verify all features
6. Refer to mock data instructions for V1 implementation
7. Follow integration checklist for V2 backend work

---
