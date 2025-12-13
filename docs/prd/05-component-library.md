# Component Library

**Version:** 2.9 (Updated for V1.9.0)
**Last Updated:** 2025-12-13
**Status:** Complete
**Audience:** Frontend engineers, component library maintainers

---

## Table of Contents

1. [UI Components](#ui-components)
   - [StatusBadge](#component-statusbadge)
   - [Button](#component-button)
   - [Input](#component-input)
   - [Card](#component-card)
   - [FloatingActionButton](#component-floatingactionbutton-fab)
   - [TabBar](#component-tabbar)
   - [MobileDrawer](#component-mobiledrawer)
   - [BottomSheet](#component-bottomsheet)
   - [StatCard](#component-statcard)
   - [MobileJobCard](#component-mobilejobcard)
   - [TimelineMessage](#component-timelinemessage)

2. [Interactive Components (V1.0.5+)](#interactive-components-v105)
   - [DriverPassengerChoice](#component-driverpassengerchoice)
   - [PassengerMiniForm](#component-passengermini-form)
   - [CHPNudge](#component-chpnudge)

3. [Flow Wizard Components (V1.1.0+)](#flow-wizard-components-v110)
   - [FlowWizard](#component-flowwizard)
   - [SpeedUpPrompt](#component-speedupprompt)
   - [CrashDetailsForm](#component-crashdetailsform)
   - [PassengerVerificationForm](#component-passengerverificationform)

4. [Rescue Flow Components (V1.2.0+)](#rescue-flow-components-v120)
   - [DriverInfoRescueForm](#component-driverinforescueform)

5. [Unified Form Components (V1.0.7+)](#unified-form-components-v107)
   - [InlineFieldsCard](#component-inlinefieldscard)

6. [Manual Pickup & Fatal Report Components (V1.6.0+)](#manual-pickup--fatal-report-components-v160)
   - [FacePageCompletionChoice](#component-facepagecompletionchoice)
   - [FacePageReopenBanner](#component-facepagereopenbanner)
   - [AuthorizationUploadCard](#component-authorizationuploadcard)
   - [PickupScheduler](#component-pickupscheduler)

7. [Escalation & Notification Components (V1.7.0-V1.9.0)](#escalation--notification-components-v170-v190)
   - [EscalationQuickActions](#component-escalationquickactions)
   - [StepProgress](#component-stepprogress)
   - [ManualCompletionSheet](#component-manualcompletionsheet)
   - [NotificationBell](#component-notificationbell)
   - [NotificationItem](#component-notificationitem)
   - [AutoCheckSetupFlow](#component-autochecksetupflow)

8. [Helper Functions & Utilities](#helper-functions--utilities)
   - [getPublicStatus](#function-getpublicstatus)
   - [formatRelativeTime](#function-formatrelativetime)
   - [splitClientName](#function-splitclientname)
   - [deriveNcic](#function-derivencic)
   - [convertDateForApi](#function-convertdateforapi)
   - [Authorization Helpers (V1.9.0)](#authorization-helpers-v190)
   - [Validation Functions](#validation-functions)

9. [Component Systems](#component-systems)
   - [Toast Notification System](#component-system-toast-notifications)
   - [Skeleton Loading System](#component-system-skeleton-loading-states)
   - [Error State Components](#component-system-error-state-components)
   - [Text Utilities](#component-system-text-utilities)

---

## UI Components

### Component: StatusBadge

**File:** `src/components/ui/StatusBadge.tsx`

**Purpose:** Display colored badge for job statuses and wrapper results.

#### Props

```typescript
interface StatusBadgeProps {
  status: string;
  type?: 'public' | 'internal' | 'result';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;  // For animated states
}
```

#### Color Mapping

**Job Statuses:**

| Status | Color | CSS Classes |
|--------|-------|-------------|
| REPORT_READY, COMPLETED_* | Green | `bg-green-100 text-green-800` |
| CONTACTING_CHP, IN_PROGRESS, AUTOMATION_RUNNING | Blue | `bg-blue-100 text-blue-800` |
| FACE_PAGE_READY, FACE_PAGE_ONLY, WAITING_* | Yellow | `bg-yellow-100 text-yellow-800` |
| NEEDS_INFO, NEEDS_MORE_INFO | Amber | `bg-amber-100 text-amber-800` |
| CANCELLED | Red | `bg-red-100 text-red-800` |
| SUBMITTED, NEW, Default | Gray | `bg-gray-100 text-gray-800` |

**Wrapper Result Types (V1.2.0+):**

| Result | Color | CSS Classes |
|--------|-------|-------------|
| FULL | Green | `bg-green-100 text-green-800 border-green-300` |
| FACE_PAGE | Yellow | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| PAGE1_NOT_FOUND | Amber | `bg-amber-100 text-amber-800 border-amber-300` |
| PAGE2_VERIFICATION_FAILED | Amber | `bg-amber-100 text-amber-800 border-amber-300` |
| PORTAL_ERROR | Red | `bg-red-100 text-red-800 border-red-300` |
| AUTOMATION_RUNNING | Blue + pulse | `bg-blue-100 text-blue-800 animate-pulse` |

#### Usage

```tsx
<StatusBadge status="CONTACTING_CHP" type="public" />
<StatusBadge status="FULL" type="result" />
<StatusBadge status="AUTOMATION_RUNNING" pulse />
```

---

### Component: Button

**File:** `src/components/ui/Button.tsx`

#### Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

#### Variants

| Variant | Appearance | Use Case |
|---------|------------|----------|
| primary | Solid background, primary color | Main actions (Submit, Save) |
| secondary | Lighter background | Secondary actions |
| outline | Border only, transparent bg | Tertiary actions |
| ghost | No border, transparent | Icon buttons, subtle actions |
| danger | Red background | Destructive actions (Cancel, Delete) |

#### Responsive Behavior

| Breakpoint | Height | Padding |
|------------|--------|---------|
| Mobile (< 768px) | 48px | px-6 py-3 |
| Desktop (≥ 768px) | 40px | px-4 py-2 |

#### Touch Target

Minimum 44x44px on all devices (WCAG requirement).

---

### Component: Input

**File:** `src/components/ui/Input.tsx`

#### Props

```typescript
interface InputProps {
  label: string;
  type?: 'text' | 'date' | 'time' | 'email' | 'tel' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  inputMode?: 'text' | 'numeric' | 'tel';
  autoComplete?: string;
}
```

#### Layout

```
┌─────────────────────────────────────────┐
│ Label *                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Placeholder text                    │ │
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │
└─────────────────────────────────────────┘
```

#### Responsive Behavior

| Breakpoint | Height | Font Size |
|------------|--------|-----------|
| Mobile (< 768px) | 48px | 16px (prevents zoom on iOS) |
| Desktop (≥ 768px) | 40px | 14px |

#### States

| State | Border Color | Background |
|-------|--------------|------------|
| Default | gray-300 | white |
| Focus | blue-500 | white |
| Error | red-500 | red-50 |
| Disabled | gray-200 | gray-100 |

---

### Component: Card

**File:** `src/components/ui/Card.tsx`

#### Props

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  tappable?: boolean;
  onClick?: () => void;
  borderColor?: string;  // For status-based left border
}
```

#### Styling

```css
/* Base card styles */
.card {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm;
}

/* Hover effect */
.card-hover {
  @apply hover:shadow-md transition-shadow duration-200;
}

/* Tappable (for touch feedback) */
.card-tappable {
  @apply active:scale-[0.98] transition-transform duration-100;
}

/* Status border */
.card-status-border {
  @apply border-l-4;
}
```

---

### Component: FloatingActionButton (FAB)

**File:** `src/components/ui/FloatingActionButton.tsx`

#### Props

```typescript
interface FABProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label?: string;  // For accessibility
  variant?: 'primary' | 'secondary';
}
```

#### Behavior

- Fixed position: bottom-right (20px from edges)
- Size: 56x56px minimum
- Only visible on mobile (hidden on desktop via `md:hidden`)
- Shadow for elevation
- Scale animation on tap

#### CSS

```css
.fab {
  @apply fixed bottom-5 right-5 z-50;
  @apply w-14 h-14 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-primary text-white shadow-lg;
  @apply active:scale-95 transition-transform;
  @apply md:hidden;
}
```

---

### Component: TabBar

**File:** `src/components/ui/TabBar.tsx`

#### Props

```typescript
interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  sticky?: boolean;
}
```

#### Behavior

- Horizontal tabs, full width
- Evenly distributed (flex, equal widths)
- Active tab has bottom border indicator
- Sticky to top when scrolling (optional)
- Touch-friendly (48px height)

#### Layout

```
┌─────────────────────────────────────────┐
│ [  Tab 1  ] [  Tab 2  ] [  Tab 3  ]    │
│ ───────────
└─────────────────────────────────────────┘
         ↑ Active indicator
```

---

### Component: MobileDrawer

**File:** `src/components/layout/MobileDrawer.tsx`

#### Props

```typescript
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: number;  // Default: 280px
}
```

#### Behavior

- Slides in from left (or right)
- Width: 280px default
- Backdrop overlay (click to close)
- Escape key closes
- Trap focus when open
- Animate: slide + fade

---

### Component: BottomSheet

**File:** `src/components/ui/BottomSheet.tsx`

#### Props

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full';
}
```

#### Behavior

- Slides up from bottom
- Rounded top corners
- Drag handle for dismissal
- Backdrop overlay
- Mobile only (desktop uses modal)

---

### Component: StatCard

**File:** `src/components/ui/StatCard.tsx`

#### Props

```typescript
interface StatCardProps {
  label: string;
  value: number | string;
  color?: 'default' | 'green' | 'amber' | 'blue' | 'red';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}
```

#### Layout

```
┌─────────────────┐
│ 📊 Total Jobs   │
│                 │
│      15         │
│                 │
└─────────────────┘
```

---

### Component: MobileJobCard

**File:** `src/components/ui/MobileJobCard.tsx`

#### Props

```typescript
interface MobileJobCardProps {
  job: Job;
  onClick: () => void;
  showLawFirm?: boolean;  // For staff view
  showInternalStatus?: boolean;  // For staff view
}
```

#### Layout

```
┌─────────────────────────────────────────┐
│ ┃ Dora Cruz-Arteaga                     │ ← Status border color
│ ┃ 9465-2025-02802                       │
│ ┃ Smith & Associates    (staff only)    │
│ ┃ [SUBMITTED]           2 hours ago     │
└─────────────────────────────────────────┘
```

---

### Component: TimelineMessage

**File:** `src/components/ui/TimelineMessage.tsx`

**Purpose:** Display chat-style timeline messages with icons and animations.

#### Props

```typescript
interface TimelineMessageProps {
  message: string;
  timestamp: number;
  eventType: EventType;
  isInteractive?: boolean;
  children?: React.ReactNode;  // For embedded forms
}
```

#### Event Type Icon Mapping

| Event Type | Icon | Color |
|------------|------|-------|
| `job_created` | FileText | cyan-400 |
| `status_change` | RefreshCw | blue-400 |
| `page1_updated` | FileText | cyan-400 |
| `page2_updated` | UserCheck | cyan-400 |
| `wrapper_triggered` | Sparkles | purple-400 |
| `wrapper_completed` | CheckCircle2 | emerald-400 |
| `file_uploaded` | Upload | teal-400 |
| `check_requested` | RefreshCw | violet-400 |
| `escalated` | AlertTriangle | amber-400 |
| `completed` | CheckCircle | emerald-400 |
| `message` | MessageCircle | slate-400 |
| `driver_passenger_prompt` | Users | teal-400 |
| `driver_selected` | User | teal-400 |
| `passenger_selected` | Users | teal-400 |
| `passenger_data_provided` | CheckCircle2 | emerald-400 |
| `chp_nudge_shown` | Phone | cyan-400 |
| `page1_details_request` | MessageCircle | teal-400 |
| `auto_wrapper_triggered` | Sparkles | purple-400 |
| `auto_wrapper_success` | CheckCircle2 | emerald-400 |
| `auto_wrapper_failed` | XCircle | red-400 |
| `flow_speedup_prompt` | Zap | amber-400 |
| `flow_speedup_yes` | CheckCircle2 | emerald-400 |
| `flow_speedup_no` | ArrowRight | slate-400 |
| `flow_crash_details_saved` | FileText | cyan-400 |
| `flow_verification_saved` | UserCheck | cyan-400 |
| `flow_completed` | Sparkles | emerald-400 |
| `page1_not_found` | AlertCircle | amber-400 |
| `page2_verification_needed` | AlertCircle | amber-400 |
| `rescue_info_saved` | CheckCircle2 | emerald-400 |
| `rescue_wrapper_triggered` | Sparkles | purple-400 |

---

## Interactive Components (V1.0.5+)

### Component: DriverPassengerChoice

**File:** `src/components/ui/DriverPassengerChoice.tsx`

**Purpose:** Two-button selection for driver vs passenger in timeline.

#### Props

```typescript
interface DriverPassengerChoiceProps {
  onSelect: (type: 'driver' | 'passenger') => void;
  disabled?: boolean;
}
```

#### Features
- Driver button (User icon, teal gradient)
- Passenger button (Users icon, cyan gradient)
- Glass-morphism dark styling
- 48px touch targets on mobile

---

### Component: PassengerMiniForm

**File:** `src/components/ui/PassengerMiniForm.tsx`

**Purpose:** Compact form for passengers to provide verification data.

#### Props

```typescript
interface PassengerMiniFormProps {
  clientName: string;
  onSubmit: (data: PassengerProvidedData) => void;
  onSkip?: () => void;
}
```

#### Fields
- Client name (display only)
- License Plate (optional)
- Driver License (optional)
- VIN (optional)

#### Features
- Skip nudge modal with warning
- "I don't have this information" button
- At least 1 field required to submit (unless skip)

---

### Component: CHPNudge

**File:** `src/components/ui/CHPNudge.tsx`

**Purpose:** Dismissible info card encouraging CHP call.

#### Props

```typescript
interface CHPNudgeProps {
  reportNumber: string;
  onDismiss: () => void;
}
```

#### Features
- Phone icon with friendly message
- Report number in monospace teal
- X button to dismiss
- Auto-hides when status changes from NEW

---

## Flow Wizard Components (V1.1.0+)

### Component: FlowWizard

**File:** `src/components/ui/FlowWizard.tsx`

**Purpose:** Step-by-step orchestrator for law firm job flow.

#### Props

```typescript
interface FlowWizardProps {
  job: Job;
  onStepChange: (step: FlowStep, data?: any) => void;
  onComplete: (data: FlowCompletionData) => void;
  disabled?: boolean;
}
```

#### Flow Steps
| Step | Component | Path |
|------|-----------|------|
| `selection` | DriverPassengerChoice | Both |
| `verification` | PassengerVerificationForm | Passenger only |
| `speedup` | SpeedUpPrompt | Both |
| `crash_details` | CrashDetailsForm | If speed-up accepted |
| `done` | (wizard hidden) | Both |

---

### Component: SpeedUpPrompt

**File:** `src/components/ui/SpeedUpPrompt.tsx`

**Purpose:** Binary yes/no choice for sharing crash details.

#### Props

```typescript
interface SpeedUpPromptProps {
  onYes: () => void;
  onNo: () => void;
}
```

#### Features
- Zap icon (amber)
- "Yes, I have details" (primary)
- "No thanks" (secondary)
- Stacked on mobile, side-by-side on desktop

---

### Component: CrashDetailsForm

**File:** `src/components/ui/CrashDetailsForm.tsx`

**Purpose:** Focused crash details form (date, time, officer ID).

#### Props

```typescript
interface CrashDetailsFormProps {
  initialData?: { crashDate?: string; crashTime?: string; officerId?: string };
  onSubmit: (data: CrashDetails) => void;
  onSkip?: () => void;
}
```

#### Fields
- Crash Date (optional)
- Crash Time - HHMM format (optional)
- Officer ID (optional)

#### Features
- Button: "Save & Check for Report" (V1.2.0+)
- Loading state: "Checking CHP..."
- Search icon
- "Skip this step" link
- ALL fields optional

---

### Component: PassengerVerificationForm

**File:** `src/components/ui/PassengerVerificationForm.tsx`

**Purpose:** Enhanced passenger verification with repeatable names.

#### Props

```typescript
interface PassengerVerificationFormProps {
  clientName: string;
  onSubmit: (data: PassengerVerificationData) => void;
  onSkip?: () => void;
}
```

#### Features
- Your Name display (read-only)
- "Other people involved" section with + Add / × Remove
- Vehicle info: Plate, License, VIN
- ALL fields optional
- "I don't have any of this information" skip link

---

## Rescue Flow Components (V1.2.0+)

### Component: DriverInfoRescueForm

**File:** `src/components/ui/DriverInfoRescueForm.tsx`

**Purpose:** Rescue form for Page 2 verification failures.

#### Props

```typescript
interface DriverInfoRescueFormProps {
  onSubmit: (data: RescueFormData) => void;
}
```

#### Sections
1. **Header:** Amber-styled explanation
   - "We found your report, but need additional identifiers to verify and retrieve it"
2. **Vehicle/ID Section:** License Plate, Driver's License, VIN
3. **Additional Names Section:** Repeatable name rows

#### Features
- "+ Add another name" button
- Trash icon to remove rows
- Button: "Save & Check Again"
- Loading state: "Checking CHP..."
- Disabled when no data provided

---

## Unified Form Components (V1.0.7+)

### Component: InlineFieldsCard

**File:** `src/components/ui/InlineFieldsCard.tsx`

**Purpose:** Always-visible unified form for Page 1 + Page 2 fields.

#### Props

```typescript
interface InlineFieldsCardProps {
  job: Job;
  onSave: (data: { page1: Page1Data; page2: Page2Data }) => void;
  disabled?: boolean;
}
```

#### Sections
1. **Crash Details (Page 1):** crashDate, crashTime (HHMM), officerId
2. **Driver Information (Page 2):** firstName, lastName, plate, driverLicense, vin

#### Features
- No edit mode - fields always visible
- Single "Save & Check for Report" button
- HHMM time validation (0000-2359)
- Disabled state for flow gate

---

## Manual Pickup & Fatal Report Components (V1.6.0+)

### Component: FacePageCompletionChoice

**File:** `src/components/ui/FacePageCompletionChoice.tsx`

**Purpose:** Offers law firms two options when face page is received: complete with face page only, or wait for full report.

#### Props

```typescript
interface FacePageCompletionChoiceProps {
  onComplete: () => void;       // "This is all I need"
  onWaitForFull: () => void;    // "Wait for full report"
  isSubmitting: boolean;
}
```

#### Features
- Two-button choice card with glass-morphism styling
- "This is all I need" (emerald gradient) → Completes job with `COMPLETED_FACE_PAGE_ONLY`
- "Wait for full report" (blue gradient) → Sets up auto-checker
- Mobile: Stacked buttons, Desktop: Side-by-side
- Loading states during submission

---

### Component: FacePageReopenBanner

**File:** `src/components/ui/FacePageReopenBanner.tsx`

**Purpose:** Compact banner allowing law firms to reopen completed-with-face-page jobs to check for full report.

#### Props

```typescript
interface FacePageReopenBannerProps {
  lastCheckedAt: number;        // Timestamp of last check
  onCheckNow: () => void;
  isChecking: boolean;
}
```

#### Features
- Shows relative time since last check
- "Check Now" button to search for full report
- Amber/yellow theme for visibility
- Conditional rendering based on job status
- Auto-hides after 7 days or if full report found

---

### Component: AuthorizationUploadCard

**File:** `src/components/ui/AuthorizationUploadCard.tsx`

**Purpose:** Law firm-facing card for uploading authorization documents for escalated/fatal jobs. **CRITICAL:** Uses ONLY friendly messaging (no technical jargon like "escalation" or "in-person pickup").

#### Props

```typescript
interface AuthorizationUploadCardProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}
```

#### Features
- Amber glass card with Upload icon
- Friendly heading: "We Need Your Help"
- Message: "To complete your request, we need an authorization document"
- PDF drag-and-drop upload with validation
- File preview with remove button
- Upload state management
- Mobile-responsive design

#### Design Notes
- **NO** mention of "escalation", "manual pickup", "in-person retrieval", or other internal terms
- Focuses on partnership: "help us help you" framing
- Simple, stress-free language

---

### Component: PickupScheduler

**File:** `src/components/ui/PickupScheduler.tsx`

**Purpose:** Staff-only component for claiming and scheduling in-person pickups at CHP offices.

#### Props

```typescript
interface PickupSchedulerProps {
  escalationData: EscalationData;
  onClaim: () => void;
  onSchedule: (time: PickupTimeSlot, date: string, notes?: string) => void;
  onDownloadAuth: () => void;
  isClaiming: boolean;
  isScheduling: boolean;
}
```

#### Features
- Two-phase UI: Claim button → Scheduling form
- Quick time slots: "9am", "afternoon", "4pm"
- Date options: Today, Next Business Day, Custom picker
- Mon-Fri only validation (government building hours)
- Download authorization document button
- Pickup notes textarea
- Confirm Schedule button
- Shows current status (claimed by, scheduled time/date)

#### Workflow States
1. **Pending Authorization**: Waiting for law firm to upload auth doc
2. **Authorization Received**: Ready for staff to claim
3. **Claimed**: Staff claimed, needs scheduling
4. **Pickup Scheduled**: Time/date set, ready for pickup
5. **Completed**: Pickup completed, report uploaded

---

## Escalation & Notification Components (V1.7.0-V1.9.0)

### Component: EscalationQuickActions

**File:** `src/components/ui/EscalationQuickActions.tsx`

**Purpose:** Mobile-first quick action workflow for escalated jobs. Sequential step-by-step process for staff to complete manual pickups without navigating away from the card.

#### Props

```typescript
interface EscalationQuickActionsProps {
  job: Job;
  onUpdate: (updates: Partial<Job>) => void;
}
```

#### Features

**Workflow Steps:**
1. **Claim** - Staff claims the pickup assignment
2. **Schedule** - Choose pickup time/date via BottomSheet
3. **Download Auth** - Download law firm authorization document
4. **Upload** - Upload face page or full report via BottomSheet
5. **Auto-check** - (Optional, non-fatal only) Check if full report available

**UI Characteristics:**
- 48px touch targets (WCAG AAA compliant)
- Sequential workflow (each step disappears after completion)
- Visual progress with StepProgress component
- Mobile-optimized BottomSheet modals
- Fatal jobs skip auto-check (4 steps vs 5)

**Authorization Gate (V1.9.0):**
- Quick actions gated behind authorization upload
- Jobs WITH authorization: Show full workflow buttons
- Jobs WITHOUT authorization: Show amber "Waiting for Authorization" message

#### Workflow Logic

```typescript
// Step determination
if (authDocumentAcknowledged && facePageToken && !isFatal && !fullReportToken) return 'auto_check';
if (authDocumentAcknowledged) return 'upload_report';
if (scheduledPickupTime && authorizationDocumentToken) return 'download_auth';
if (claimedBy && !scheduledPickupTime) return 'schedule';
return 'claim';
```

---

### Component: StepProgress

**File:** `src/components/ui/StepProgress.tsx`

**Purpose:** Visual progress indicator showing workflow completion with dot-based UI.

#### Props

```typescript
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}
```

#### Features

- **Completed steps**: Green dots
- **Current step**: Pulsing orange dot
- **Pending steps**: Gray dots
- Adapts to workflow (4 steps for fatal, 5 for non-fatal)
- Accessible labels for screen readers

---

### Component: ManualCompletionSheet

**File:** `src/components/ui/ManualCompletionSheet.tsx`

**Purpose:** BottomSheet content for staff to upload face page or full report after manual pickup.

#### Props

```typescript
interface ManualCompletionSheetProps {
  jobId: string;
  onUpload: (file: File, reportType: 'face' | 'full') => void;
  isUploading: boolean;
}
```

#### Features

- Two-tab interface: Face Page vs Full Report
- PDF drag-and-drop upload
- File preview with remove button
- Upload validation
- Solid slate-900 background for contrast (V1.7.0 fix)

---

### Component: NotificationBell

**File:** `src/components/ui/NotificationBell.tsx`

**Purpose:** Bell icon with unread count badge in header. Displays notification dropdown panel with quick actions.

#### Props

```typescript
interface NotificationBellProps {
  userId?: string;  // For filtering by recipient
}
```

#### Features

- **Bell icon** with unread count badge
- **Dropdown panel** showing notification list
- **Quick action buttons** that simulate magic links
- **Dev mode** shows ALL notifications regardless of recipient
- Click outside to close
- Supports 6 notification types (escalation, auth upload, pickup claimed/scheduled, report ready)

#### Notification Types

1. `ESCALATION_STARTED` - Job escalated (manual, auto, or fatal)
2. `AUTHORIZATION_REQUESTED` - System prompts law firm for auth doc
3. `AUTHORIZATION_UPLOADED` - Law firm uploads authorization (V1.9.0 triggers email stub)
4. `PICKUP_CLAIMED` - Staff claims the pickup
5. `PICKUP_SCHEDULED` - Staff schedules pickup time
6. `REPORT_READY` - Staff uploads report (face or full)

---

### Component: NotificationItem

**File:** `src/components/ui/NotificationItem.tsx`

**Purpose:** Individual notification card with icon, message, timestamp, and quick action buttons.

#### Props

```typescript
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onActionClick: (notification: Notification) => void;
}
```

#### Features

- Type-based icon and color coding
- Relative timestamp display
- Quick action buttons (view job, upload auth, download report)
- Read/unread visual distinction
- Responsive text truncation

---

### Component: AutoCheckSetupFlow

**File:** `src/components/ui/AutoCheckSetupFlow.tsx`

**Purpose:** Inline setup flow for law firms to configure auto-checker frequency when waiting for full report.

#### Props

```typescript
interface AutoCheckSetupFlowProps {
  onSave: (frequency: 'daily' | 'twice_daily') => void;
  onCancel: () => void;
  isSaving: boolean;
}
```

#### Features (V1.8.1)

- **Renamed CTA**: "Set Up Auto Checker" (was "Wait for full report")
- **Two frequency options** side-by-side:
  - Daily: 4:30 PM PT
  - Twice Daily: 9 AM & 4:30 PM PT
- **Fixed times** displayed as badges (not editable)
- "Save Settings" button to confirm
- "Back" button to return to choice screen
- **Always-visible settings** after setup
- **Dynamic activity feed messages** based on configured frequency

#### Usage

```tsx
<AutoCheckSetupFlow
  onSave={(frequency) => handleEnableAutoCheck(frequency)}
  onCancel={() => setShowSetup(false)}
  isSaving={isSubmitting}
/>
```

---

### Component: StaffJobCard (Authorization Badge Enhancement)

**File:** `src/components/ui/StaffJobCard.tsx`

**Purpose:** Displays authorization status badges on escalated jobs to indicate actionability (V1.9.0).

#### Authorization Status Badges

**Three states:**

| Status | Badge Label | Color | Description |
|--------|-------------|-------|-------------|
| Ready to Claim | "Ready to Claim" | 🟢 Emerald | Auth uploaded, not claimed yet |
| In Progress | "In Progress" | 🔵 Blue | Auth uploaded, claimed/scheduled |
| Pending Authorization | "Pending Authorization" | 🟡 Amber | No auth yet |

#### Helper Functions

Uses authorization helpers from `jobUIHelpers.ts`:
- `hasAuthorizationUploaded()` - Check if auth exists
- `isReadyToClaim()` - Check if ready for claim
- `isPendingAuthorization()` - Check if awaiting auth
- `getAuthorizationStatusLabel()` - Get badge label
- `getAuthorizationStatusColor()` - Get badge color

---

### Service: emailNotificationService (V1.9.0)

**File:** `src/lib/emailNotificationService.ts`

**Purpose:** Email notification service stub ready for V2 integration with Resend/SendGrid.

#### API

```typescript
interface EmailNotificationService {
  sendAuthorizationUploadNotification(jobId: string, lawFirmName: string): Promise<void>;
}
```

#### V1 Behavior

- Console logs only (development)
- Wired into `notificationManager.emitAuthorizationUploaded()`
- Ready for V2 integration

#### V2 Migration Path

- Same async function signature
- Swap console.log for real email provider API calls
- Thread management via `In-Reply-To` header
- Magic links become real deep links with HMAC signatures

---

## Helper Functions & Utilities

### Function: getPublicStatus

Converts internal status to law firm-friendly public status.

```typescript
const statusMapping: Record<InternalStatus, PublicStatus> = {
  'NEW': 'IN_PROGRESS',  // V1.0.6+: Changed from SUBMITTED to IN_PROGRESS
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

export function getPublicStatus(internalStatus: InternalStatus): PublicStatus {
  return statusMapping[internalStatus] || 'IN_PROGRESS';
}
```

---

### Function: formatRelativeTime

Converts timestamp to human-readable relative time.

```typescript
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else {
    // Format as date
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
```

---

### Function: splitClientName

Splits full name into first and last name for Page 2 auto-population.

```typescript
export function splitClientName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(' ');

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');

  return { firstName, lastName };
}

// Examples:
// "Dora Cruz-Arteaga" → { firstName: "Dora", lastName: "Cruz-Arteaga" }
// "Mary Jane Smith" → { firstName: "Mary Jane", lastName: "Smith" }
// "John" → { firstName: "John", lastName: "" }
```

---

### Function: deriveNcic

Extracts NCIC from report number.

```typescript
export function deriveNcic(reportNumber: string): string {
  // Report format: "9XXX-YYYY-ZZZZZ"
  // NCIC is first 4 characters
  return reportNumber.substring(0, 4);
}

// Examples:
// "9465-2025-02802" → "9465"
// "9220-2024-12345" → "9220"
```

---

### Function: convertDateForApi

Converts HTML5 date input format to CHP wrapper API format.

```typescript
export function convertDateForApi(htmlDate: string): string {
  // HTML5 <input type="date"> returns: "YYYY-MM-DD"
  // CHP wrapper expects: "MM/DD/YYYY"

  if (!htmlDate) return '';

  const [year, month, day] = htmlDate.split('-');
  return `${month}/${day}/${year}`;
}

// Examples:
// "2025-12-01" → "12/01/2025"
// "2024-03-15" → "03/15/2024"
```

---

### Authorization Helpers (V1.9.0)

**File:** `src/lib/jobUIHelpers.ts`

**Purpose:** Helper functions for authorization gate workflow and three-tier sorting system.

#### Function: hasAuthorizationUploaded

Check if authorization document has been uploaded for an escalated job.

```typescript
export function hasAuthorizationUploaded(job: Job): boolean {
  return !!(job.escalationData?.authorizationDocumentToken);
}
```

---

#### Function: isReadyToClaim

Check if job is ready for staff to claim (auth uploaded, not claimed yet).

```typescript
export function isReadyToClaim(job: Job): boolean {
  const hasAuth = hasAuthorizationUploaded(job);
  const notClaimed = !job.escalationData?.claimedBy;
  return hasAuth && notClaimed;
}
```

---

#### Function: isPendingAuthorization

Check if job is awaiting authorization upload.

```typescript
export function isPendingAuthorization(job: Job): boolean {
  return !hasAuthorizationUploaded(job);
}
```

---

#### Function: getAuthorizationStatusLabel

Get display label for authorization status badge.

```typescript
export function getAuthorizationStatusLabel(job: Job): string {
  if (isReadyToClaim(job)) return 'Ready to Claim';
  if (hasAuthorizationUploaded(job)) return 'In Progress';
  return 'Pending Authorization';
}
```

---

#### Function: getAuthorizationStatusColor

Get badge color for authorization status.

```typescript
export function getAuthorizationStatusColor(job: Job): 'emerald' | 'blue' | 'amber' {
  if (isReadyToClaim(job)) return 'emerald';  // 🟢 Green
  if (hasAuthorizationUploaded(job)) return 'blue';  // 🔵 Blue
  return 'amber';  // 🟡 Amber
}
```

**Three-Tier Sorting (Staff Dashboard):**

These helpers power the three-tier sorting system for escalated jobs:
- **Tier 1 (TOP)**: Ready to Claim - `isReadyToClaim()` returns true
- **Tier 2 (MIDDLE)**: In Progress - `hasAuthorizationUploaded()` returns true, but claimed
- **Tier 3 (BOTTOM)**: Pending Authorization - `isPendingAuthorization()` returns true

---

### Validation Functions

#### Function: validateReportNumber

Validates report number format.

```typescript
export function validateReportNumber(reportNumber: string): { valid: boolean; error?: string } {
  // Format: 9XXX-YYYY-ZZZZZ
  const regex = /^9\d{3}-\d{4}-\d{5}$/;

  if (!reportNumber) {
    return { valid: false, error: 'Report number is required' };
  }

  if (!regex.test(reportNumber)) {
    return { valid: false, error: 'Format must be 9XXX-YYYY-ZZZZZ (e.g., 9465-2025-02802)' };
  }

  return { valid: true };
}
```

#### Function: validateOfficerId

Validates officer ID format.

```typescript
export function validateOfficerId(officerId: string): { valid: boolean; error?: string } {
  // Must be 6 digits, starting with "0"
  const regex = /^0\d{5}$/;

  if (!officerId) {
    return { valid: false, error: 'Officer ID is required' };
  }

  if (!regex.test(officerId)) {
    return { valid: false, error: 'Must be 6 digits starting with 0 (e.g., 012345)' };
  }

  return { valid: true };
}
```

#### Function: validateCrashTime

Validates crash time format.

```typescript
export function validateCrashTime(time: string): { valid: boolean; error?: string } {
  // Must be 4 digits, valid 24-hour time
  const regex = /^\d{4}$/;

  if (!time) {
    return { valid: false, error: 'Crash time is required' };
  }

  if (!regex.test(time)) {
    return { valid: false, error: 'Must be 4 digits in 24-hour format (e.g., 1430)' };
  }

  const hours = parseInt(time.substring(0, 2));
  const minutes = parseInt(time.substring(2, 4));

  if (hours > 23 || minutes > 59) {
    return { valid: false, error: 'Invalid time (hours 00-23, minutes 00-59)' };
  }

  return { valid: true };
}
```

---

## Component Systems

### Component System: Toast Notifications

**Files:**
- `src/context/ToastContext.tsx`
- `src/components/ui/Toast/Toast.tsx`
- `src/components/ui/Toast/ToastContainer.tsx`

**Purpose:** Display user feedback for form submissions, file uploads, automation actions, and error states. Uses glass-morphism design with auto-dismiss and progress indicators.

#### Toast Types & API

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Use the useToast hook
const { toast } = useToast();

// Convenience methods
toast.success('Report submitted successfully');
toast.error('Failed to upload file');
toast.warning('This action cannot be undone');
toast.info('Processing your request...');
```

#### Features
- **4 Toast Types:** success (green), error (red), warning (amber), info (blue)
- **Auto-Dismiss:** Configurable duration (default 4000ms) with progress bar animation
- **Action Button:** Optional button for toast-triggered actions
- **Glass-Morphism:** Frosted glass effect (`bg-slate-800/50 backdrop-blur-xl`)
- **Portal-Based:** Renders outside DOM flow to avoid z-index issues
- **Responsive:** Bottom-center (mobile) / top-right (desktop)
- **Accessible:** ARIA labels, keyboard-dismissible, screen reader announcements

#### Usage Examples

**Form Submission:**
```typescript
try {
  await submitForm(formData);
  toast.success('Request submitted successfully');
  router.push('/law');
} catch (error) {
  toast.error('Failed to submit request. Please try again.');
}
```

**Staff Actions:**
```typescript
toast.info('Running wrapper...');
await runWrapper(jobId);
toast.success('Wrapper completed');
```

---

### Component System: Skeleton Loading States

**Files:** `src/components/ui/Skeleton/` (SkeletonBase, SkeletonText, SkeletonCard, JobCardSkeleton, StatCardSkeleton, TimelineItemSkeleton)

**Purpose:** Provide composable skeleton components for loading states, improving perceived performance while data loads.

#### Composable Primitives

```typescript
// Base shimmer element
<SkeletonBase width="100%" height={20} rounded="md" />

// Text placeholders (1-4 lines)
<SkeletonText lines={3} gap="md" width="80%" />

// Card container
<SkeletonCard>
  <SkeletonBase height={100} />
  <SkeletonText lines={2} />
</SkeletonCard>
```

#### Pre-Built Variants
- **JobCardSkeleton:** Mobile card and table-row variants for job lists
- **StatCardSkeleton:** Dashboard stat card placeholders
- **TimelineItemSkeleton:** Timeline message placeholders

#### Integration
```typescript
{isLoading ? (
  [1,2,3,4].map(i => <JobCardSkeleton key={i} />)
) : (
  jobs.map(job => <MobileJobCard key={job._id} job={job} />)
)}
```

---

### Component System: Error State Components

**File:** `src/components/ui/ErrorState.tsx`

**Purpose:** Display user-friendly error messages for various failure scenarios with consistent UI.

#### Error Variants

| Variant | Icon | Title | Use Case |
|---------|------|-------|----------|
| default | AlertTriangle (amber) | "Something went wrong" | Generic errors |
| network | WifiOff (red) | "Connection lost" | Network/offline errors |
| notFound | FileX (slate) | "Not found" | 404 errors |
| server | ServerCrash (red) | "Server error" | 5xx server errors |

#### Usage

```typescript
// Specific error types
<NetworkError onRetry={handleRetry} />
<NotFoundError />
<ServerError />

// Generic with variant
<ErrorState variant="network" onRetry={handleRetry} />

// Custom error
<ErrorState
  title="Submission Failed"
  message={apiError}
  onRetry={handleRetry}
  compact
/>
```

#### Styling
- Glass-morphism container (`glass-card-dark rounded-2xl`)
- Icon background (`bg-slate-800/50`)
- Accessible (`role="alert"`, `aria-live="polite"`)

---

### Component System: Text Utilities

#### Component: Tooltip

**File:** `src/components/ui/Tooltip.tsx`

Display additional context on hover/focus with viewport-aware positioning.

```typescript
<Tooltip content="This is a helpful tip" position="top" delay={300}>
  <button>Hover me</button>
</Tooltip>
```

**Features:**
- Portal-based rendering (avoids overflow clipping)
- Keyboard-accessible (shows on focus, hides on blur)
- Viewport-aware (repositions if near screen edge)
- Customizable delay, position, max-width

#### Component: TruncatedText

**File:** `src/components/ui/TruncatedText.tsx`

Display text with line truncation and automatic tooltip on overflow.

```typescript
// Single-line truncation with tooltip
<TruncatedText text={job.clientName} lines={1} />

// Multi-line truncation (2-3 lines max)
<TruncatedText text={job.escalationNotes} lines={2} />
```

**Features:**
- Smart truncation (only shows tooltip if text overflows)
- Multi-line support (1, 2, or 3 line clamp)
- Resize-aware (rechecks truncation on window resize)

---

## Related Documents

- [01-product-foundation.md](01-product-foundation.md) - Core product specifications and business rules
- [02-business-logic.md](02-business-logic.md) - State management and job workflow logic
- [03-screen-specifications.md](03-screen-specifications.md) - Complete UI/UX specifications for all screens
- [04-chp-wrapper.md](04-chp-wrapper.md) - CHP wrapper API integration and automation details
- [INSTATCR-MASTER-PRD.md](../../INSTATCR-MASTER-PRD.md) - Complete master PRD (source document)

---

## Footer

This document is extracted from **INSTATCR-MASTER-PRD.md** (Part 5: Component Library). For complete product specifications, architecture diagrams, and user flows, refer to the master PRD document.

**Canonical Source:** Lines 2156-2924 in INSTATCR-MASTER-PRD.md

---

*Last synced: 2025-12-13*
