# InstaTCR - Quick Reference for AI Assistants

## What is InstaTCR?
InstaTCR is a web application that helps personal injury law firms request, track, and obtain California Highway Patrol (CHP) crash reports. It automates the process of searching CHP portals and downloading reports through browser automation.

## Current Phase: V1 MVP (Frontend + Mock Data Only)
- **Duration:** 13 days
- **Goal:** Complete, polished frontend with realistic mock data
- **No backend:** All data is mocked, wrapper execution simulated (8-13 seconds)
- **Deliverables:** All 6 screens functional, mobile-first responsive design, complete component library

## 🚨 THE CRITICAL RULE 🚨
**Law firms NEVER see technical details about automation, portals, robots, or manual processes.**

### Two User Types
1. **Law Firms (Public)** - See friendly messages like "We're contacting CHP about your report"
2. **Staff (Internal)** - See all technical details, internal statuses, automation errors, journey logs

## Tech Stack (V1)
- **Frontend:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS
- **Deployment:** Vercel
- **Data:** Mock data in `src/lib/mockData.ts`
- **No backend dependencies in V1**

## Key Technical Specs
- **Mobile-first:** 375px minimum width
- **Main breakpoint:** 768px (mobile ↔ desktop)
- **Touch targets:** ≥ 44px (WCAG 2.1 AAA)
- **Mobile input font-size:** 16px (prevents iOS zoom)
- **Desktop input font-size:** 14px
- **Mobile button height:** 48px
- **Desktop button height:** 40px

## File Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── law/
│   │   ├── page.tsx                # Law firm dashboard
│   │   └── jobs/
│   │       ├── new/page.tsx        # New request form
│   │       └── [jobId]/page.tsx    # Job detail (chat view)
│   └── staff/
│       ├── page.tsx                # Staff queue
│       └── jobs/[jobId]/page.tsx   # Staff job detail
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FloatingActionButton.tsx
│   │   ├── TabBar.tsx
│   │   └── MobileJobCard.tsx
│   └── layout/
│       ├── MobileNav.tsx
│       └── MobileDrawer.tsx
└── lib/
    ├── mockData.ts                 # 15 sample jobs
    ├── statusMapping.ts            # Internal → public conversion
    ├── utils.ts                    # Helper functions
    └── types.ts                    # TypeScript interfaces
```

## Status Mapping Quick Reference

| Internal Status | Public Status | Color | Law Firm Message |
|-----------------|---------------|-------|------------------|
| `NEW` | `SUBMITTED` | Gray | "We've received your request" |
| `CALL_IN_PROGRESS` | `CONTACTING_CHP` | Blue | "We're contacting CHP about your report" |
| `AUTOMATION_RUNNING` | `CONTACTING_CHP` | Blue | "We're contacting CHP about your report" |
| `FACE_PAGE_ONLY` | `FACE_PAGE_READY` | Yellow | "We've received a preliminary copy (face page)" |
| `COMPLETED_FULL_REPORT` | `REPORT_READY` | Green | "Your report is ready to download" |
| `COMPLETED_MANUAL` | `REPORT_READY` | Green | "Your report is ready to download" |
| `NEEDS_MORE_INFO` | `NEEDS_INFO` | Amber | "We need a bit more information" |
| `NEEDS_IN_PERSON_PICKUP` | `IN_PROGRESS` | Blue | "We're working on your request" |
| `AUTOMATION_ERROR` | `IN_PROGRESS` | Blue | "We're working on your request" |

**Full mapping (13 statuses):** See `src/lib/statusMapping.ts`

## Validation Rules Quick Reference

| Field | Format | Example |
|-------|--------|---------|
| Report Number | `9XXX-YYYY-ZZZZZ` | "9465-2025-02802" |
| NCIC | 4 digits, starts with 9 (auto-derived) | "9465" |
| Crash Time | HHMM (24-hour) | "1430" (2:30 PM) |
| Officer ID | 6 digits, starts with 0 | "012345" |
| Crash Date | mm/dd/yyyy, not future | "12/01/2025" |

## Core Business Rules

1. **NCIC Auto-Derivation:** Always first 4 digits of report number
2. **Name Auto-Split:** `"Dora Cruz-Arteaga"` → `{ firstName: "Dora", lastName: "Cruz-Arteaga" }`
3. **Wrapper Prerequisites:** Page 1 complete + at least ONE Page 2 field
4. **Wrapper Results:** FULL (30%), FACE_PAGE (40%), NO_RESULT (15%), ERROR (15%)
5. **Wrapper Timing:** 8-13 seconds (simulated in V1)

## Essential Functions

```typescript
// Convert internal status to public
getPublicStatus(internalStatus: InternalStatus): PublicStatus

// Derive NCIC from report number
deriveNcic(reportNumber: string): string  // First 4 chars

// Split client name
splitClientName(fullName: string): { firstName, lastName }

// Convert date for API
convertDateForApi(htmlDate: string): string  // YYYY-MM-DD → MM/DD/YYYY

// Relative time
formatRelativeTime(timestamp: number): string  // "2 hours ago"
```

## Staff Job Detail Layout

**Mobile (< 768px):** Two tabs
- Tab 1: "Law Firm View"
- Tab 2: "Staff Controls" (7 cards)

**Desktop (≥ 768px):** Split view
- Left column: Law Firm View
- Right column: Staff Controls (7 cards)

### Staff Controls (7 Cards)
1. **Page 1 Data** - Call CHP button, crash details
2. **Page 2 Verification** - Driver name, plate, license, VIN
3. **CHP Wrapper** - Prerequisites, Run button, results
4. **Wrapper History** - All previous runs
5. **Auto-Checker** - Check if full report ready (unlocked when has face page + name)
6. **Escalation** - Escalate to manual pickup
7. **Manual Completion** - Upload face page or full report

## Development Commands (After Setup)

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint
npm run lint
```

## Component Sizing Reference

```typescript
// Mobile (< 768px)
button: "h-12 text-base"     // 48px height, 16px font
input: "h-12 text-base"      // 48px height, 16px font

// Desktop (≥ 768px)
button: "md:h-10 md:text-sm" // 40px height, 14px font
input: "md:h-10 md:text-sm"  // 40px height, 14px font
```

## Hide/Show Based on Breakpoint

```typescript
className="md:hidden"              // Show on mobile, hide on desktop
className="hidden md:block"        // Hide on mobile, show on desktop
className="md:grid md:grid-cols-2" // Desktop: 2 columns
```

## Remember
- Start mobile-first (375px)
- Test at 768px breakpoint
- No backend in V1 (all mock data)
- Law firms never see internal statuses
- NCIC always auto-derived from report number

## Full Documentation
See **INSTATCR-MASTER-PRD.md** (4800+ lines) for complete specifications, user flows, component details, and implementation strategy.
