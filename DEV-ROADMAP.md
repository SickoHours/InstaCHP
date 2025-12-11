# InstaTCR Development Roadmap

A detailed development roadmap for InstaTCR, following a phased frontend-first approach.

---

## Version Overview

| Version | Focus | Duration | Status |
|---------|-------|----------|--------|
| **V1** | MVP Frontend | 13 days | ✅ Complete (100%) |
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

### Phase 2: Mock Data System ✅ COMPLETE

**Duration:** 1 day
**Status:** ✅ Complete (December 10, 2025)

**Completed Tasks:**

1. **Create TypeScript interfaces** (`src/lib/types.ts`)
   - [x] `Job` interface with all fields
   - [x] `JobEvent` interface for timeline events
   - [x] `InternalStatus` type (13 statuses)
   - [x] `PublicStatus` type (8 statuses)
   - [x] `WrapperResult` type
   - [x] Supporting types: `ClientType`, `StatusColor`, `StatusConfig`

2. **Create sample jobs** (`src/lib/mockData.ts`)
   - [x] 15 sample jobs covering all statuses:
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
     | AUTOMATION_ERROR | 1 | Error state |
     | COMPLETED_MANUAL | 1 | Manual completion |
   - [x] 4 law firms (Martinez, Johnson, Chen, Rivera)
   - [x] Wrapper run history for some jobs
   - [x] Helper functions: `getJobsForLawFirm()`, `getJobById()`, `getJobsByStatus()`

3. **Create utility functions** (`src/lib/utils.ts`)
   - [x] `formatRelativeTime()` - "2 hours ago" formatting
   - [x] `splitClientName()` - "John Doe" → { firstName, lastName }
   - [x] `deriveNcic()` - Extract first 4 digits from report number
   - [x] `convertDateForApi()` / `convertDateForInput()` - Date format conversion
   - [x] `formatCrashTime()` - 1430 → "2:30 PM"
   - [x] `isValidReportNumber()` / `isValidCrashTime()` - Validation helpers

4. **Create status mapping** (`src/lib/statusMapping.ts`)
   - [x] `STATUS_MAP` - Internal to public status conversion
   - [x] `STATUS_COLORS` - Tailwind classes for each color
   - [x] `getPublicStatus()`, `getStatusColor()`, `getStatusMessage()`
   - [x] `formatPublicStatus()` - "REPORT_READY" → "Report Ready"
   - [x] `isCompletedStatus()`, `needsAttention()`, `isActiveStatus()`

**Deliverable:** ✅ Complete mock data system ready for use.

---

### Phase 3: Law Firm Screens ✅ COMPLETE

**Duration:** 3 days
**Status:** ✅ Complete (December 10, 2025)

#### Day 1: Landing + Dashboard ✅ COMPLETE

| File | Description | Status |
|------|-------------|--------|
| `src/app/page.tsx` | Landing page | ✅ Complete |
| `src/app/law/page.tsx` | Law firm dashboard | ✅ Complete |
| `src/app/law/layout.tsx` | Law firm layout wrapper | ✅ Complete |

**Completed Dashboard Features:**
- [x] List of jobs with status badges
- [x] Search/filter functionality (client name, report #, case reference)
- [x] Mobile: Card list view with `MobileJobCard`
- [x] Desktop: 3-column grid layout
- [x] FAB for "New Request" on mobile
- [x] Status summary cards (In Progress / Completed / Need Info)
- [x] Staggered card animations
- [x] Empty state with CTA

**New Components Created:**
- [x] `StatusBadge.tsx` - Status display with semantic colors
- [x] `FloatingActionButton.tsx` - Mobile FAB
- [x] `MobileJobCard.tsx` - Job card for lists

#### Day 2: New Request Form ✅ COMPLETE

| File | Description | Status |
|------|-------------|--------|
| `src/app/law/jobs/new/page.tsx` | New request form | ✅ Complete |
| `src/components/ui/Input.tsx` | Animated input component | ✅ Complete |

**Completed Form Features:**
- [x] Client name input (required, min 2 chars)
- [x] Report number input (required, validated: `9XXX-YYYY-ZZZZZ`)
- [x] Auto-formatting for report number (inserts dashes)
- [x] Mobile: Sticky header with back button, sticky footer with submit
- [x] Desktop: Centered card with Cancel/Submit buttons
- [x] Form validation with inline error messages
- [x] Staggered entrance animations
- [x] Floating label inputs with focus animations
- [x] Validation checkmark pop animation
- [x] Submit button states: Loading spinner → Success shimmer
- [x] Navigation to job detail after success

**Note:** Per PRD, form only collects Client Name and Report Number. Client type and crash details are collected later via chat interface or by staff.

#### Day 3: Job Detail / Chat View ✅ COMPLETE

| File | Description | Status |
|------|-------------|--------|
| `src/app/law/jobs/[jobId]/page.tsx` | Job detail page | ✅ Complete |
| `src/components/ui/TimelineMessage.tsx` | Timeline message component | ✅ Complete |

**Completed Features:**
- [x] **Dark mode aesthetic** with gradient background and floating orbs
- [x] Glass-morphism cards with backdrop blur
- [x] Chat-style timeline of user-facing events
- [x] Status-specific messages (law firm friendly, no technical details)
- [x] Glowing status badges with pulse animation for active states
- [x] Download buttons (face page, full report) with hover glow effects
- [x] Staggered cascade animations for timeline messages
- [x] Page entrance animation with blur reduction
- [x] Mobile-optimized with sticky header
- [x] Auto-scroll to latest message
- [x] Mock job events added to `mockData.ts`

**New Animations Added to `globals.css`:**
- [x] `pageEntrance` - Fade up with blur reduction
- [x] `messageCascade` - Staggered timeline messages
- [x] `glowPulse` - Status badge glow
- [x] `subtleGlow` - Interactive element glow
- [x] `lineGlow` - Timeline connector animation
- [x] `dotPulse` - Timeline node pulse
- [x] `textReveal` - Smooth text entrance
- [x] `glass-card-dark` - Dark glass-morphism utility

**Deliverable:** ✅ Complete law firm flow, fully functional with mock data.

---

### Phase 4: Staff Screens ✅ COMPLETE

**Duration:** 3 days
**Status:** ✅ Complete (December 11, 2025)

#### Day 1: Staff Queue ✅ COMPLETE

| File | Description | Status |
|------|-------------|--------|
| `src/app/staff/page.tsx` | Staff job queue | ✅ Complete |
| `src/app/staff/layout.tsx` | Staff layout wrapper | ✅ Complete |

**Completed Queue Features:**
- [x] **Dark mode aesthetic** with gradient background and floating orbs
- [x] Stats cards (4 metrics) with count-up animation:
  - Total Jobs (slate)
  - Needs Action (amber)
  - In Progress (blue)
  - Completed (green)
- [x] Click stat card to filter by category
- [x] Filter tabs (All, Needs Action, In Progress, Completed, Cancelled)
- [x] Tab indicator with teal glow animation
- [x] Mobile: StaffJobCard list with cascade animations
- [x] Desktop: Full data table with hover effects
- [x] Internal + Public status badges side by side
- [x] Refresh button with spin animation
- [x] Staggered row animations

**New Components Created:**
- [x] `StatCard.tsx` - Metric display with glass-morphism and count-up
- [x] `TabBar.tsx` - Horizontal tabs with glowing indicator
- [x] `StaffJobCard.tsx` - Job card showing both statuses

#### Day 2-3: Staff Job Detail ✅ COMPLETE

| File | Description | Status |
|------|-------------|--------|
| `src/app/staff/jobs/[jobId]/page.tsx` | Staff job detail | ✅ Complete |

**Completed Layout:**
- [x] Mobile: TabBar with "Law Firm View" / "Staff Controls"
- [x] Desktop: Split view (left: Law Firm View, right: Staff Controls)

**Law Firm View Panel (Completed):**
- [x] Client info header with public status badge
- [x] Current status card with user-friendly message
- [x] Chat timeline card (same as law firm sees)
- [x] All events card (full technical history)
- [x] Download section for available documents

**7 Staff Control Cards (All Completed):**

| Card | Purpose | Status |
|------|---------|--------|
| **1. Page 1 Data** | Call CHP button, AI Caller (V3 disabled), NCIC (auto), crash date/time, officer ID | ✅ |
| **2. Page 2 Verification** | Auto-split name, plate, license, VIN. Filled count indicator. | ✅ |
| **3. CHP Wrapper** | Prerequisites checklist, "Run Wrapper" button, 8-13s mock execution, journey log | ✅ |
| **4. Wrapper History** | Color-coded results, timestamps, duration, download buttons | ✅ |
| **5. Auto-Checker** | Lock/unlock UI, conditions display, 3-5s mock check | ✅ |
| **6. Escalation** | Confirmation dialog with notes textarea | ✅ |
| **7. Manual Completion** | Radio selection (Face/Full), upload simulation, mark complete | ✅ |

**Mock Handlers Implemented:**
- [x] Wrapper execution (FULL 30%, FACE_PAGE 40%, NO_RESULT 15%, ERROR 15%)
- [x] Auto-checker (20% success rate)
- [x] Call CHP → CALL_IN_PROGRESS
- [x] Escalation → NEEDS_IN_PERSON_PICKUP
- [x] Manual completion → COMPLETED_MANUAL

**Deliverable:** ✅ Complete staff flow, fully functional with mock data.

---

### Phase 5: Mobile Components ✅ COMPLETE

**Duration:** 2 days
**Status:** ✅ Complete (December 11, 2025)

#### Day 1: Navigation & Drawers ✅ COMPLETE

| Component | Description | Status |
|-----------|-------------|--------|
| `MobileDrawer.tsx` | Slide-out navigation drawer | ✅ Complete |
| `MobileNav.tsx` | Bottom navigation bar | ✅ Complete |
| `FloatingActionButton.tsx` | FAB for primary actions | ✅ Complete |
| `BottomSheet.tsx` | Modal sheet from bottom | ✅ Complete |

#### Day 2: Cards & Utilities ✅ COMPLETE

| Component | Description | Status |
|-----------|-------------|--------|
| `TabBar.tsx` | Tab switching component | ✅ Complete |
| `StatCard.tsx` | Metric display card | ✅ Complete |
| `StaffJobCard.tsx` | Staff job card with dual status | ✅ Complete |
| `MobileJobCard.tsx` | Job card for mobile lists | ✅ Complete |
| `StatusBadge.tsx` | Status display badge | ✅ Complete |
| `Input.tsx` | Animated input with floating label | ✅ Complete |
| `TimelineMessage.tsx` | Chat timeline message bubble | ✅ Complete |
| `useMediaQuery.ts` | Hook for responsive logic | ✅ Complete |

**Additional Components Created:**
- `ConfirmSheet` - Pre-built confirmation dialog
- `ActionSheet` - Pre-built action menu
- `NavigationDrawer` - Pre-built navigation drawer
- Multiple preset hooks: `useIsMobile`, `useIsDesktop`, `usePrefersReducedMotion`, etc.

**Deliverable:** ✅ Complete mobile component library.

---

### Phase 6: Polish & Refinement ✅ COMPLETE

**Duration:** 3 days
**Status:** ✅ Complete (December 11, 2025)

#### Dark Mode Implementation ✅ COMPLETE

**Law Firm Pages Dark Mode:**
- [x] Law Firm Dashboard (`/law`) - Full dark mode with animated orbs, glass-morphism cards
- [x] New Request Form (`/law/jobs/new`) - Dark form card, dark inputs, dark footer
- [x] `StatusBadge` component - Added `theme="dark"` prop with pulse animations
- [x] `Input` component - Added `theme="dark"` prop with teal/emerald glow effects
- [x] `MobileJobCard` component - Added `variant="dark"` prop with glass styling
- [x] `statusMapping.ts` - Added `DARK_STATUS_COLORS` with translucent backgrounds
- [x] `globals.css` - Added dark utility classes (stat-card-dark, search-input-dark, form-card-dark, job-card-dark, mobile-footer-dark)

#### Loading States ✅ COMPLETE

- [x] Skeleton loading system with composable primitives:
  - `SkeletonBase` - Base shimmer element
  - `SkeletonText` - Text placeholder with multi-line support
  - `SkeletonCard` - Card container
  - `JobCardSkeleton` - Mobile and table-row variants
  - `StatCardSkeleton` - Dashboard stat cards
  - `TimelineItemSkeleton` - Timeline message skeletons
- [x] Integrated loading states into Law Firm Dashboard
- [x] Integrated loading states into Staff Queue

#### Toast Notification System ✅ COMPLETE

- [x] `ToastContext` with `useToast` hook
- [x] Toast component with glass-morphism styling
- [x] ToastContainer with responsive positioning
- [x] Support for success, error, warning, info types
- [x] Auto-dismiss with progress bar
- [x] Form submission error/success feedback
- [x] Staff action toast notifications (wrapper, upload, escalate)

#### Accessibility ✅ COMPLETE

- [x] TabBar keyboard navigation (Arrow keys, Home, End)
- [x] ARIA attributes for tabs (role="tablist", role="tab", aria-selected)
- [x] Focus trapping in BottomSheet and MobileDrawer (focus-trap-react)
- [x] Skip navigation link for keyboard users
- [x] Color contrast fixes - Updated status badge text from 300 to 200 level for WCAG AA compliance
- [x] Focus-visible styling on interactive elements

#### Error & Edge Cases ✅ COMPLETE

- [x] Empty states (no jobs, no results) - Dark styled empty state
- [x] Error state components:
  - `ErrorState` - Base error display
  - `NetworkError` - Offline/connection errors
  - `NotFoundError` - 404 states
  - `ServerError` - Server error display
- [x] Form validation error handling with toast
- [x] API error banner in new request form

#### Text Handling ✅ COMPLETE

- [x] `Tooltip` component - Hover/focus tooltips with positioning
- [x] `TruncatedText` component - Text truncation with tooltip on overflow
- [x] Line clamp support (1-3 lines)

#### Animations ✅ COMPLETE

- [x] Page transitions (fade, slide) - `animate-page-entrance`, `animate-text-reveal`
- [x] Card animations (staggered fade-in) - `animate-card-entrance` with delays
- [x] Button feedback (scale on press) - `active:scale-98`, `hover:scale-102`
- [x] Loading states (skeletons with shimmer and pulse)
- [x] Toast enter/exit animations
- [x] Tooltip enter animation
- [x] Wrapper execution animation (progress bar)

**Deliverable:** ✅ Polished, production-ready frontend complete.

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
| 2 | Law Firm Dashboard | `/law` | Law Firm | ✅ Complete |
| 3 | New Request Form | `/law/jobs/new` | Law Firm | ✅ Complete |
| 4 | Job Detail (Chat) | `/law/jobs/[jobId]` | Law Firm | ✅ Complete |
| 5 | Staff Queue | `/staff` | Staff | ✅ Complete |
| 6 | Staff Job Detail | `/staff/jobs/[jobId]` | Staff | ✅ Complete |

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
