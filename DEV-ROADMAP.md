# InstaTCR Development Roadmap

A detailed development roadmap for InstaTCR, following a phased frontend-first approach.

---

## Version Overview

| Version | Focus | Duration | Status |
|---------|-------|----------|--------|
| **V1** | MVP Frontend | 13 days + enhancements | ✅ Complete (V1.6.5 - QA Validated) |
| **V2** | Backend Integration | 6 days | ⚪ Not Started |
| **V3** | VAPI AI Caller | TBD | ⚪ Not Started |
| **V4** | Open Router AI | TBD | ⚪ Not Started |

**Current Version:** V1.6.5 (December 12, 2025)

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

### Post-Phase 6: Continued Enhancements ✅ COMPLETE

**Status:** ✅ Complete (V1.0.5 - V1.6.0)

After Phase 6 completion, additional enhancements were made to improve user experience and streamline workflows.

#### V1.0.5: Frontend Polish Features ✅ COMPLETE

- [x] **Dynamic Job Creation** - MockDataManager for in-memory CRUD operations
- [x] **MockDataContext** - React Context for global state management
- [x] **Interactive Timeline** - Driver/Passenger selection in timeline
- [x] **DriverPassengerChoice** - Two-button selection component
- [x] **PassengerMiniForm** - Compact form for passenger data (plate, license, VIN)
- [x] **Staff Quick-Fill Buttons** - Copy passenger data to Card 2
- [x] **CHPNudge** - Dismissible info card encouraging CHP call
- [x] **Escalation Conditional** - Card 6 hidden when reports obtained
- [x] **Manual Completion Labels** - Updated to "First Name *" clarity

#### V1.0.6: Enhanced Flow & Auto-Wrapper ✅ COMPLETE

- [x] **Status System Updates** - NEW jobs start as NEEDS_CALL
- [x] **Card Visibility Logic** - Cards 6 & 7 hidden when reports exist
- [x] **Passenger Flow Enhancements** - Skip option with warning nudge
- [x] **Page1DetailsCard** - Crash details prompt (date, time, officer badge)
- [x] **Page1DataCard** - Editable crash details card
- [x] **Page2DataCard** - Editable driver info card
- [x] **Law Firm Auto-Wrapper** - Automatic wrapper trigger when prerequisites met
- [x] **Timeline Message Hygiene** - New event types with icons/colors

#### V1.0.7: Simplified Law Firm Job View ✅ COMPLETE

- [x] **InlineFieldsCard** - NEW unified form combining Page 1 + Page 2 fields
  - Always-visible fields (no edit mode)
  - Single "Save & Check for Report" button
  - HHMM time validation (4-digit 24-hour format)
- [x] **Flow Gate Implementation** - Driver/Passenger selection REQUIRED first
  - Prominent selection at top of page
  - Form fields visible but disabled until selection made
  - PassengerMiniForm embedded in gate for passengers
- [x] **Unified Save Handler** - Single `handleSaveAllFields` replaces separate handlers
  - Atomic updates for all fields
  - Auto-wrapper prerequisites: Page 1 complete + ≥1 Page 2 field
- [x] **Simplified Timeline** - Read-only event display
  - Removed all interactive rendering branches
  - No embedded forms or chat-style interactions
  - Simple loop showing all events
- [x] **Time Validation Utility** - `formatHHMMTime()` for HHMM display
- [x] **Deprecated Components** - Page1DataCard, Page2DataCard, Page1DetailsCard marked @deprecated

**Key Changes in V1.0.7:**
| Before | After |
|--------|-------|
| Separate Page1DataCard + Page2DataCard | Single InlineFieldsCard |
| Edit/display toggle mode | Always-visible fields |
| Interactive timeline with embedded forms | Read-only timeline |
| HTML time picker | 4-digit HHMM text input |
| Form accessible without selection | Flow gate requires driver/passenger first |

**Deliverable:** ✅ Streamlined law firm experience with flow gating and unified forms.

#### V1.1.0: Redesigned Driver/Passenger Flow ✅ COMPLETE

- [x] **FlowWizard** - Step-by-step orchestrator for law firm flow
  - Selection → Verification → SpeedUp → CrashDetails → Done
- [x] **SpeedUpPrompt** - Binary yes/no choice for sharing crash details
- [x] **CrashDetailsForm** - Focused crash details form (date, time, officer)
- [x] **PassengerVerificationForm** - Enhanced form with repeatable names
- [x] **Type System Updates** - FlowStep, PassengerVerificationData, InteractiveState extensions
- [x] **Timeline Events** - 6 new event types for flow wizard tracking

**Key Changes in V1.1.0:**
| Before | After |
|--------|-------|
| Overlapping forms | Linear step-by-step wizard |
| Confusing parallel paths | Clean skip at every step |
| Required fields | All fields optional |

#### V1.2.0: Conditional Rescue Flow ✅ COMPLETE

- [x] **DriverInfoRescueForm** - Rescue form for Page 2 verification failures
  - Plate, Driver's License, VIN fields
  - Repeatable additional names UI
  - Auto-triggers wrapper re-run on submission
- [x] **WrapperResult Types** - 5 distinct result types for failure differentiation
  - `FULL`, `FACE_PAGE`, `PAGE1_NOT_FOUND`, `PAGE2_VERIFICATION_FAILED`, `PORTAL_ERROR`
- [x] **ReportTypeHint** - Face Page vs Full Report hint even when verification fails
- [x] **CrashDetailsForm Update** - "Save & Check for Report" button triggers wrapper immediately
- [x] **Conditional Form Visibility**
  - Rescue form ONLY for `PAGE2_VERIFICATION_FAILED`
  - InlineFieldsCard ONLY for `PAGE1_NOT_FOUND` corrections
- [x] **Timeline Events** - 4 new event types for rescue flow

**Key Changes in V1.2.0:**
| Before | After |
|--------|-------|
| Single wrapper result types | 5 distinct failure modes |
| No recovery for Page 2 failures | Rescue form for additional identifiers |
| Unknown report type on failure | reportTypeHint preserved |
| "Continue" button | "Save & Check for Report" (triggers wrapper) |

**Deliverable:** ✅ Complete rescue flow with conditional form visibility and reportTypeHint.

#### V1.3.0: Soft-Dismiss Decline Behavior ✅ COMPLETE

- [x] **CollapsedHelperCTA** - Compact CTA shown after "No thanks" decline
- [x] **ContactingCHPBanner** - Amber notification for passenger flow during CONTACTING_CHP
- [x] **Soft-Dismiss Pattern** - "No thanks" collapses to compact CTA instead of hiding
- [x] **Re-Expand Functionality** - Users can re-access helpers after decline
- [x] **Type System Updates** - `InteractiveState` extended with collapse/decline tracking
- [x] **Timeline Events** - 4 new event types for decline/reopen tracking
- [x] **Component Updates** - SpeedUpPrompt, PassengerVerificationForm, CrashDetailsForm support `onCollapse`

**Deliverable:** ✅ Complete soft-dismiss pattern with re-access capability.

#### V1.4.0: Auto-Checker Improvements & Law Firm Check Button ✅ COMPLETE

- [x] **Conditional Auto-Checker Visibility** - Card 5 hidden when `fullReportToken` exists
- [x] **Law Firm Manual Check Button** - "Check if Full Report Ready" button for face page jobs
- [x] **Auto-Checker Frequency Controls** - Per-job frequency settings (V1: UI + mock, V2: actual scheduling)
- [x] **Type System Updates** - `AutoCheckSettings` interface with frequency, scheduled times
- [x] **Timeline Events** - 4 new event types for auto-checker actions
- [x] **Mock Data Updates** - 3 face page jobs with autoCheckSettings

**Deliverable:** ✅ Complete auto-checker improvements with law firm manual check capability.

#### V1.5.0: Completed State UI Cleanup ✅ COMPLETE

- [x] **JobSummaryCard (Staff)** - Clean read-only info card for completed/cancelled jobs
  - Report Details (report #, NCIC, crash date/time, officer ID)
  - Verification Data (client name, type, plate, DL, VIN - filled fields only)
  - Completion Info with status badge (Automated/Manual/Cancelled)
  - "Run Wrapper" button for re-runs (completed only, NOT cancelled)
- [x] **InfoRow Component** - Read-only display with copy-to-clipboard functionality
- [x] **Cards 1-4 Hidden** - Staff control cards completely hidden when job closed
- [x] **Completed Downloads Section (Law Firm)** - Prominent green success card promoted to top
- [x] **Cancelled Notice Card (Law Firm)** - Slate "Request Cancelled" card with helpful message
- [x] **Timeline Collapsibility** - Hidden by default for closed jobs with "Show timeline" toggle
- [x] **Current Status Card Hidden** - Law firm side removes redundant status card
- [x] **Differential Styling** - Green accent for completed, slate/gray for cancelled

**Key UX Improvements:**
- Staff side: Replaced 4 verbose control cards with single clean summary card
- Law firm side: Promoted downloads to top, collapsed timeline by default
- Differential treatment: Completed (green, Run Wrapper button) vs Cancelled (gray, no button)
- Re-run capability: Staff can re-run wrapper on completed jobs

**Deliverable:** ✅ Complete closed-state UI cleanup for both staff and law firm views.

#### V1.6.0: Manual Pickup Workflow & Fatal Reports ✅ COMPLETE

- [x] **Face Page Completion Options** - Law firms choose to complete with face page or wait for full report
  - `FacePageCompletionChoice` component - Two-button choice card
  - New status: `COMPLETED_FACE_PAGE_ONLY` → maps to `REPORT_READY`
  - "Change My Mind" feature with `FacePageReopenBanner` - Re-check for full report after completion
- [x] **Auto-Escalation Logic** - Auto-escalate when Page 2 verification fields exhausted
  - Track which Page 2 fields tried in each wrapper run
  - `page2FieldsTried` and `page2FieldResults` in `WrapperRun`
  - Aggregate across all runs to determine exhaustion
  - New `escalationReason`: 'manual' | 'auto_exhausted' | 'fatal_report'
- [x] **Manual Pickup Escalation Workflow** - Complete in-person pickup workflow
  - `EscalationData` state machine: pending_authorization → authorization_received → claimed → pickup_scheduled → completed
  - `AuthorizationUploadCard` component - Law firm uploads auth document (friendly messaging)
  - `PickupScheduler` component - Staff scheduling with quick time buttons
  - `/staff/escalations` page - Escalation queue for staff
  - Business day scheduling (Mon-Fri only)
  - Authorization document download for staff
- [x] **Fatal Reports Handling** - Separate submission flow for fatal crashes
  - `/law/jobs/new-fatal` page - Fatal report form
  - Death certificate upload (conditional on clientWasDeceased)
  - Authorization document upload (required for all fatal reports)
  - Auto-escalation on submission (skips wrapper entirely)
  - `FatalDetails` interface tracking
- [x] **Friendly Law Firm Messaging** - CRITICAL: No technical jargon visible to law firms
  - "We need your help" NOT "Escalation required"
  - "Upload an authorization document" NOT "In-person pickup needed"
  - "A team member is working on your request" NOT "Pickup claimed"
- [x] **Staff Link Click → Auto-Notify** - Claiming pickup auto-notifies law firm
- [x] **Pickup Scheduling UX** - Quick time buttons (9am, afternoon, 4pm) + date picker
- [x] **Type System Updates** - ~80 lines of new types
  - `EscalationData` interface (status, timestamps, auth, pickup details)
  - `FatalDetails` interface (clientWasDeceased, deathCertificateToken)
  - `EscalationStatus` type (5 states)
  - `PickupTimeSlot` type ('9am' | 'afternoon' | '4pm')
  - `EscalationReason` type
  - Extended `Job` interface with isFatal, fatalDetails, escalationData
  - Extended `WrapperRun` with page2FieldsTried, page2FieldResults
  - 13 new `EventType` values for escalation and fatal flows
- [x] **Mock Data Updates** - 4 new sample jobs covering:
  - Face page with law firm completing early
  - Auto-escalated job (exhausted Page 2 fields)
  - Fatal report with deceased client
  - Fatal report with surviving client
- [x] **Component Library** - 4 new components created (~400 lines)
- [x] **Timeline Events** - 13 new event types for escalation and fatal workflows

**Key UX Improvements:**
- Law firms get friendly, non-technical guidance for manual pickup cases
- Staff have dedicated escalation queue with clear workflow states
- Fatal reports streamlined with upfront authorization upload
- Face page completion flexibility (complete early or wait for full)
- Auto-escalation prevents dead-end scenarios

**Deliverable:** ✅ Complete manual pickup workflow with fatal reports support and friendly law firm messaging.

#### V1.6.1: Development/Testing Environment ✅ COMPLETE

- [x] **DEV_MODE Configuration System** - `src/lib/devConfig.ts` centralized dev mode settings
  - Skip file upload validation in development
  - Configurable delays (wrapper: 2s dev vs 8-13s prod, auto-check: 1.5s dev vs 3-5s prod)
  - Force testing flags for wrapper results and auto-check outcomes
  - `getDelay()` helper for consistent timing throughout app
- [x] **Fatal Report Dev Mode** - Skip upload buttons for authorization and death certificate testing
- [x] **Authorization Upload Integration** - FIXED: Handler missing from V1.6.0 implementation
  - `handleAuthorizationUpload()` now integrated into law firm job detail page
  - Updates escalation status to 'authorization_received'
  - Generates mock token and timeline event
- [x] **Pickup Scheduler Integration** - FIXED: Handlers missing from V1.6.0 implementation
  - `handleClaimPickup()` and `handleSchedulePickup()` now integrated into staff job detail
  - Complete state management for claiming and scheduling workflows
  - `handleDownloadAuth()` for authorization document download
- [x] **Dev Testing Jobs** - 5 new sample jobs for testing all workflows (28 total jobs now)
  - `job_dev_001` through `job_dev_005` covering auth upload, pickup scheduling, face page choices, reopen workflow
- [x] **Dev Mode Visual Indicator** - Fixed bottom-left amber badge showing "DEV MODE"
- [x] **Consistent Delay Usage** - All async operations now use `getDelay()` helper

**Key Benefits:**
- Fatal report submission testable without PDF uploads (dev mode)
- Authorization upload flow fully testable with skip button
- Pickup claiming/scheduling workflow end-to-end testable
- 75% faster testing iteration (2s wrapper vs 8-13s)
- All V1.6.0 flows now fully functional (fixed missing handlers)

**Deliverable:** ✅ Complete development environment with fast testing iteration and V1.6.0 completion fixes.

#### V1.6.2: Front-End Finalization ✅ COMPLETE

**Pre-Backend Integration Audit:**
Comprehensive front-end validation to ensure 100% production-readiness before V2 backend work.

**Audit Coverage:**
- [x] **Build Verification** - `npm run build` (9 routes compiled successfully)
- [x] **Type Safety** - `npm run type-check` (0 TypeScript errors)
- [x] **Code Quality** - `npm run lint` (40 issues identified and fixed)
- [x] **Spec Alignment** - All 8 routes verified against PRD specifications
- [x] **Status Mapping** - Verified all law firm pages use `getPublicStatus()` correctly
- [x] **Form Validation** - Confirmed 2-field new request form, proper format rules
- [x] **Edge States** - Verified empty, loading, error states implemented
- [x] **Mobile Responsiveness** - Confirmed 375px minimum, 768px+ breakpoints, 44px+ touch targets

**Code Quality Improvements:**
- [x] **Unused Imports Cleanup** - Removed 14 unused imports across 10 files
- [x] **JSX Text Encoding** - Fixed 11 unescaped apostrophes/quotes in JSX
- [x] **Type Safety** - Removed 2 `as any` type assertions, added proper `InternalStatus` types
- [x] **React Hooks** - Moved `Date.now()` out of render, added proper eslint comments for valid SSR patterns
- [x] **Documentation** - Added explanatory comments for 5 intentional patterns (SSR hydration, media query sync)

**Results:**
- Lint errors: 20 → 0 (100% resolved)
- Lint warnings: 20 → 1 (95% resolved, 1 intentional `_file` parameter)
- Total lint issues: 40 → 1 (97.5% improvement)
- Build: ✅ PASS
- TypeScript: ✅ PASS
- Front-End Status: **100% Finalized and Production-Ready**

**Files Modified:** 14 files (~50 lines cleaned up)

**Deliverable:** ✅ Front-end fully validated, cleaned, and ready for V2 backend integration.

#### V1.6.5: QA + Spec Alignment Audit ✅ COMPLETE

**Pre-Backend QA Validation:**
Comprehensive QA audit to verify implementation matches documentation and identify testability gaps before V2 backend work.

**Audit Scope:**
- [x] All 8 routes/screens verified against PRD specifications
- [x] Status mapping (14 internal → 8 public) validated against `statusMapping.ts`
- [x] UI gating logic in `jobUIHelpers.ts` confirmed working correctly
- [x] Mock data coverage (27 jobs) reviewed for edge case completeness
- [x] Edge case testability assessed and documented

**Alignment Scorecard:**
| Area | Status |
|------|--------|
| Status mapping (14→8) | ✅ Matches |
| Law firm message hiding | ✅ Matches |
| UI gating for fatal | ✅ Matches |
| UI gating for escalation | ✅ Matches |
| Auto-checker unlock | ✅ Matches |
| New request form (2 fields) | ✅ Matches |
| Face page completion choice | ✅ Matches |
| Wrapper results (5 types) | ✅ Matches |
| Escalation workflow (5 states) | ✅ Matches |
| Flow wizard steps (5 steps) | ✅ Matches |
| Mock data coverage | ✅ Matches |
| Type definitions | ✅ Matches |

**Lint Cleanup:**
- [x] Fixed unused `_file` parameter in law job detail (added eslint-disable comment)
- [x] Removed unused `isEscalated` variable in staff job detail (redundant with `isEscalatedJob()`)

**Validation Results:**
- `npx tsc --noEmit` - ✅ PASS (0 errors)
- `npm run lint` - ✅ PASS (0 errors, 0 warnings)
- `npm run build` - ✅ PASS (all 8 routes compiled)

**Audit Report:**
Full report saved to `.claude/plans/cheerful-sauteeing-pretzel.md` with:
- Complete alignment scorecard
- Edge case testability matrix
- Smoke test checklist for Law Firm + Staff flows

**Deliverable:** ✅ Frontend validated, lint-clean, and documented ready for V2 backend integration.

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
| 3b | Fatal Report Form | `/law/jobs/new-fatal` | Law Firm | ✅ Complete (V1.6.0) |
| 4 | Job Detail (Chat) | `/law/jobs/[jobId]` | Law Firm | ✅ Complete |
| 5 | Staff Queue | `/staff` | Staff | ✅ Complete |
| 5b | Escalation Queue | `/staff/escalations` | Staff | ✅ Complete (V1.6.0) |
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

- 14 internal statuses (staff sees all)
- 8 public statuses (law firms see simplified)
- Status mapping in `src/lib/statusMapping.ts`
- Color-coded badges for quick scanning

---

## Resources

- **[CLAUDE.md](CLAUDE.md)** - Quick reference for Claude Code
- **[AGENTS.md](AGENTS.md)** - Documentation guide for all AI agents
- **[INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md)** - Documentation navigation hub
- **[docs/prd/](docs/prd/)** - Detailed product specifications (6 focused documents)
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
