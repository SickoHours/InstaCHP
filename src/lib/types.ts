/**
 * Core TypeScript interfaces and types for InstaTCR
 */

// ============================================
// STATUS TYPES
// ============================================

/**
 * Internal status - 14 values visible to staff only
 * These reveal technical details about automation state
 */
export type InternalStatus =
  | 'NEW'
  | 'NEEDS_CALL'
  | 'CALL_IN_PROGRESS'
  | 'READY_FOR_AUTOMATION'
  | 'AUTOMATION_RUNNING'
  | 'FACE_PAGE_ONLY'
  | 'WAITING_FOR_FULL_REPORT'
  | 'COMPLETED_FULL_REPORT'
  | 'COMPLETED_MANUAL'
  | 'COMPLETED_FACE_PAGE_ONLY' // V1.6.0: Law firm chose to complete with just face page
  | 'NEEDS_MORE_INFO'
  | 'NEEDS_IN_PERSON_PICKUP'
  | 'AUTOMATION_ERROR'
  | 'CANCELLED';

/**
 * Public status - 8 values visible to law firms
 * Abstracts away technical implementation details
 */
export type PublicStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'CONTACTING_CHP'
  | 'FACE_PAGE_READY'
  | 'WAITING_FOR_REPORT'
  | 'REPORT_READY'
  | 'NEEDS_INFO'
  | 'CANCELLED';

/**
 * Status badge colors
 */
export type StatusColor = 'gray' | 'blue' | 'yellow' | 'green' | 'amber' | 'red';

/**
 * Status configuration for mapping internal -> public
 */
export interface StatusConfig {
  publicStatus: PublicStatus;
  color: StatusColor;
  message: string;
}

// ============================================
// CLIENT & JOB TYPES
// ============================================

/**
 * Type of party involved in the crash
 */
export type ClientType = 'driver' | 'passenger' | 'pedestrian' | 'other';

/**
 * Flow wizard step states
 */
export type FlowStep = 'selection' | 'verification' | 'speedup' | 'crash_details' | 'done';

/**
 * Passenger verification data collected during flow wizard
 */
export interface PassengerVerificationData {
  additionalNames: Array<{ firstName: string; lastName: string }>;
  plate?: string;
  driverLicense?: string;
  vin?: string;
}

/**
 * Rescue form data collected when Page 2 verification fails
 */
export interface RescueFormData {
  plate?: string;
  driverLicense?: string;
  vin?: string;
  additionalNames: Array<{ firstName: string; lastName: string }>;
}

/**
 * Interactive timeline state for law firm flow wizard (V1.0.5+)
 */
export interface InteractiveState {
  // Legacy fields (backward compatibility)
  driverPassengerAsked: boolean;
  chpNudgeDismissed: boolean;
  // Flow wizard tracking (V1.1.0+)
  flowStep?: FlowStep;
  speedUpOffered?: boolean;
  speedUpAccepted?: boolean;
  passengerVerification?: PassengerVerificationData;
  crashDetailsProvided?: boolean;
  flowCompletedAt?: number;
  // Rescue form tracking (V1.2.0+)
  rescueInfoProvided?: boolean;
  rescueInfoTimestamp?: number;
  rescueFormData?: RescueFormData;
  // Collapse/decline tracking (V1.3.0+)
  driverHelperCollapsed?: boolean;     // Driver declined, shows compact CTA
  passengerHelperCollapsed?: boolean;  // Passenger declined, shows compact CTA
  driverDeclineCount?: number;         // Times "No thanks" clicked (driver)
  passengerDeclineCount?: number;      // Times "No thanks" clicked (passenger)
}

// ============================================
// AUTO-CHECKER TYPES (V1.4.0+)
// ============================================

/**
 * Auto-checker scheduled time
 */
export interface AutoCheckTime {
  hour: number;    // 0-23 (California time)
  minute: number;  // 0-59
}

/**
 * Per-job auto-checker settings (V1.4.0+)
 * Allows configuring when scheduled checks run for face page jobs
 */
export interface AutoCheckSettings {
  enabled: boolean;                      // Whether auto-checker is enabled
  frequency: 'daily' | 'twice_daily';    // Check frequency
  scheduledTimes: AutoCheckTime[];       // Scheduled check times (max 2)
  scheduledChecksToday: number;          // Count of scheduled checks today (max 2)
  lastScheduledCheck?: number;           // Timestamp of last scheduled check
  lastManualCheck?: number;              // Timestamp of last manual check (no limit)
}

/**
 * Default auto-check settings for face page jobs
 * Default: 4:30 PM California time
 */
export const DEFAULT_AUTO_CHECK_SETTINGS: AutoCheckSettings = {
  enabled: true,
  frequency: 'daily',
  scheduledTimes: [{ hour: 16, minute: 30 }],
  scheduledChecksToday: 0,
};

/**
 * CHP wrapper execution result types
 * - FULL: Success, full report retrieved
 * - FACE_PAGE: Success, face page only (full report may come later)
 * - PAGE1_NOT_FOUND: Page 1 failed - report not found with given date/time/officer
 * - PAGE1_REJECTED_ATTEMPT_RISK: Page 1 rejected - CHP flagged as attempt risk/lockout warning
 * - PAGE2_VERIFICATION_FAILED: Page 1 passed, but Page 2 verification failed (need more identifiers)
 * - PORTAL_ERROR: Technical error (timeout, portal down, etc.)
 */
export type WrapperResult =
  | 'FULL'
  | 'FACE_PAGE'
  | 'PAGE1_NOT_FOUND'
  | 'PAGE1_REJECTED_ATTEMPT_RISK'
  | 'PAGE2_VERIFICATION_FAILED'
  | 'PORTAL_ERROR';

/**
 * Report type hint - known once Page 1 succeeds (before Page 2 verification)
 */
export type ReportTypeHint = 'FULL' | 'FACE_PAGE' | 'UNKNOWN';

/**
 * Page 2 field verification result
 */
export type Page2FieldResult = 'success' | 'failed' | 'not_tried';

/**
 * Record of a single wrapper execution
 */
export interface WrapperRun {
  runId: string;
  timestamp: number;
  result: WrapperResult;
  duration: number; // milliseconds
  page1Passed?: boolean; // True if Page 1 succeeded (reached Page 2)
  reportTypeHint?: ReportTypeHint; // Known report type even before Page 2 verification completes
  errorMessage?: string;
  // V1.6.0: Track which Page 2 fields were tried for auto-escalation
  page2FieldsTried?: {
    name?: boolean;
    plate?: boolean;
    driverLicense?: boolean;
    vin?: boolean;
  };
  page2FieldResults?: {
    name?: Page2FieldResult;
    plate?: Page2FieldResult;
    driverLicense?: Page2FieldResult;
    vin?: Page2FieldResult;
  };
}

// ============================================
// ESCALATION TYPES (V1.6.0+)
// ============================================

/**
 * Reason for escalation to manual pickup
 */
export type EscalationReason = 'manual' | 'auto_exhausted' | 'fatal_report';

/**
 * Escalation workflow status
 */
export type EscalationStatus =
  | 'pending_authorization'    // Waiting for law firm to upload auth doc
  | 'authorization_received'   // Auth doc uploaded, ready for staff
  | 'claimed'                  // Staff member claimed the pickup
  | 'pickup_scheduled'         // Pickup date/time set
  | 'completed';               // Report picked up and uploaded

/**
 * Pickup time slot options
 */
export type PickupTimeSlot = '9am' | 'afternoon' | '4pm';

/**
 * Escalation workflow step for quick actions (V1.7.0+)
 * Used to determine which action button to show on staff dashboard
 */
export type EscalationStep =
  | 'claim'           // Staff needs to claim the pickup
  | 'schedule'        // Claimed, needs to schedule time
  | 'download_auth'   // Scheduled, needs to download auth doc
  | 'upload_report'   // Auth acknowledged, ready to upload
  | 'auto_check';     // Face page uploaded (non-fatal), can check for full

/**
 * Escalation data tracking (V1.6.0+)
 * Tracks the full escalation workflow for manual pickup
 */
export interface EscalationData {
  status: EscalationStatus;
  escalatedAt: number;
  escalationReason: EscalationReason;
  escalationNotes?: string;

  // Authorization document
  authorizationRequested?: boolean;
  authorizationRequestedAt?: number;
  authorizationDocumentToken?: string;
  authorizationUploadedAt?: number;

  // Authorization acknowledgment (V1.7.0+ - staff downloaded the auth doc)
  authDocumentAcknowledged?: boolean;
  authDocumentAcknowledgedAt?: number;

  // Staff claiming
  claimedBy?: string;       // Staff member ID or name
  claimedAt?: number;

  // Pickup scheduling
  scheduledPickupTime?: PickupTimeSlot;
  scheduledPickupDate?: string;  // YYYY-MM-DD (Mon-Fri only)
  pickupNotes?: string;

  // Completion
  completedAt?: number;
  completedBy?: string;

  // Resume flow (V1.6.1+)
  guaranteedName?: string;  // Name from face page upload during escalation (unlocks auto-checker)
}

// ============================================
// FATAL REPORT TYPES (V1.6.0+)
// ============================================

/**
 * Fatal report details (V1.6.0+)
 * Additional data required for fatal crash reports
 */
export interface FatalDetails {
  clientWasDeceased: boolean;
  deathCertificateToken?: string;   // Required if clientWasDeceased is true
  deathCertificateUploadedAt?: number;
}

/**
 * Main Job interface representing a crash report request
 */
export interface Job {
  // Identity
  _id: string;

  // Law Firm Info
  lawFirmId: string;
  lawFirmName: string;
  caseReference?: string;

  // Client Info
  clientName: string;
  clientType: ClientType | null; // Null when not yet selected

  // Report Info (Page 1 data)
  reportNumber: string; // Format: 9XXX-YYYY-ZZZZZ
  crashDate?: string; // Format: MM/DD/YYYY (optional for NEW jobs)
  crashTime?: string; // Format: HHMM (24-hour)
  ncic: string; // 4 digits, derived from report number
  officerId?: string; // 5 digits, left-padded with zeros (e.g., "01234")
  locationDescription?: string;

  // Verification Fields (Page 2 data)
  firstName?: string;
  lastName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;

  // Passenger-provided verification data (V1.0.5+)
  passengerProvidedData?: {
    plate?: string;
    driverLicense?: string;
    vin?: string;
    providedAt: number; // Timestamp
  };

  // Interactive timeline state (V1.0.5+)
  interactiveState?: InteractiveState;

  // Auto-checker settings (V1.4.0+)
  autoCheckSettings?: AutoCheckSettings;

  // Status
  internalStatus: InternalStatus;

  // File Tokens
  facePageToken?: string;
  fullReportToken?: string;

  // Wrapper History
  wrapperRuns: WrapperRun[];

  // Page 1 attempt tracking - prevents duplicate runs with same inputs (V2.6.1+)
  // Each entry is a JSON hash of {crashDate, crashTime, ncic, officerId}
  page1AttemptsHashes?: string[];

  // Page 1 failure tracking for attempt gating (V2.7.0+)
  // Only incremented when page1SubmitClicked === true AND result is PAGE1_NOT_FOUND or PAGE1_REJECTED_ATTEMPT_RISK
  page1FailureCount?: number;
  lastPage1FailureAt?: number;

  // Escalation Data (V1.6.0+)
  escalationData?: EscalationData;

  // Fatal Report (V1.6.0+)
  isFatal?: boolean;
  fatalDetails?: FatalDetails;

  // Face Page Completion Choice (V1.6.0+)
  facePageChoiceMade?: 'complete' | 'wait';  // Law firm's choice when face page received
  facePageChoiceTimestamp?: number;
  reopenedFromFacePageComplete?: boolean;    // True if job was reopened after completing with face page

  // Timestamps
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// ============================================
// EVENT TYPES (for future timeline feature)
// ============================================

/**
 * Types of events that can occur on a job
 */
export type EventType =
  | 'job_created'
  | 'status_change'
  | 'page1_updated'
  | 'page2_updated'
  | 'wrapper_triggered'
  | 'wrapper_completed'
  | 'file_uploaded'
  | 'check_requested' // Auto-checker run
  | 'escalated'
  | 'completed'
  | 'message'
  // V1.0.5+ Interactive prompts (law firm chat)
  | 'driver_passenger_prompt' // "Is this for a driver or passenger?"
  | 'driver_selected' // "You selected: Driver"
  | 'passenger_selected' // "You selected: Passenger"
  | 'passenger_data_provided' // "Thank you! We received: [fields]"
  | 'chp_nudge_shown' // Optional nudge with plain language
  // V1.0.6+ Enhanced flows
  | 'page1_details_request' // "Do you know crash date/time/officer?"
  | 'auto_wrapper_triggered' // "We're checking CHP for your report..."
  | 'auto_wrapper_success' // "Report retrieved successfully!"
  | 'auto_wrapper_failed' // "No report found yet"
  // V1.1.0+ Flow wizard events
  | 'flow_speedup_prompt' // "Want to share crash details to speed things up?"
  | 'flow_speedup_yes' // User chose to provide crash details
  | 'flow_speedup_no' // User skipped crash details
  | 'flow_crash_details_saved' // Crash details saved
  | 'flow_verification_saved' // Passenger verification data saved
  | 'flow_completed' // Flow wizard completed
  // V1.2.0+ Rescue flow events
  | 'page1_not_found' // Page 1 failed - report not found
  | 'page2_verification_needed' // Page 1 passed, need more identifiers
  | 'rescue_info_saved' // Rescue form data saved
  | 'rescue_wrapper_triggered' // Re-running wrapper with rescue data
  // V1.3.0+ Decline tracking events
  | 'driver_speedup_declined' // Driver clicked "No thanks"
  | 'driver_speedup_reopened' // Driver re-opened collapsed CTA
  | 'passenger_helper_declined' // Passenger clicked "No thanks/Skip"
  | 'passenger_helper_reopened' // Passenger re-opened collapsed CTA
  // V1.4.0+ Auto-checker events (law firm)
  | 'auto_check_started' // Law firm triggered manual check
  | 'auto_check_found' // Full report found
  | 'auto_check_not_found' // Full report not yet available
  | 'auto_check_settings_updated' // Frequency settings changed
  // V1.6.0+ Face page completion events
  | 'face_page_complete_chosen' // Law firm chose to complete with face page only
  | 'face_page_wait_chosen' // Law firm chose to wait for full report
  | 'face_page_reopened' // Law firm reopened job to check for full report
  // V1.6.0+ Escalation workflow events
  | 'escalation_auto_triggered' // Auto-escalated due to exhausted Page 2 fields
  | 'escalation_manual_triggered' // Staff manually escalated
  | 'escalation_fatal_triggered' // Auto-escalated due to fatal report
  | 'authorization_requested' // Law firm prompted to upload auth doc
  | 'authorization_uploaded' // Law firm uploaded auth doc
  | 'pickup_claimed' // Staff claimed the pickup
  | 'pickup_scheduled' // Staff scheduled pickup time
  | 'pickup_completed' // Staff completed manual pickup
  // V1.6.0+ Fatal report events
  | 'fatal_report_created' // Fatal report request submitted
  | 'death_certificate_uploaded' // Death certificate uploaded
  // V2.5.0+ Fast Form events
  | 'fast_form_submitted' // Fast Form submitted (Page 1 + Page 2 in one go)
  | 'fast_form_success' // Fast Form wrapper run succeeded
  | 'fast_form_failed'; // Fast Form wrapper run failed (escalation triggered)

/**
 * Timeline event for job history
 */
export interface JobEvent {
  _id: string;
  jobId: string;
  eventType: EventType;
  message: string;
  isUserFacing: boolean; // true = visible to law firm
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// FORM & VALIDATION TYPES
// ============================================

/**
 * Validation result for form fields
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * New job request form data
 * Per PRD: Law firms only submit clientName and reportNumber
 * Client type, crash date/time are collected later via chat or by staff
 */
export interface NewJobFormData {
  clientName: string;
  reportNumber: string;
  // V1.6.0: Fatal report fields (optional)
  isFatal?: boolean;
  fatalDetails?: FatalDetails;
  internalStatus?: InternalStatus;
  escalationData?: EscalationData;
}
