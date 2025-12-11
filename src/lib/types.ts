/**
 * Core TypeScript interfaces and types for InstaTCR
 */

// ============================================
// STATUS TYPES
// ============================================

/**
 * Internal status - 13 values visible to staff only
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
 * CHP wrapper execution result types
 */
export type WrapperResult = 'FULL' | 'FACE_PAGE' | 'NO_RESULT' | 'ERROR';

/**
 * Record of a single wrapper execution
 */
export interface WrapperRun {
  runId: string;
  timestamp: number;
  result: WrapperResult;
  duration: number; // milliseconds
  errorMessage?: string;
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
  clientType: ClientType;

  // Report Info (Page 1 data)
  reportNumber: string; // Format: 9XXX-YYYY-ZZZZZ
  crashDate: string; // Format: MM/DD/YYYY
  crashTime?: string; // Format: HHMM (24-hour)
  ncic: string; // 4 digits, derived from report number
  officerId?: string; // 6 digits, starts with 0
  locationDescription?: string;

  // Verification Fields (Page 2 data)
  firstName?: string;
  lastName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;

  // Status
  internalStatus: InternalStatus;

  // File Tokens
  facePageToken?: string;
  fullReportToken?: string;

  // Wrapper History
  wrapperRuns: WrapperRun[];

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
  | 'escalated'
  | 'completed'
  | 'message';

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
}
