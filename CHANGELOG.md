# Changelog

All notable changes to InstaTCR will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-11

### Added

#### Documentation Audit Implementation

**EventType Expansion:**
- **`src/lib/types.ts`** - Added `check_requested` EventType for auto-checker runs
- **`src/components/ui/TimelineMessage.tsx`** - Added RefreshCw icon and violet-400 color for `check_requested` events
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Added `check_requested` to eventTypeColors mapping

**Mock Data Coverage:**
- **`src/lib/mockData.ts`** - Expanded from 15 to 18 sample jobs
  - Added `job_016` (NEEDS_CALL) - Patricia Gonzalez
  - Added `job_017` (READY_FOR_AUTOMATION) - Thomas Anderson
  - Added `job_018` (WAITING_FOR_FULL_REPORT) - Rebecca Martinez
  - Added corresponding events for all new jobs
  - Added `check_requested` event (evt_005_4) for job_005
  - Now covers all 13 internal status types

**Status Message Centralization:**
- **`src/lib/statusMapping.ts`** - Added `STATUS_MESSAGES` export as single source of truth
  - Canonical messages for all 8 public statuses
  - Ensures consistent messaging across the entire application

**Documentation Audit Fixes (~600 lines):**
- **`DEV-ROADMAP.md`** - Fixed status count error (line 492)
  - Changed "7 public statuses" → "8 public statuses"

- **`INSTATCR-MASTER-PRD.md`** - Applied 10 comprehensive documentation fixes

  **Form Specification Update (PRD-FORM-001):**
  - Updated Screen 3 form fields from 4 fields to 2 fields (lines 1060-1085)
  - Removed Client Type and Additional Party Info from initial form
  - Added explanatory note about deferred field collection via chat/staff
  - Reflects actual V1 implementation: Client Name + Report Number only

  **Data Model Annotations (PRD-MODEL-002, PRD-MODEL-001):**
  - Annotated Job interface with V1/V2/V3 section labels (lines 704-762)
    - V1 MVP Fields: Core tracking fields matching types.ts
    - V2 Backend Fields: Enhanced workflow (createdBy, wasAutoEscalated, etc.)
    - V3 VAPI Fields: Voice AI integration (officeAttemptIndex, officeAttempts)
  - Split WrapperRun interface into V1 base and V2+ extended (lines 796-835)
    - V1 MVP: runId, timestamp, result, duration, errorMessage
    - V2+ Extended: message, downloadToken, journeyLog, inputSent

  **EventType Definition Update (PRD-EVENT-001):**
  - Kept `check_requested` as V1 event type (lines 877-893)
  - Grouped and labeled VAPI events as V3/future only
  - Added inline comments for version clarity

  **Component Library Documentation (PRD-FEATURE-001, 002, 003, 005):**
  - Toast Notification System (lines 2555-2610)
    - ToastContext hook with `useToast()` API
    - 4 toast types: success, error, warning, info
    - Glass-morphism styling, auto-dismiss, action buttons
    - Usage examples for forms and staff actions
  - Skeleton Loading System (lines 2612-2668)
    - Composable primitives: SkeletonBase, SkeletonText, SkeletonCard
    - Pre-built variants: JobCardSkeleton, StatCardSkeleton, TimelineItemSkeleton
    - Animation keyframes and integration examples
  - Error State Components (lines 2670-2730)
    - 4 error variants: default, network, notFound, server
    - ErrorState props and API documentation
    - Convenience exports and usage examples
  - Text Utilities (lines 2732-2775)
    - Tooltip component with viewport-aware positioning
    - TruncatedText with smart overflow detection
    - Keyboard accessibility features

  **Tech Stack Update (PRD-FEATURE-006):**
  - Added focus-trap-react dependency to tech stack table (lines 116-125)
  - Version: ^11.0.3
  - Purpose: Focus trapping for modals/drawers (WCAG compliance)

  **Visual Design Note (PRD-MESSAGE-001):**
  - Added implementation note after form wireframe (lines 1115-1125)
  - Documents dark mode aesthetic: glass-morphism, floating orbs, teal focus glow

  **Accessibility Guidelines (PRD-FEATURE-004):**
  - Added comprehensive section "22. Accessibility Guidelines" (lines 4351-4594)
  - Renamed old section 22 to section 23
  - Coverage:
    - Keyboard navigation (TabBar arrow keys, focus trapping)
    - ARIA attributes (status badges, forms, toasts, loading states)
    - Focus management (visible indicators, trapping, restoration)
    - Color contrast (WCAG AA/AAA compliance tables)
    - Semantic HTML examples
    - Screen reader support
    - Font and input sizing tables (mobile/desktop)
    - Testing checklist

### Changed

- **`CLAUDE.md`** - Updated Status Mapping Quick Reference table
  - Shows all 13 internal statuses (previously showed 9)
  - Displays full canonical messages instead of truncated versions
  - Added note pointing to `STATUS_MESSAGES` as authoritative source
  - Updated mock data count (15 → 18 jobs)

---

## [1.0.0] - 2025-12-11

### Added

#### Phase 6 Complete: Polish & Refinement - V1 MVP COMPLETE

**Loading States & Skeleton System:**
- **`src/components/ui/Skeleton/`** - Composable skeleton loading primitives
  - `SkeletonBase` - Base shimmer element with configurable size and rounding
  - `SkeletonText` - Text placeholder with multi-line support and gap options
  - `SkeletonCard` - Card container skeleton
  - `JobCardSkeleton` - Mobile card and table-row variants
  - `StatCardSkeleton` - Dashboard stat card skeleton
  - `TimelineItemSkeleton` - Timeline message skeleton
- Integrated loading states into Law Firm Dashboard (`/law`)
- Integrated loading states into Staff Queue (`/staff`)

**Toast Notification System:**
- **`src/context/ToastContext.tsx`** - Toast context with `useToast()` hook
- **`src/components/ui/Toast/`** - Toast components
  - `Toast.tsx` - Individual toast with glass-morphism styling
  - `ToastContainer.tsx` - Portal-mounted container with responsive positioning
- 4 toast types: `success`, `error`, `warning`, `info`
- Auto-dismiss with progress bar animation
- Action button support for toasts
- Form submission feedback (success/error)
- Staff action feedback (wrapper, upload, escalate, mark complete)

**Accessibility Improvements:**
- **TabBar keyboard navigation** - Arrow keys, Home, End key support
- **ARIA attributes** - `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- **Focus trapping** - BottomSheet and MobileDrawer use `focus-trap-react`
- **Skip navigation link** - Keyboard-accessible skip to main content
- **Color contrast fixes** - Status badge text updated from 300 to 200 level for WCAG AA compliance
- **Focus-visible styling** - Ring indicators on all interactive elements

**Error State Components:**
- **`src/components/ui/ErrorState.tsx`** - Reusable error display
  - `ErrorState` - Base component with 4 variants
  - `NetworkError` - Offline/connection errors
  - `NotFoundError` - 404 states
  - `ServerError` - Server error display
- Form validation error handling with toast
- API error banner in new request form

**Text Utilities:**
- **`src/components/ui/Tooltip.tsx`** - Hover/focus tooltips
  - Viewport-aware positioning
  - Delay before showing
  - Keyboard accessible (shows on focus)
- **`src/components/ui/TruncatedText.tsx`** - Text truncation with tooltip
  - Single and multi-line truncation (1-3 lines)
  - Auto-detects overflow
  - Shows tooltip only when text is truncated

**New Animations (`globals.css`):**
- `toastEnter`, `toastExit`, `toastProgress` - Toast animations
- `skeletonPulse`, `skeletonShimmer` - Skeleton loading effects
- `tooltipEnter` - Tooltip fade-in

**New Dependency:**
- `focus-trap-react` ^11.0.3 - Focus trapping for modals

### Changed

- **`src/app/law/page.tsx`** - Added isLoading state with skeleton loaders
- **`src/app/staff/page.tsx`** - Added isLoading state with skeleton loaders
- **`src/app/law/jobs/new/page.tsx`** - Added toast integration and API error handling
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Added toast feedback for all staff actions
- **`src/components/ui/TabBar.tsx`** - Added keyboard navigation and ARIA
- **`src/components/ui/BottomSheet.tsx`** - Added FocusTrap wrapper
- **`src/components/ui/MobileDrawer.tsx`** - Added FocusTrap wrapper
- **`src/lib/statusMapping.ts`** - Improved text contrast in DARK_STATUS_COLORS
- **`src/app/staff/page.tsx`** - Fixed status badge contrast (200 vs 300)
- **`src/components/ui/StaffJobCard.tsx`** - Fixed status badge contrast
- **`src/app/law/jobs/[jobId]/page.tsx`** - Fixed status badge contrast
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Fixed status badge contrast
- **`src/app/layout.tsx`** - Added skip navigation link, wrapped with Providers

---

## [0.8.0] - 2025-12-10

### Added

#### Phase 6: Dark Mode for Law Firm Pages

- **Law Firm Dashboard (`/law`)** - Full dark mode conversion
  - `bg-slate-950` background with animated floating orbs (teal, cyan, slate)
  - Glass-morphism stat cards with hover glow effects
  - Dark search input with teal focus glow
  - Dark job cards with glass effect and status-colored borders
  - Staggered page entrance animations (`animate-page-entrance`, `animate-text-reveal`)
  - Empty state with dark styling

- **New Request Form (`/law/jobs/new`)** - Full dark mode conversion
  - Mobile header with `header-blur` backdrop effect
  - Glass-morphism form card (`form-card-dark`)
  - Dark inputs with teal focus glow and emerald validation
  - Mobile footer with `mobile-footer-dark` styling
  - Enhanced submit button with stronger glow effects

- **`src/app/globals.css`** - New dark mode utility classes
  - `.stat-card-dark` - Glass effect stat cards with hover glow
  - `.search-input-dark` - Dark search input with teal focus
  - `.form-card-dark` - Dark form card with backdrop blur
  - `.mobile-footer-dark` - Dark sticky footer
  - `.job-card-dark` - Dark job card with hover effects
  - `.empty-state-icon-dark` - Dark empty state icon container
  - `@keyframes cardEntrance` + `.animate-card-entrance` - Staggered card entrance

- **`src/lib/statusMapping.ts`** - Dark mode status colors
  - `DARK_STATUS_COLORS` - Translucent backgrounds with glow effects
  - `getDarkStatusColorClasses()` - Helper for dark status classes

### Changed

- **`src/components/ui/StatusBadge.tsx`** - Added `theme` prop
  - `theme="light"` (default) - Original light mode styling
  - `theme="dark"` - Translucent backgrounds, lighter text, border glow
  - Active statuses (blue, yellow) get pulse animation with ping dot

- **`src/components/ui/Input.tsx`** - Added `theme` prop
  - `theme="dark"` - Dark background, teal focus glow, emerald validation
  - Adjusted label colors for dark mode (teal-400, emerald-400, red-400)

- **`src/components/ui/MobileJobCard.tsx`** - Added `variant` prop
  - `variant="dark"` - Glass-morphism styling with dark hover effects
  - Uses `DARK_STATUS_COLORS` for border colors
  - Passes theme to StatusBadge component

---

## [0.7.0] - 2025-12-11

### Added

#### Phase 5: Mobile Components - COMPLETE

- **`src/hooks/useMediaQuery.ts`** - Responsive hooks utility
  - `useMediaQuery(query)` - Base hook for any media query
  - `useIsMobile()` - Check if < 768px
  - `useIsDesktop()` - Check if >= 768px
  - `useIsTablet()` - Check if 768px - 1023px
  - `usePrefersReducedMotion()` - Accessibility hook
  - `usePrefersDarkMode()` - Dark mode detection
  - `useIsTouchDevice()` - Touch device detection
  - `useBreakpoint()` - Get current breakpoint name
  - SSR-safe with proper hydration handling

- **`src/components/ui/BottomSheet.tsx`** - Modal sheet component
  - Slides up from bottom on mobile
  - Centered modal on desktop
  - Dark overlay with backdrop blur
  - Keyboard accessible (Escape to close)
  - `ConfirmSheet` preset for confirmations
  - `ActionSheet` preset for action lists

- **`src/components/ui/MobileDrawer.tsx`** - Slide-out drawer
  - Slides from left or right
  - Dark overlay backdrop
  - `NavigationDrawer` preset with nav items

- **`src/components/ui/MobileNav.tsx`** - Bottom navigation bar
  - Fixed bottom positioning
  - Active state with teal indicator
  - Badge support for notifications
  - Auto-detects active route
  - Pre-configured nav presets

- **`src/hooks/index.ts`** - Hooks barrel exports

### Changed

- **`src/components/ui/index.ts`** - Added new component exports
  - Organized exports by category
  - Added BottomSheet, ConfirmSheet, ActionSheet
  - Added MobileDrawer, NavigationDrawer
  - Added MobileNav with presets

---

## [0.6.0] - 2025-12-11

### Added

#### Phase 4 Day 2-3: Staff Job Detail (Screen 6) - COMPLETE

- **`src/app/staff/jobs/[jobId]/page.tsx`** - Complete staff job detail page
  - **Responsive layout**: TabBar on mobile, split view on desktop
  - **Law Firm View panel** showing exactly what law firms see
  - **7 Staff Control Cards** for complete job management

**Law Firm View Panel:**
- Client info header with public status badge
- Current status card with user-friendly message
- Activity timeline (user-facing events only)
- Download section for face page and full report
- All Events card (complete internal log)

**Staff Control Cards:**

| Card | Features |
|------|----------|
| **1. Page 1 Data** | Call CHP button, AI Caller (disabled V3), NCIC (auto-derived), crash date/time, officer ID |
| **2. Page 2 Verification** | Auto-split name from clientName, plate, driver license, VIN with filled count |
| **3. CHP Wrapper** | Prerequisites checklist, Run button with 8-13s mock execution, progress bar, collapsible journey log |
| **4. Wrapper History** | Color-coded results (green/yellow/gray/red borders), timestamps, duration, download buttons |
| **5. Auto-Checker** | Lock/unlock UI with conditions display, check button with 3-5s mock |
| **6. Escalation** | Confirmation dialog with notes textarea |
| **7. Manual Completion** | Radio selection (Face Page/Full Report), guaranteed name field, upload simulation |

**Mock Handlers Implemented:**
- Wrapper execution with random results (FULL 30%, FACE_PAGE 40%, NO_RESULT 15%, ERROR 15%)
- Auto-checker with 20% success rate
- Call CHP updates status to `CALL_IN_PROGRESS`
- Escalation updates status to `NEEDS_IN_PERSON_PICKUP`
- Manual completion updates status to `COMPLETED_MANUAL`

**Helper Components Created (inline):**
- `DarkStatusBadge` - Status badge with glow effects
- `WrapperResultBadge` - Color-coded wrapper result display
- `StaffControlCard` - Consistent card wrapper with icon and title
- `DarkInput` - Dark-themed input with floating label
- `PrerequisiteItem` - Checklist item with check/cross icons
- `DownloadButton` - Styled download button with hover effects
- `EscalationDialog` - Modal confirmation dialog
- `AllEventsCard` - Complete event log display

**Animations:**
- Staggered card entrance with `animate-text-reveal`
- Progress bar animation for wrapper execution
- Loading spinner states
- Lock/unlock transition effects

---

## [0.5.0] - 2025-12-10

### Added

#### Phase 4 Day 1: Staff Job Queue (Screen 5)

- **`src/app/staff/page.tsx`** - Staff job queue dashboard with dark mode
  - **Dark mode aesthetic** matching Screen 4
  - Stats cards (2x2 mobile, 4 across desktop) with count-up animation
  - Clickable stats to filter jobs by category
  - Filter tabs (All, Needs Action, In Progress, Completed, Cancelled)
  - Tab indicator with teal glow animation
  - Mobile: StaffJobCard list with cascade animations
  - Desktop: Full data table with hover row effects
  - Internal + Public status badges side by side
  - Refresh button with spin animation
  - Staggered row entrance animations

- **`src/app/staff/layout.tsx`** - Staff layout wrapper
  - Dark mode background (slate-950)
  - Animated floating orbs (teal, blue, purple)

- **`src/components/ui/StatCard.tsx`** - Metric display card
  - Glass-morphism styling
  - Count-up animation on load
  - Color-coded accents (slate, amber, blue, green)
  - Active state with glow effect
  - Click handler for filtering

- **`src/components/ui/TabBar.tsx`** - Filter tabs component
  - Horizontal scrollable tabs
  - Glowing active indicator
  - Badge counts per tab
  - Smooth transitions

- **`src/components/ui/StaffJobCard.tsx`** - Staff job card
  - Shows BOTH internal and public status
  - Client name, report #, law firm name
  - Cascade entrance animation
  - Dark mode badge styling

### Changed

- **`src/components/ui/index.ts`** - Added StatCard, TabBar, StaffJobCard exports

---

## [0.4.0] - 2025-12-10

### Added

#### Phase 3 Complete: Job Detail / Chat View (Screen 4)

- **`src/app/law/jobs/[jobId]/page.tsx`** - Job detail page with dark mode
  - **Dark mode aesthetic** with deep slate/charcoal gradients
  - Floating orbs animated background (teal, cyan, slate)
  - Glass-morphism cards with backdrop blur
  - Glowing status badges with pulse animation for active states
  - Chat-style timeline of user-facing events
  - Status-specific messages (law firm friendly, no technical details)
  - Download buttons with hover glow effects (face page, full report)
  - Page entrance animation with blur reduction
  - Mobile-optimized with sticky blur header
  - Auto-scroll to latest message

- **`src/components/ui/TimelineMessage.tsx`** - Timeline message component
  - Glass-morphism message bubbles
  - Icon mapping for different event types
  - Staggered cascade entrance animations
  - Vertical timeline with glowing connector
  - Timestamp with relative time display

- **`src/lib/mockData.ts`** - Extended with event data
  - `mockJobEvents` array with sample events for multiple jobs
  - `getJobEvents(jobId)` - Get all events for a job
  - `getUserFacingEvents(jobId)` - Get only user-facing events

- **`src/app/globals.css`** - Dark mode animation keyframes
  - `pageEntrance` - Fade up with blur reduction
  - `messageCascade` - Staggered timeline messages
  - `glowPulse` - Status badge glow
  - `subtleGlow` - Interactive element glow
  - `lineGlow` - Timeline connector animation
  - `dotPulse` - Timeline node pulse
  - `textReveal` - Smooth text entrance
  - `floatDark` - Dark mode floating orbs
  - `glass-card-dark` - Dark glass-morphism utility
  - `header-blur` - Sticky header backdrop blur

### Changed

- **`src/components/ui/index.ts`** - Added TimelineMessage export

---

## [0.3.0] - 2025-12-10

### Added

#### Phase 3: New Request Form

- **`src/app/law/jobs/new/page.tsx`** - New request form for law firms
  - Simplified 2-field form: Client Name + Report Number (per PRD)
  - Mobile: Sticky header with back button, sticky footer with submit
  - Desktop: Centered card layout with Cancel/Submit buttons
  - Staggered entrance animations (slide up + fade)
  - Auto-formatting for report number (inserts dashes as you type)
  - Real-time validation with visual feedback
  - Submit flow: Loading spinner → Success shimmer → Navigate to job

- **`src/components/ui/Input.tsx`** - Animated input component
  - Floating label that animates on focus/value
  - Validation states: idle, focused, valid, error
  - Teal gradient border on focus with glow effect
  - Emerald checkmark pop animation on valid
  - Error message slide-in animation
  - Mobile-first sizing (48px → 40px on desktop)

- **`src/app/globals.css`** - Form animation keyframes
  - `slideUp` - Staggered form field entrance
  - `checkPop` - Validation checkmark appearance
  - `radioPulse` - Radio button selection (for future use)
  - `shimmer` - Success button effect
  - `errorSlide` - Error message entrance
  - `focusGlow` - Input focus ring animation

### Changed

- **`src/lib/types.ts`** - Simplified `NewJobFormData` interface
  - Now only requires `clientName` and `reportNumber`
  - Client type, crash date/time collected later via chat or by staff
- **`src/components/ui/index.ts`** - Added Input export
- **`CLAUDE.md`** - Added New Request Form field documentation

---

## [0.2.0] - 2025-12-10

### Added

#### Phase 2: Mock Data System

- **`src/lib/types.ts`** - Core TypeScript interfaces
  - `InternalStatus` type (13 staff-facing statuses)
  - `PublicStatus` type (8 law firm-facing statuses)
  - `Job` interface with all fields (identity, client, report, verification, status, files, timestamps)
  - `WrapperRun` interface for automation history
  - `JobEvent` interface for timeline events
  - Supporting types: `ClientType`, `WrapperResult`, `StatusColor`, `StatusConfig`

- **`src/lib/statusMapping.ts`** - Status conversion logic
  - `STATUS_MAP` - Complete internal → public status mapping with colors and messages
  - `STATUS_COLORS` - Tailwind CSS classes for each status color
  - `getPublicStatus()` - Convert internal to public status
  - `getStatusColor()` - Get color for internal status
  - `getStatusMessage()` - Get law firm-facing message
  - `getStatusColorClasses()` - Get Tailwind classes for a color
  - `formatPublicStatus()` - Format status for display ("REPORT_READY" → "Report Ready")
  - `isCompletedStatus()`, `needsAttention()`, `isActiveStatus()` - Status category helpers

- **`src/lib/utils.ts`** - Extended with helper functions
  - `deriveNcic()` - Extract NCIC from report number (first 4 chars)
  - `splitClientName()` - Split full name into firstName/lastName
  - `convertDateForApi()` - YYYY-MM-DD → MM/DD/YYYY
  - `convertDateForInput()` - MM/DD/YYYY → YYYY-MM-DD
  - `formatRelativeTime()` - "2 hours ago" formatting
  - `formatCrashTime()` - 1430 → "2:30 PM"
  - `isValidReportNumber()` - Validate 9XXX-YYYY-ZZZZZ format
  - `isValidCrashTime()` - Validate HHMM format
  - `generateId()` - Random ID generation

- **`src/lib/mockData.ts`** - 15 sample jobs
  - 4 law firms: Martinez & Associates, Johnson Law Group, Chen Personal Injury, Rivera Legal Services
  - Status coverage: NEW (1), CALL_IN_PROGRESS (1), AUTOMATION_RUNNING (2), FACE_PAGE_ONLY (2), COMPLETED_FULL_REPORT (3), NEEDS_MORE_INFO (2), NEEDS_IN_PERSON_PICKUP (1), CANCELLED (1), AUTOMATION_ERROR (1), COMPLETED_MANUAL (1)
  - Realistic timestamps and wrapper run history
  - `getJobsForLawFirm()`, `getJobById()`, `getJobsByStatus()` helpers
  - `DEFAULT_LAW_FIRM_ID` constant for demo mode

#### Phase 3: Law Firm Dashboard

- **`src/components/ui/StatusBadge.tsx`** - Status badge component
  - Accepts `internalStatus` or `publicStatus` prop
  - Auto-converts internal → public for display
  - Semantic colors: gray, blue, yellow, green, amber, red
  - Size variants: sm, md
  - Shape variants: badge, pill

- **`src/components/ui/FloatingActionButton.tsx`** - Mobile FAB
  - Teal gradient styling matching design system
  - Position options: bottom-right, bottom-center
  - Extended mode with label
  - Hidden on desktop (md:hidden)
  - Scale animation on tap

- **`src/components/ui/MobileJobCard.tsx`** - Job card for lists
  - Displays client name, report number, status badge, relative time
  - Status-colored left border accent
  - Staggered fade-in animation with configurable delay
  - Links to `/law/jobs/{jobId}`
  - Hover: shadow lift effect

- **`src/app/law/layout.tsx`** - Law firm layout wrapper
  - Sticky header with Logo
  - Law firm name display on desktop
  - Slate-50 background
  - Metadata for SEO

- **`src/app/law/page.tsx`** - Law firm dashboard
  - Status summary cards (In Progress / Completed / Need Info)
  - Search filtering by client name, report #, case reference
  - Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
  - Staggered card animations (50ms delay)
  - Empty state with CTA when no jobs
  - FAB on mobile, header button on desktop

### Changed

- **`src/components/ui/index.ts`** - Added exports for StatusBadge, FloatingActionButton, MobileJobCard
- **`src/app/globals.css`** - Added `fadeIn` keyframe for staggered card animations

---

## [0.1.0] - 2025-12-10

### Added

#### Design System Foundation
- **`src/lib/utils.ts`** - `cn()` utility function for conditional class merging (clsx + tailwind-merge)
- **`src/lib/constants.ts`** - Color palette and design constants
- **`src/app/layout.tsx`** - Root layout with Google Fonts (Source Serif 4 + Work Sans)
- **`src/app/globals.css`** - Design system CSS with custom properties and animations

#### UI Components (`src/components/ui/`)
- **Button** - 3 variants (primary, secondary, ghost), 3 sizes (sm, md, lg), full mobile-first responsive
- **Card** - Flexible container with glass effect support for frosted transparency
- **Container** - Responsive width container (sm, md, lg, xl, full)
- **Logo** - Text-based InstaTCR logo component
- **`index.ts`** - Barrel exports for all UI components

#### Landing Page Components (`src/components/landing/`)
- **AnimatedBackground** - Floating orbs with 25-second animation loops, blurred circles creating atmospheric effect
- **Hero** - Logo, headline ("CHP Crash Reports, Delivered Fast"), subheadline, two primary CTAs
- **ValuePropositionCard** - Glass-effect cards with icon, title, and description for showcasing benefits
- **Footer** - Copyright notice and placeholder navigation links

#### Landing Page (`src/app/page.tsx`)
- Complete landing page assembly with Hero, Value Proposition section (3 cards), and Footer
- Sections: Automated Retrieval, Real-Time Tracking, Instant Downloads

### Design Decisions

#### Visual Aesthetic: "Authoritative Modernity"
- **Color Palette**: Navy blue (#0a1628), Gold (#d4a84b), Teal (#14b8a6)
- **Typography**: Source Serif 4 for headings (authority), Work Sans for body (clarity)
- **Effects**: Frosted glass cards, animated floating orbs, subtle gradients
- **Avoided**: Generic purple gradients, typical "AI slop" aesthetics

#### Responsive Strategy
- **Mobile-first**: Base styles for 375px minimum width
- **Breakpoint**: 768px for tablet/desktop transitions
- **Touch targets**: 44px minimum (WCAG 2.1 AAA compliance)
- **Input font size**: 16px on mobile (prevents iOS zoom), 14px on desktop

#### Performance Optimizations
- GPU-accelerated animations using `transform` and `opacity`
- `will-change` properties for animated elements
- Reduced motion support via `prefers-reduced-motion` media query

### Dependencies Added
- `clsx` ^2.1.1 - Conditional class construction
- `lucide-react` ^0.559.0 - Icon library
- `tailwind-merge` ^3.4.0 - Merge Tailwind classes without conflicts

### Technical Notes
- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- TypeScript in strict mode
- All components are Server Components by default (no "use client" unless needed)
