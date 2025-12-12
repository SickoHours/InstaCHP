# Changelog

All notable changes to InstaTCR will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-12

### Added

#### Soft-Dismiss Decline Behavior for Helper UIs (Complete Implementation)

**Problem Solved:**
Previously, when a law firm clicked "No thanks" on helper prompts (SpeedUpPrompt, PassengerVerificationForm, CrashDetailsForm), the UI would either complete the flow or hide entirely. This was suboptimal because:
- Users who changed their mind had no way to re-access the helper
- No tracking of decline behavior for staff-side escalation logic
- Driver helpers should disappear at CONTACTING_CHP status, but passenger helpers should persist if info is missing

**New Soft-Dismiss Pattern:**
- "No thanks" / "Skip" now **collapses** the helper to a compact CTA instead of hiding
- Collapsed CTA stays visible while status is `IN_PROGRESS`
- Users can re-expand at any time by clicking the collapsed CTA
- Driver CTA disappears when status = `CONTACTING_CHP`
- Passenger CTA persists during `CONTACTING_CHP` if additional info is still missing

**New Components Created (2 files):**

- **`src/components/ui/CollapsedHelperCTA.tsx`** - NEW (~65 lines)
  - Compact single-row CTA shown after "No thanks" decline
  - Two variants: `driver` and `passenger`
  - Driver: Zap icon, "Want to speed things up? Add details"
  - Passenger: Users icon, "Have more info to share?"
  - Glass-morphism styling matching theme
  - Mobile: 48px touch targets

- **`src/components/ui/ContactingCHPBanner.tsx`** - NEW (~75 lines)
  - Amber-styled notification banner for passenger flow
  - Shown when: `CONTACTING_CHP` status + passenger + info missing
  - Copy: "We're contacting CHP now. If you have any additional identifiers, adding them can help us retrieve the report faster. It's still optional."
  - Two buttons: "Add Info" (primary) + "No thanks" (secondary)

**Type System Updates:**

- **`src/lib/types.ts`** - EXTENDED (~20 lines added)
  - `InteractiveState` extended with collapse/decline tracking:
    - `driverHelperCollapsed?: boolean` - Driver declined, shows compact CTA
    - `passengerHelperCollapsed?: boolean` - Passenger declined, shows compact CTA
    - `driverDeclineCount?: number` - Times "No thanks" clicked (driver)
    - `passengerDeclineCount?: number` - Times "No thanks" clicked (passenger)
  - `EventType` union extended with 4 new decline tracking events:
    - `driver_speedup_declined` - Driver clicked "No thanks"
    - `driver_speedup_reopened` - Driver re-opened collapsed CTA
    - `passenger_helper_declined` - Passenger clicked "No thanks/Skip"
    - `passenger_helper_reopened` - Passenger re-opened collapsed CTA

**Timeline Event Support:**

- **`src/components/ui/TimelineMessage.tsx`** - UPDATED (~15 lines added)
  - Icon mappings for 4 new event types:
    - `driver_speedup_declined`: ArrowRight (slate)
    - `driver_speedup_reopened`: Zap (amber)
    - `passenger_helper_declined`: ArrowRight (slate)
    - `passenger_helper_reopened`: UserCheck (cyan)

**Component Updates:**

- **`src/components/ui/SpeedUpPrompt.tsx`** - UPDATED (~5 lines changed)
  - Added `onCollapse?: () => void` prop for soft-dismiss behavior
  - "No thanks" button now calls `onCollapse()` if provided, else `onChoice(false)`

- **`src/components/ui/PassengerVerificationForm.tsx`** - UPDATED (~10 lines changed)
  - Added `onCollapse?: () => void` prop for soft-dismiss behavior
  - Skip button now calls `onCollapse()` if provided, else `onSkip()`
  - Label changed: "Your Name" → "Client's Name"

- **`src/components/ui/CrashDetailsForm.tsx`** - UPDATED (~5 lines changed)
  - Added `onCollapse?: () => void` prop for soft-dismiss behavior
  - "Skip this step" button now calls `onCollapse()` if provided, else `onSkip()`

- **`src/components/ui/FlowWizard.tsx`** - MAJOR UPDATE (~60 lines changed)
  - Added `onCollapse?: (variant: 'driver' | 'passenger') => void` prop
  - Added `onExpand?: (variant: 'driver' | 'passenger') => void` prop
  - Updated rendering logic for all three steps (verification, speedup, crash_details):
    - If collapsed flag is true, show `CollapsedHelperCTA` instead of full form
    - Pass `onCollapse` to child components for soft-dismiss behavior

**Page Integration:**

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED (~100 lines changed)
  - Added `isPassengerInfoMissing()` helper function to check if passenger has provided any identifiers
  - Added `handleHelperCollapse()` handler:
    - Logs decline event with appropriate message
    - Sets collapsed flag in InteractiveState
    - Increments decline count for staff-side tracking
  - Added `handleHelperExpand()` handler:
    - Logs reopen event with appropriate message
    - Clears collapsed flag
  - Updated FlowWizard rendering with new collapse/expand handlers
  - Added ContactingCHPBanner rendering for passenger flow

### Changed

- **`src/components/ui/index.ts`** - Added CollapsedHelperCTA and ContactingCHPBanner exports
  - New "Decline behavior components (V1.3.0+)" section

### UX Flow Summary

**Status-Based Visibility Rules:**

| Public Status | Driver UI | Passenger UI |
|---------------|-----------|--------------|
| IN_PROGRESS | Show wizard OR collapsed CTA | Show wizard OR collapsed CTA |
| CONTACTING_CHP | **Hide completely** | Show banner if info missing + collapsed CTA |
| FACE_PAGE_READY | Hide | Hide |
| WAITING_FOR_REPORT | Hide | Hide |
| REPORT_READY | Hide | Hide |

**Event Tracking:**

| Action | Event Type | Message |
|--------|------------|---------|
| Driver declines speed-up | `driver_speedup_declined` | "No problem! We'll handle it from here." |
| Driver re-expands CTA | `driver_speedup_reopened` | "Let's add those crash details." |
| Passenger declines helper | `passenger_helper_declined` | "Got it! We'll work with what we have." |
| Passenger re-expands CTA | `passenger_helper_reopened` | "Let's add that information." |

### Fixed

#### CrashDetailsForm Skip Behavior

**Problem:**
When a user clicked "Yes, I have details" on SpeedUpPrompt but then changed their mind and clicked "Skip this step" on CrashDetailsForm, the UI would hide completely instead of collapsing to the compact CTA.

**Fix:**
- Added `onCollapse` prop to CrashDetailsForm (same pattern as SpeedUpPrompt)
- Updated FlowWizard to check `driverHelperCollapsed` for crash_details step
- Updated FlowWizard to pass `onCollapse` handler to CrashDetailsForm

**User Impact:**
Users can now decline at the CrashDetailsForm step and still see a compact CTA to re-access the form if they change their mind.

### Technical Notes

- **Decline Count Tracking:** `driverDeclineCount` and `passengerDeclineCount` increment each time "No thanks" is clicked, enabling staff-side escalation logic to detect repeated declines
- **Mobile-First:** All new components use 48px touch targets, responsive to 375px
- **Plain English:** All timeline messages avoid technical jargon
- **State Persistence:** Collapsed state persists in InteractiveState across page refreshes

**Files Created:** 2 files
**Files Modified:** 7 files
**Lines Added:** ~250 lines
**Lines Changed:** ~100 lines

---

## [1.2.1] - 2025-12-12

### Fixed

#### FlowWizard Hidden for Reports with Face Page or Waiting Status

**Problem:**
The FlowWizard (which contains the SpeedUpPrompt asking for crash details) was still showing when a job reached `WAITING_FOR_FULL_REPORT` or `FACE_PAGE_ONLY` status. At these stages, crash details can no longer help speed up report retrieval since:
- For `WAITING_FOR_FULL_REPORT`: We already have the face page and are just waiting for the full report to become available
- For `FACE_PAGE_ONLY`: We've already retrieved what's available from CHP

**Fix:**
- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED (line 788)
  - Added `WAITING_FOR_FULL_REPORT` and `FACE_PAGE_ONLY` to FlowWizard exclusion list
  - FlowWizard now hidden when job reaches these statuses
  - Prevents irrelevant "speed things up" prompts from appearing

**User Impact:**
Law firms no longer see the crash details prompt when it's no longer useful, creating a cleaner and more logical user experience.

---

## [1.2.0] - 2025-12-12

### Added

#### Conditional Rescue Flow for Page 2 Verification Failures (Complete Implementation)

**Problem Solved:**
When the CHP wrapper found a report (Page 1 succeeded) but failed to verify and retrieve it (Page 2 failed), there was no way for law firms to provide additional identifiers to retry.

**New Result Types:**
Updated `WrapperResult` to distinguish failure modes:

| Result | Meaning | UI Response |
|--------|---------|-------------|
| `FULL` | Success - full report retrieved | Download available |
| `FACE_PAGE` | Success - face page only | Download + waiting message |
| `PAGE1_NOT_FOUND` | Page 1 failed - report not found | Show Page 1 correction form |
| `PAGE2_VERIFICATION_FAILED` | Page 1 passed, Page 2 failed | Show rescue form |
| `PORTAL_ERROR` | Technical error | Auto-retry message |

**New Report Type Hint:**
- Added `ReportTypeHint` type: `'FULL' | 'FACE_PAGE' | 'UNKNOWN'`
- Known once Page 1 succeeds, even before Page 2 verification
- Displayed in timeline: "The full report is available" or "A preliminary copy (face page) is available"
- Helps users understand what to expect after providing rescue info

**New Component Created:**

- **`src/components/ui/DriverInfoRescueForm.tsx`** - NEW (~335 lines)
  - Amber-styled rescue form with explanation header
  - "We found your report, but need additional identifiers to verify and retrieve it"
  - Vehicle/ID section: License Plate, Driver's License, VIN
  - Additional Names section with repeatable rows (starts empty)
  - "+ Add another name" button, trash icon to remove
  - Submit button: "Save & Check Again" with loading state
  - Auto-triggers wrapper re-run on submission

**Type System Updates:**

- **`src/lib/types.ts`** - EXTENDED (~50 lines added)
  - `WrapperResult` type updated with 5 distinct result types
  - `ReportTypeHint` type added for Face Page vs Full Report hint
  - `RescueFormData` interface for rescue form data
  - `WrapperRun` interface extended with `page1Passed` and `reportTypeHint`
  - `InteractiveState` extended with rescue tracking fields:
    - `rescueInfoProvided`, `rescueInfoTimestamp`, `rescueFormData`
  - 4 new `EventType` values for rescue flow

**CrashDetailsForm Update:**

- **`src/components/ui/CrashDetailsForm.tsx`** - UPDATED (~15 lines changed)
  - Button text: "Continue" → "Save & Check for Report"
  - Loading state: "Checking CHP..."
  - Icon: ArrowRight → Search
  - Triggers wrapper immediately on submission

**Timeline Event Support:**

- **`src/components/ui/TimelineMessage.tsx`** - UPDATED (~15 lines added)
  - Icon mappings for 4 new rescue event types:
    - `page1_not_found`: AlertCircle (amber)
    - `page2_verification_needed`: AlertCircle (amber)
    - `rescue_info_saved`: CheckCircle2 (emerald)
    - `rescue_wrapper_triggered`: Sparkles (purple)

**Page Integration:**

- **`src/app/law/jobs/[jobId]/page.tsx`** - MAJOR UPDATE (~150 lines changed)
  - Updated `runAutoWrapper()` with new result types and reportTypeHint
  - New mock result distribution: FULL 30%, FACE_PAGE 35%, PAGE1_NOT_FOUND 15%, PAGE2_VERIFICATION_FAILED 15%, PORTAL_ERROR 5%
  - Added `handleRescueSubmit()` for rescue form processing
  - Added `needsRescue` flag for conditional rendering
  - Added `needsPage1Correction` flag for Page 1 corrections
  - Updated `showInlineFieldsCard` to only show for Page 1 corrections
  - Timeline messages include reportTypeHint for better user feedback

### Changed

- **`src/components/ui/index.ts`** - Added DriverInfoRescueForm export
  - New "Rescue flow components (V1.2.0+)" section

- **`src/app/staff/jobs/[jobId]/page.tsx`** - Updated wrapper result handling
  - WrapperResultBadge updated for new result types
  - Staff runWrapper function updated with new result distribution

- **`src/lib/mockData.ts`** - Updated sample data
  - Replaced 'NO_RESULT' with 'PAGE1_NOT_FOUND'
  - Replaced 'ERROR' with 'PORTAL_ERROR'

### Guardrails Implemented

**Rescue form visibility conditions (all must be true):**
1. At least one wrapper run with `result === 'PAGE2_VERIFICATION_FAILED'`
2. `rescueInfoProvided` is not yet true
3. Job status is not completed/cancelled

**Page 1 correction visibility conditions (all must be true):**
1. At least one wrapper run with `result === 'PAGE1_NOT_FOUND'`
2. Job status is not completed/cancelled
3. Flow wizard is complete

### UX Flow Diagram

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

### Technical Notes

- **Backward Compatibility:** Legacy wrapper results (NO_RESULT, ERROR) mapped to new types
- **ReportTypeHint:** Persisted in WrapperRun for UI display even when verification fails
- **Mobile-First:** Rescue form uses 48px touch targets, responsive inputs
- **Plain English:** All timeline messages avoid technical jargon

**Files Created:** 1 file
**Files Modified:** 6 files
**Lines Added:** ~400 lines
**Lines Changed:** ~200 lines

---

## [1.1.0] - 2025-12-12

### Added

#### Redesigned Law Firm "Driver vs Passenger" Flow (Complete Implementation)

**Problem Solved:**
The previous flow was confusing after the user selected Driver or Passenger:
- Two forms coexisted (PassengerMiniForm + InlineFieldsCard) with overlapping fields
- Inconsistent paths between drivers and passengers
- No clean skip experience
- Crash details buried in a large unified form

**New Step-by-Step Wizard Flow:**

| Path | Flow |
|------|------|
| **Driver** | Selection → Speed-Up Prompt → [Crash Details] → Done |
| **Passenger** | Selection → Verification Form → Speed-Up Prompt → [Crash Details] → Done |

**New Components Created (4 files):**

- **`src/components/ui/SpeedUpPrompt.tsx`** - NEW (~90 lines)
  - Binary yes/no choice: "Want to share crash details to speed things up?"
  - Primary "Yes, I have details" button + secondary "No thanks" button
  - Amber Zap icon, glass-morphism styling
  - Mobile: stacked buttons (48px), Desktop: side-by-side (40px)

- **`src/components/ui/CrashDetailsForm.tsx`** - NEW (~190 lines)
  - Focused crash details form (date, time, officer ID)
  - ALL fields optional - Continue always enabled
  - Clean "Skip this step" text link
  - HHMM time validation (reused from InlineFieldsCard)

- **`src/components/ui/PassengerVerificationForm.tsx`** - NEW (~250 lines)
  - Enhanced passenger verification with repeatable name pairs
  - "Other people involved" section with + Add / × Remove functionality
  - Vehicle info section (plate, license, VIN)
  - ALL fields optional - Continue always enabled
  - "I don't have any of this information" skip link

- **`src/components/ui/FlowWizard.tsx`** - NEW (~170 lines)
  - Orchestrator managing step-by-step state machine
  - Renders correct step component based on `job.interactiveState.flowStep`
  - Handles step transitions with opacity fade
  - Calls `onComplete` when wizard finishes

**Type System Updates:**

- **`src/lib/types.ts`** - EXTENDED (~45 lines added)
  - `FlowStep` type: `'selection' | 'verification' | 'speedup' | 'crash_details' | 'done'`
  - `PassengerVerificationData` interface with `additionalNames` array
  - `InteractiveState` interface extended with flow wizard fields:
    - `flowStep`, `speedUpOffered`, `speedUpAccepted`
    - `passengerVerification`, `crashDetailsProvided`, `flowCompletedAt`
  - 6 new `EventType` values for timeline tracking

**Timeline Event Support:**

- **`src/components/ui/TimelineMessage.tsx`** - UPDATED (~20 lines added)
  - Icon mappings for 6 new event types:
    - `flow_speedup_prompt`: Zap (amber)
    - `flow_speedup_yes`: CheckCircle2 (emerald)
    - `flow_speedup_no`: ArrowRight (slate)
    - `flow_crash_details_saved`: FileText (cyan)
    - `flow_verification_saved`: UserCheck (cyan)
    - `flow_completed`: Sparkles (emerald)

**Page Integration:**

- **`src/app/law/jobs/[jobId]/page.tsx`** - MAJOR REFACTOR (~200 lines changed)
  - Removed old flow gate code and PassengerMiniForm rendering
  - Added `FlowWizard` component with `onStepChange` and `onComplete` handlers
  - New visibility logic: Wizard shown until `flowStep === 'done'`
  - `InlineFieldsCard` hidden during wizard, shown after completion
  - New handlers: `handleFlowStepChange()`, `handleFlowComplete()`
  - Timeline events added at each step with user-friendly messages

### Changed

- **`src/components/ui/index.ts`** - Added exports for 4 new flow wizard components
  - FlowWizard, SpeedUpPrompt, CrashDetailsForm, PassengerVerificationForm

### UX Improvements

- **Clean skip at every step** - Subtle text links, no modal dialogs
- **All fields optional** - Continue button always enabled
- **Linear flow** - No overlapping forms or confusing parallel paths
- **Friendly copy** - "Want to speed things up?" vs "Required fields"
- **Repeatable names** - Passengers can add multiple people involved in crash

### Technical Notes

- **Backward Compatibility:** Legacy jobs without `flowStep` default to `'selection'` if `clientType` is null, or `'done'` if already set
- **State Machine:** Flow step tracked in `job.interactiveState.flowStep`
- **Auto-Wrapper:** Triggers when Page 1 complete (date + time) AND any Page 2 field provided
- **Mobile-First:** All new components use 48px touch targets, responsive to 375px

**Files Created:** 4 files
**Files Modified:** 4 files
**Lines Added:** ~700 lines
**Lines Changed:** ~200 lines

---

## [1.0.7] - 2025-12-11

### Added

#### Simplified Law Firm Job View (Complete Implementation)

**New Unified Form Component:**
- **`src/components/ui/InlineFieldsCard.tsx`** - NEW: Always-visible unified form (~340 lines)
  - Combines all Page 1 + Page 2 fields in single component
  - Section 1: Crash Details (crashDate, crashTime, officerId)
  - Section 2: Driver Information (firstName, lastName, plate, driverLicense, vin)
  - Single "Save & Check for Report" button at bottom
  - No edit mode - fields always visible and editable
  - HHMM time validation (4-digit 24-hour format: 0000-2359)
  - Disabled state support for flow gate integration
  - Glass-morphism styling matching existing dark theme
  - Responsive: h-12 mobile, h-10 desktop, 48px touch targets

**Flow Gate Implementation:**
- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Flow gating system (~90 lines changed)
  - Added `isFormLocked` logic - form locked until driver/passenger selected
  - Flow gate card prominent at top when `clientType === null`
  - DriverPassengerChoice embedded in flow gate
  - PassengerMiniForm shown in gate for passenger selection
  - InlineFieldsCard disabled when gate active (visible but greyed out)
  - Clear helper text: "Please select Driver or Passenger first to enable form"

**Unified Save Handler:**
- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Consolidated save logic (~55 lines)
  - New `handleSaveAllFields()` replaces separate Page1/Page2 handlers
  - Updates all fields atomically in single operation
  - Generates timeline events for changed sections
  - Auto-wrapper prerequisites: Page 1 complete (date + time) AND ≥1 Page 2 field
  - Prevents wrapper failure when Page 2 missing

**Simplified Timeline:**
- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Read-only timeline (~70 lines removed)
  - Removed all interactive rendering branches
  - No embedded forms or chat-style interactions
  - Simple read-only loop showing all events
  - Cleaner, more maintainable code

**Time Validation Utility:**
- **`src/lib/utils.ts`** - UPDATED: Added `formatHHMMTime()` (~8 lines)
  - Formats HHMM to HH:MM display (24-hour)
  - Example: `formatHHMMTime('1430')` => `'14:30'`
  - Existing `isValidCrashTime()` validates HHMM format

### Changed

- **`src/components/ui/index.ts`** - Added InlineFieldsCard export
  - New "Unified inline form (V1.0.7+)" section

- **`src/app/law/jobs/[jobId]/page.tsx`** - Major restructure
  - Removed imports: Page1DataCard, Page2DataCard, Page1DetailsCard
  - Added import: InlineFieldsCard
  - Removed `handlePage1Save`, `handlePage2Save` handlers
  - Removed `handlePage1DetailsSubmit`, `handlePage1Skip` handlers
  - Removed useEffect for `page1_details_request` trigger
  - Added `handleSaveAllFields` unified handler
  - Replaced separate data cards with InlineFieldsCard
  - Added flow gate UI section before form
  - Simplified timeline to read-only loop

### Deprecated

- **`src/components/ui/Page1DataCard.tsx`** - Marked @deprecated
  - Replaced by InlineFieldsCard
  - Kept for reference only

- **`src/components/ui/Page2DataCard.tsx`** - Marked @deprecated
  - Replaced by InlineFieldsCard
  - Kept for reference only

- **`src/components/ui/Page1DetailsCard.tsx`** - Marked @deprecated
  - Replaced by InlineFieldsCard
  - Kept for reference only

### Technical Notes

- **V1 Limitations:** All data remains in-memory, wrapper is mocked
- **Mobile-First:** All components use 48px touch targets, responsive to 375px
- **Plain English:** All law firm messages avoid technical jargon
- **Flow Gate:** Driver/Passenger selection REQUIRED before form access
- **Auto-Wrapper Prerequisites:** Crash date + crash time + any Page 2 field
- **HHMM Format:** 4-digit 24-hour time (0000-2359), not HTML time picker

**Files Modified:** 5 files
**Files Created:** 1 file
**Lines Added:** ~400 lines
**Lines Removed:** ~150 lines

---

## [1.0.6] - 2025-12-11

### Added

#### Enhanced Flow & Auto-Wrapper (Complete Implementation - All 6 Phases)

**Phase 1: Status System Updates**
- **`src/lib/mockDataManager.ts`** - UPDATED: Default status changed (~1 line)
  - New jobs now start with `internalStatus: 'NEEDS_CALL'` (was `'NEW'`)
  - Ensures jobs enter active state immediately for better tracking

- **`src/lib/statusMapping.ts`** - UPDATED: NEW status mapping (~3 lines)
  - NEW now maps to `IN_PROGRESS` public status (was `SUBMITTED`)
  - Color changed from `gray` to `blue` (active state)
  - Message: "We're working on your request." (consistent with NEEDS_CALL)

**Phase 2: Card Visibility Logic**
- **`src/app/staff/jobs/[jobId]/page.tsx`** - UPDATED: Card 7 conditional rendering (~3 lines)
  - Manual Completion card now hidden when `facePageToken || fullReportToken` exists
  - Same conditional hiding as Card 6 (Escalation)
  - Both cards completely omitted (not disabled) when reports obtained

**Phase 3: Passenger Flow Enhancements**
- **`src/components/ui/PassengerMiniForm.tsx`** - UPDATED: Skip option and improved copy (~60 lines added)
  - Help text changed to "Provide as many fields as possible for the best chance of finding your report"
  - Added "I don't have this information" button (shown when no fields filled)
  - Added skip nudge modal with warning: "Not having this extra information could delay your report"
  - "Continue Anyway" and "Go Back" buttons in nudge modal
  - Allows empty submission when user explicitly chooses to skip

**Phase 4: Page 1 Details Nudge**
- **`src/components/ui/Page1DetailsCard.tsx`** - NEW: Crash details prompt form (~210 lines)
  - 3 optional fields: crash date, crash time, officer badge number
  - Skip button option with "Skip for Now" label
  - Dark glass-morphism styling matching existing components
  - Used in interactive timeline event

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Page 1 nudge integration (~90 lines added)
  - Added `useEffect` to trigger `page1_details_request` event when appropriate
  - Triggers when: `NEEDS_CALL` status + `clientType` selected + not already shown
  - Added `handlePage1DetailsSubmit()` handler to update crash details
  - Added `handlePage1Skip()` handler for skip action
  - Interactive timeline rendering for Page 1 details card

**Phase 5: Law Firm Auto-Wrapper (Major Feature)**
- **`src/components/ui/Page1DataCard.tsx`** - NEW: Editable crash details card (~240 lines)
  - Display mode shows crash date, time, officer badge (when data exists)
  - Edit mode with Save/Cancel buttons
  - "Add Details" button when empty, "Edit" button when populated
  - Auto-triggers wrapper on save if prerequisites met
  - Dark glass-morphism with cyan border

- **`src/components/ui/Page2DataCard.tsx`** - NEW: Editable driver info card (~320 lines)
  - 5 fields: firstName, lastName, plate, driverLicense, vin
  - Same edit/display pattern as Page1DataCard
  - Auto-triggers wrapper on save if prerequisites met
  - Shows complete name in display mode

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Auto-wrapper logic (~120 lines added)
  - Added `runAutoWrapper()` function (mock wrapper with 8-13s delay)
  - Random results: FULL (30%), FACE_PAGE (40%), NO_RESULT (15%), ERROR (15%)
  - Added `handlePage1Save()` and `handlePage2Save()` handlers
  - Both handlers check prerequisites: Page 1 complete + ≥1 Page 2 field
  - Auto-triggers wrapper when prerequisites met (no visible "Run" button for law firms)
  - Cards render between CHP nudge and timeline section
  - Cards hidden when job status is COMPLETED_FULL_REPORT, COMPLETED_MANUAL, or CANCELLED
  - Plain-English timeline messages for all wrapper actions/results

**Phase 6: Timeline Message Hygiene**
- **`src/components/ui/TimelineMessage.tsx`** - UPDATED: Event type mappings (~8 lines added)
  - Added icon mappings for 4 new event types:
    - `page1_details_request`: MessageCircle
    - `auto_wrapper_triggered`: Sparkles
    - `auto_wrapper_success`: CheckCircle2
    - `auto_wrapper_failed`: XCircle
  - Added color mappings for 4 new event types:
    - `page1_details_request`: text-teal-400
    - `auto_wrapper_triggered`: text-purple-400
    - `auto_wrapper_success`: text-emerald-400
    - `auto_wrapper_failed`: text-red-400

### Changed

- **`src/lib/types.ts`** - Extended EventType (~4 lines added)
  - Added `'page1_details_request'` event type
  - Added `'auto_wrapper_triggered'` event type
  - Added `'auto_wrapper_success'` event type
  - Added `'auto_wrapper_failed'` event type

- **`src/components/ui/index.ts`** - Barrel exports (~3 lines added)
  - Exported `Page1DetailsCard` component
  - Exported `Page1DataCard` component
  - Exported `Page2DataCard` component

### Technical Notes

- **V1 Limitations:** All data remains in-memory, wrapper is mocked with random results
- **Mobile-First:** All new components use 48px touch targets, responsive to 375px
- **Plain English:** All law firm messages avoid technical jargon
- **Status Flow:** NEW → NEEDS_CALL (immediate active state)
- **Auto-Wrapper Prerequisites:** Crash date + crash time + any driver field
- **Card Hiding:** Complete omission (not disabling) when conditions not met

## [1.0.5] - 2025-12-11

### Added

#### Frontend Polish Features (Complete Implementation - All 8 Phases)

**Phase 1: Foundation - Dynamic Job Creation**
- **`src/lib/mockDataManager.ts`** - NEW: In-memory data manager singleton (~180 lines)
  - `MockDataManager` class with CRUD operations for jobs and events
  - `createJob()` - Creates unique job IDs (job_019, job_020, etc.) with initial events
  - `updateJob()`, `addEvent()`, `completeInteraction()` methods
  - Automatically adds 2 initial events on job creation:
    - `job_created`: "We've received your request and will begin processing shortly."
    - `driver_passenger_prompt`: Interactive prompt for client type

- **`src/context/MockDataContext.tsx`** - NEW: React Context for global state (~140 lines)
  - `MockDataProvider` wraps entire app with state management
  - `useMockData()` hook exposes all data operations
  - Triggers re-renders on mutations (createJob, updateJob, addEvent)
  - V1-only: All data stays in browser memory, resets on refresh

**Phase 2: Interactive Timeline**
- **`src/components/ui/DriverPassengerChoice.tsx`** - NEW: Two-button selection component (~65 lines)
  - Driver / Passenger buttons with glass-morphism dark styling
  - Teal/cyan gradients, hover scale effects
  - Mobile: 48px touch targets, responsive to 375px

- **`src/components/ui/TimelineMessage.tsx`** - EXTENDED: Support for interactive content
  - Added `children` prop for embedding forms/buttons
  - Added `isInteractive` prop to disable hover effects
  - Interactive content renders in separate div with mt-4 spacing
  - Added icon/color mappings for 5 new event types

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Interactive timeline rendering (~80 lines added)
  - Uses `useMockData()` context instead of direct imports
  - `handleDriverPassengerSelect()` handler updates job and creates confirmation events
  - Conditional rendering for interactive events (checks `metadata.isInteractive`)
  - DriverPassengerChoice embedded when `eventType === 'driver_passenger_prompt'`

- **`src/app/law/jobs/new/page.tsx`** - UPDATED: Dynamic job creation (~5 lines changed)
  - Calls `createJob()` from context instead of routing to hardcoded job_001
  - Routes to newly created job's unique ID (`/law/jobs/${newJob._id}`)

**Phase 4: Passenger Mini Form**
- **`src/components/ui/PassengerMiniForm.tsx`** - NEW: Compact passenger data form (~200 lines)
  - Displays client name (static) + 3 optional fields (plate, driver license, VIN)
  - Validation: At least 1 field must be filled to submit
  - Dark glass-morphism styling matching existing design
  - Mobile: 48px touch targets, responsive input fields
  - Submit button with loading state and disabled state

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: Passenger form integration (~60 lines added)
  - Added `handlePassengerFormSubmit()` handler
  - Updates job with `passengerProvidedData` on submission
  - Creates confirmation event with list of provided fields
  - Conditional rendering when `eventType === 'page2_updated'` and `clientType === 'passenger'`

**Phase 5: Staff Quick-Fill Buttons**
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Card 2 quick-fill banner (~60 lines added)
  - Banner shows above Card 2 fields when `job.passengerProvidedData` exists
  - Displays each provided field (plate, driverLicense, vin) conditionally
  - Copy buttons fill corresponding Card 2 fields with passenger-provided data
  - Teal background with border, matching design tokens
  - Hover effects on copy buttons

**Phase 6: CHP Nudge**
- **`src/components/ui/CHPNudge.tsx`** - NEW: Dismissible info card (~60 lines)
  - Phone icon with friendly message encouraging optional CHP call
  - Displays report number in monospace teal text
  - Dismissible via X button in top-right
  - Dark glass-morphism with cyan border
  - Plain-language copy: "Speed things up! Call CHP..."

- **`src/app/law/jobs/[jobId]/page.tsx`** - UPDATED: CHP nudge integration (~40 lines added)
  - Added `handleDismissNudge()` handler
  - Added `useEffect` to auto-hide nudge when status changes from NEW
  - Shows when `status === 'NEW' && clientType !== null && !chpNudgeDismissed`
  - Renders between Current Status Card and Timeline Section

**Phase 7: Escalation Conditional**
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Card 6 conditional rendering (~2 lines added)
  - Escalation card completely hidden when `facePageToken || fullReportToken` exists
  - No "not needed" message - card simply doesn't render

**Phase 8: Manual Completion Enhancement**
- **`src/app/staff/jobs/[jobId]/page.tsx`** - Card 7 label updates (~3 lines changed)
  - Label: "Guaranteed Name *" → "First Name *"
  - Placeholder: "Client full name" → "Enter driver's first name only"
  - Help text: "Required to unlock auto-checker" → "First name only - used to unlock auto-checker"

### Changed

- **`src/lib/types.ts`** - Extended interfaces (~30 lines added)
  - `Job` interface:
    - `clientType` now allows `null` for unset state
    - `crashDate` now optional (not required for NEW jobs)
    - Added `passengerProvidedData` object (plate, driverLicense, vin, providedAt)
    - Added `interactiveState` object (driverPassengerAsked, chpNudgeDismissed)
  - `EventType` union:
    - Added 5 new types: `driver_passenger_prompt`, `driver_selected`, `passenger_selected`, `passenger_data_provided`, `chp_nudge_shown`

- **`src/app/providers.tsx`** - Added MockDataProvider (~2 lines)
  - Wraps `ToastProvider` with `MockDataProvider`
  - Makes mock data context available to entire app

- **`src/components/ui/index.ts`** - Added component exports
  - DriverPassengerChoice, PassengerMiniForm, CHPNudge

### Technical Notes

**V1-Only Implementation:**
- MockDataManager and Context are 100% frontend, in-memory only
- No backend, no persistence - data resets on page refresh
- Easy migration to Convex in V2 (swap context with queries/mutations)

**Plain English Messaging:**
- All new event types map to user-friendly messages
- No technical jargon exposed to law firms
- Interactive prompts use conversational language

**Complete Feature Set:**
- ✅ Dynamic job creation with unique IDs
- ✅ Interactive driver/passenger selection in timeline
- ✅ Passenger mini form for collecting verification data
- ✅ Staff quick-fill buttons from passenger-provided data
- ✅ CHP nudge for NEW status jobs (auto-hide on status change)
- ✅ Escalation card conditional hiding (when reports obtained)
- ✅ Manual completion labels clarified (first-name-only)

**Files Modified:** 9 files
**Files Created:** 5 files
**Lines Added:** ~900 lines
**Lines Changed:** ~300 lines

---

## [1.0.4] - 2025-12-11

### Changed

#### Root README Rewrite

**`README.md`** - Complete rewrite for accuracy and clarity:

- **Current Status section** - Explicit V1 vs "Not in V1 yet" bullet lists
  - V1 (current): Frontend-only, mock data, simulated wrapper
  - Not in V1: Convex, auth, real wrapper, file storage
- **Quick Start** - Verified scripts from package.json (`dev`, `build`, `start`, `lint`)
- **Documentation section** - New "Repo Doc Roles" table showing purpose of each doc
- **Documentation Precedence** - Added 4-item hierarchy (CHANGELOG > DEV-ROADMAP > docs/prd > MASTER-PRD)
- **Removed** - Outdated project structure, stale version number (0.1.0), "coming soon" references

**`CLAUDE.md`** - Added README.md link to "See Also" section
- Placed alongside other entry-point docs (AGENTS.md, DEV-ROADMAP.md, INSTATCR-MASTER-PRD.md)
- Description: "Setup + quick start"

---

## [1.0.3] - 2025-12-11

### Added

#### Docs Notes System

**New `docs/notes/` structure for milestone documentation:**

- **`docs/notes/README.md`** - Index file with notes table
  - Purpose: Preserve context for significant documentation milestones
  - Prevents root-level markdown sprawl
  - Links to all dated notes

- **`docs/notes/2025-12-11-docs-reorg.md`** - First milestone note
  - Documents the PRD reorganization (why, what changed, precedence rules)
  - Includes maintenance rule for future notes
  - Links to related documentation

**Repo Hygiene rule added to AGENTS.md:**
- Do not create new root-level markdown summary files
- For major refactors/migrations, add dated notes under `docs/notes/`
- Keep documentation organized under existing folders

### Changed

- **`INSTATCR-MASTER-PRD.md`** - Added link to `docs/notes/` in Development Documents section
- **`AGENTS.md`** - Added "Repo Hygiene" subsection and link to `docs/notes/` in Additional Resources

---

## [1.0.2] - 2025-12-11

### Added

#### Documentation Reorganization (PRD Split)

**New PRD Structure (`docs/prd/`):**
Split the 5,275-line INSTATCR-MASTER-PRD.md into 6 focused, maintainable documents:

- **`docs/prd/01-product-foundation.md`** (~335 lines)
  - Executive summary, product vision, V1-V4 roadmap
  - 3 system architecture diagrams (Mermaid)
  - Audience: Product managers, stakeholders, designers

- **`docs/prd/02-business-logic.md`** (~540 lines)
  - 6 complete user flows (happy path, incomplete info, face page, auto-checker, escalation, VAPI)
  - Status system architecture (13 internal → 8 public mapping)
  - Data model reference (Job, WrapperRun, OfficeAttempt, JobEvent interfaces)
  - Audience: Engineers, product designers, QA

- **`docs/prd/03-screen-specifications.md`** (~801 lines)
  - All 6 screen UI/UX specifications with wireframes
  - Staff Job Detail with 7 control cards breakdown
  - Audience: Frontend engineers, UI/UX designers

- **`docs/prd/04-chp-wrapper.md`** (~515 lines)
  - CHP Wrapper architecture and behavior patterns
  - 5 detailed patterns (successful, face page, missing info, no records, error)
  - Execution timeline with Gantt chart
  - Audience: Backend engineers, DevOps

- **`docs/prd/05-component-library.md`** (~826 lines)
  - 10 UI components (StatusBadge, Button, Input, Card, FAB, TabBar, etc.)
  - 8 helper functions with code examples
  - Toast, Skeleton, Error State, Text utility systems
  - Audience: Frontend engineers

- **`docs/prd/06-implementation-guide.md`** (~1,840 lines)
  - V1 frontend phases (6 phases, 13 days)
  - V2 backend integration specs
  - V3/V4 future roadmap (VAPI, Open Router)
  - Validation rules, responsive design, accessibility (WCAG)
  - Testing checklist, deployment architecture
  - Audience: All engineers, QA, DevOps

**AI Agent Documentation:**

- **`AGENTS.md`** (NEW) - Comprehensive guide for all AI agents
  - Documentation precedence rules: CHANGELOG > DEV-ROADMAP > docs/prd > MASTER-PRD
  - Documentation map with quick lookup guide
  - Common tasks and decision framework
  - AI agent best practices (small diffs, plain English explanations)
  - Common pitfalls to avoid

- **`CLAUDE.md`** (UPGRADED) - Claude-specific quick reference
  - Added precedence rules at top
  - Quick links table to all docs/prd/* files
  - Status mapping reference (all 13 statuses)
  - Validation rules quick reference
  - Common task patterns

### Changed

- **`INSTATCR-MASTER-PRD.md`** - Transformed into navigation hub
  - Reduced from 5,275 lines → 166 lines (~97% reduction)
  - Now serves as documentation index with role-based navigation
  - Links to all 6 PRD files
  - Contains precedence rules and "The Critical Rule"

- **`DEV-ROADMAP.md`** - Updated Resources section
  - Added links to AGENTS.md and docs/prd/
  - Updated INSTATCR-MASTER-PRD.md description to "Documentation navigation hub"

---

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
