# InstaTCR Development Roadmap

A detailed development roadmap for InstaTCR, following a phased frontend-first approach.

---

## Version Overview

| Version | Focus | Duration | Status |
|---------|-------|----------|--------|
| **V1** | MVP Frontend | 13 days | 🟡 In Progress |
| **V2** | Backend Integration | 6 days | ⚪ Not Started |
| **V3** | VAPI AI Caller | TBD | ⚪ Not Started |
| **V4** | Open Router AI | TBD | ⚪ Not Started |

---

## V1: MVP Frontend (13 Days)

Complete, polished frontend with mock data. No backend dependencies.

### Why Frontend First?
1. Faster iteration without backend constraints
2. Perfect the UX before locking in API contracts
3. Design review with stakeholders using functional prototype
4. Backend team can work in parallel on infrastructure

---

### Phase 1: Setup & Design System ✅ COMPLETE

**Duration:** 1 day
**Status:** ✅ Complete (December 10, 2025)

**Completed Tasks:**
- [x] Create Next.js 15 project with TypeScript and Tailwind
- [x] Install dependencies (lucide-react, clsx, tailwind-merge)
- [x] Configure design system (colors, typography, animations)
- [x] Create base UI components:
  - [x] `Button.tsx` - 3 variants, 3 sizes
  - [x] `Card.tsx` - With glass effect support
  - [x] `Container.tsx` - Responsive container
  - [x] `Logo.tsx` - Text-based logo
  - [x] `index.ts` - Barrel exports
- [x] Build landing page with:
  - [x] `AnimatedBackground.tsx` - Floating orbs
  - [x] `Hero.tsx` - Main hero section
  - [x] `ValuePropositionCard.tsx` - Feature cards
  - [x] `Footer.tsx` - Page footer

**Deliverable:** Design system ready, landing page complete.

---

### Phase 2: Mock Data System

**Duration:** 1 day
**Status:** ⚪ Not Started

**Tasks:**

1. **Create TypeScript interfaces** (`src/lib/types.ts`)
   - `Job` interface with all fields
   - `JobEvent` interface for timeline events
   - `InternalStatus` type (13 statuses)
   - `PublicStatus` type (7 statuses)
   - `WrapperResult` type

2. **Create sample jobs** (`src/lib/mockData.ts`)
   - 15 sample jobs covering all statuses:
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
   - Multiple law firms
   - Wrapper run history for some jobs

3. **Create utility functions** (`src/lib/utils.ts`)
   - `getPublicStatus()` - Convert internal → public status
   - `formatRelativeTime()` - "2 hours ago" formatting
   - `splitClientName()` - "John Doe" → { firstName, lastName }
   - `deriveNcic()` - Extract first 4 digits from report number
   - `convertDateForApi()` - Date format conversion

4. **Create status mapping** (`src/lib/statusMapping.ts`)
   - Internal to public status conversion
   - Status colors
   - Law firm-facing messages

**Deliverable:** Complete mock data system ready for use.

---

### Phase 3: Law Firm Screens

**Duration:** 3 days
**Status:** ⚪ Not Started

#### Day 1: Landing + Dashboard

| File | Description |
|------|-------------|
| `src/app/page.tsx` | Landing page (already complete) |
| `src/app/law/page.tsx` | Law firm dashboard |
| `src/app/law/layout.tsx` | Law firm layout wrapper |

**Dashboard Features:**
- List of jobs with status badges
- Search/filter functionality
- Mobile: Card list view
- Desktop: Table view with more columns
- FAB for "New Request" on mobile

#### Day 2: New Request Form

| File | Description |
|------|-------------|
| `src/app/law/jobs/new/page.tsx` | New request form |

**Form Features:**
- Client name input (required)
- Report number input (required, validated: `9XXX-YYYY-ZZZZZ`)
- Case reference input (optional)
- Client type dropdown (Driver/Passenger)
- Additional party info textarea (optional)
- Mobile: Sticky header/footer
- Desktop: Centered card
- Form validation with error messages

#### Day 3: Job Detail / Chat View

| File | Description |
|------|-------------|
| `src/app/law/jobs/[jobId]/page.tsx` | Job detail page |

**Chat View Features:**
- Chat-style timeline of events
- Status-specific messages (law firm friendly)
- Download buttons (face page, full report)
- Request more info form (when status = NEEDS_INFO)
- Mobile-optimized message bubbles

**Deliverable:** Complete law firm flow, fully functional with mock data.

---

### Phase 4: Staff Screens

**Duration:** 3 days
**Status:** ⚪ Not Started

#### Day 1: Staff Queue

| File | Description |
|------|-------------|
| `src/app/staff/page.tsx` | Staff job queue |
| `src/app/staff/layout.tsx` | Staff layout wrapper |

**Queue Features:**
- Stats cards (4 metrics):
  - Needs Action
  - In Progress
  - Completed Today
  - Total Active
- Filter tabs (All, Needs Action, In Progress, etc.)
- Mobile: Card list with `MobileJobCard`
- Desktop: Full table with sortable columns
- Internal status badges (staff sees all details)

#### Day 2: Staff Job Detail - Law Firm View Tab

| File | Description |
|------|-------------|
| `src/app/staff/jobs/[jobId]/page.tsx` | Staff job detail |

**Layout:**
- Mobile: TabBar with "Law Firm View" / "Staff Controls"
- Desktop: Split view (left: Law Firm View, right: Staff Controls)

**Law Firm View Tab Components:**
- Client info card
- Chat timeline card (same as law firm sees)
- All events card (full technical history)

#### Day 3: Staff Job Detail - Staff Controls

**7 Staff Control Cards:**

| Card | Purpose |
|------|---------|
| **1. Page 1 Data** | Crash date, time, NCIC, officer ID. "Call CHP" button. AI Caller placeholder. |
| **2. Page 2 Verification** | Driver name, plate, license, VIN. Any ONE field unlocks wrapper. |
| **3. CHP Wrapper** | Prerequisites checklist, "Run Wrapper" button, mock 8-13s execution. |
| **4. Wrapper History** | List of all previous wrapper runs with results. |
| **5. Auto-Checker** | Check if full report ready (unlocked when: face page + name). |
| **6. Escalation** | Escalate to manual in-person pickup. |
| **7. Manual Completion** | Upload face page or full report manually. Mark complete. |

**Deliverable:** Complete staff flow, fully functional with mock data.

---

### Phase 5: Mobile Components

**Duration:** 2 days
**Status:** ⚪ Not Started

#### Day 1: Navigation & Drawers

| Component | Description |
|-----------|-------------|
| `MobileDrawer.tsx` | Slide-out navigation drawer |
| `MobileNav.tsx` | Bottom navigation bar |
| `FloatingActionButton.tsx` | FAB for primary actions |
| `BottomSheet.tsx` | Modal sheet from bottom |

#### Day 2: Cards & Utilities

| Component | Description |
|-----------|-------------|
| `TabBar.tsx` | Tab switching component |
| `StatCard.tsx` | Metric display card |
| `MobileJobCard.tsx` | Job card for mobile lists |
| `useMediaQuery.ts` | Hook for responsive logic |

**Deliverable:** Complete mobile component library.

---

### Phase 6: Polish & Refinement

**Duration:** 3 days
**Status:** ⚪ Not Started

#### Day 1: Testing

- [ ] Test on real devices (iPhone, iPad, Android)
- [ ] Test all breakpoints:
  - 375px (mobile minimum)
  - 768px (tablet/desktop transition)
  - 1024px (desktop)
  - 1920px (large desktop)
- [ ] Verify all touch targets ≥ 44px (WCAG 2.1 AAA)
- [ ] Test all user flows end-to-end

#### Day 2: Animations

- [ ] Page transitions (fade, slide)
- [ ] Card animations (staggered fade-in)
- [ ] Button feedback (scale on press)
- [ ] Loading states (skeletons, spinners)
- [ ] Success/error states (toast notifications)
- [ ] Wrapper execution animation (progress bar)

#### Day 3: Edge Cases

- [ ] Empty states (no jobs, no results)
- [ ] Error states (form validation, network errors)
- [ ] Very long text handling (truncation, tooltips)
- [ ] Accessibility audit:
  - Keyboard navigation
  - Screen reader compatibility
  - Focus indicators
  - Color contrast

**Deliverable:** Polished, production-ready frontend.

---

## V2: Backend Integration (6 Days)

Connect frontend to real Convex database and CHP wrapper service.

### Phase 1: Convex Setup (1 day)

- [ ] Initialize Convex project
- [ ] Define schema (`convex/schema.ts`):
  - `chpJobs` table
  - `jobEvents` table
- [ ] Create queries (list, get by ID, filter)
- [ ] Create mutations (create, update, delete)
- [ ] Deploy to Convex Cloud

### Phase 2: CHP Wrapper Integration (2 days)

- [ ] Deploy CHP Wrapper (Playwright) to Fly.io
- [ ] Create wrapper execution endpoint
- [ ] Connect staff UI to trigger wrapper
- [ ] Handle wrapper results and update job status
- [ ] Implement journey log storage

### Phase 3: File Storage (1 day)

- [ ] Configure Convex Storage for PDFs
- [ ] Implement file upload (manual completion)
- [ ] Implement file download (face page, full report)
- [ ] Handle wrapper-downloaded files

### Phase 4: Auth & Routing (1 day)

- [ ] Implement authentication (Clerk or Auth0)
- [ ] Role-based access control (Law Firm vs Staff)
- [ ] Protected route middleware
- [ ] Law firm ID scoping

### Phase 5: Real-Time Updates (1 day)

- [ ] Convex reactivity for live status changes
- [ ] Optimistic updates for better UX
- [ ] WebSocket fallback handling
- [ ] Connection status indicator

---

## V3: VAPI AI Caller (TBD)

Add AI-powered phone calling to automatically obtain crash time and officer ID from CHP offices.

### Features

- [ ] AI Caller button in Staff Job Detail (Card 1)
- [ ] VAPI assistant integration
- [ ] Office hopping logic (try multiple offices)
- [ ] Call transcription storage
- [ ] Call history tracking in Wrapper History card
- [ ] Webhook endpoint for VAPI tool calls

### UI Preparation (Can be done in V1)

- [ ] Reserve button placement next to "Call CHP"
- [ ] Define button states: Idle → Calling → Success/Failed
- [ ] Design call status display area
- [ ] Plan call history section layout

---

## V4: Open Router AI Features (TBD)

Add AI-powered assistance features.

### Potential Features

- [ ] Chat assistance for law firms
- [ ] Smart document parsing
- [ ] Auto-fill suggestions based on report number
- [ ] Anomaly detection in crash data
- [ ] Batch processing recommendations

---

## Screen Summary

| # | Screen | Route | User | V1 Status |
|---|--------|-------|------|-----------|
| 1 | Landing Page | `/` | Public | ✅ Complete |
| 2 | Law Firm Dashboard | `/law` | Law Firm | ⚪ Not Started |
| 3 | New Request Form | `/law/jobs/new` | Law Firm | ⚪ Not Started |
| 4 | Job Detail (Chat) | `/law/jobs/[jobId]` | Law Firm | ⚪ Not Started |
| 5 | Staff Queue | `/staff` | Staff | ⚪ Not Started |
| 6 | Staff Job Detail | `/staff/jobs/[jobId]` | Staff | ⚪ Not Started |

---

## Key Technical Decisions

### Mobile-First Responsive

- Base styles: 375px minimum width
- Primary breakpoint: 768px
- Touch targets: ≥ 44px
- Input font-size: 16px mobile (prevents iOS zoom)

### Component Architecture

- Server Components by default
- Client Components only when needed (interactivity)
- Shared UI components in `src/components/ui/`
- Feature components in `src/components/{feature}/`

### Status System

- 13 internal statuses (staff sees all)
- 7 public statuses (law firms see simplified)
- Status mapping in `src/lib/statusMapping.ts`
- Color-coded badges for quick scanning

---

## Resources

- **[CLAUDE.md](CLAUDE.md)** - Quick reference for AI assistants
- **[INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md)** - Complete product specifications
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
