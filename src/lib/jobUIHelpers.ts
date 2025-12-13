/**
 * Job UI Helpers - Single source of truth for UI visibility decisions
 *
 * These functions determine what UI elements should be shown based on job state.
 * Use these throughout the app instead of duplicating conditional logic.
 *
 * @version V1.6.1
 */

import type { Job } from './types';

// ============================================
// CORE STATE DETECTION FUNCTIONS
// ============================================

/**
 * Check if job is a fatal report
 * Fatal reports require special handling - no questions, no wrapper UI
 */
export function isFatalJob(job: Job): boolean {
  return job.isFatal === true;
}

/**
 * Check if job is in escalated state (needs manual pickup)
 */
export function isEscalatedJob(job: Job): boolean {
  return job.internalStatus === 'NEEDS_IN_PERSON_PICKUP';
}

/**
 * Check if this is a terminal escalation state
 * Terminal = escalated AND no face page uploaded yet
 * In this state, wrapper UI and verification forms are irrelevant
 */
export function isTerminalEscalation(job: Job): boolean {
  return isEscalatedJob(job) && !job.facePageToken;
}

/**
 * Check if escalated job can resume normal verification flow
 * Requires: escalated + face page + guaranteed name (firstName or escalationData.guaranteedName)
 */
export function canResumeFromEscalated(job: Job): boolean {
  if (!isEscalatedJob(job)) return false;
  if (!job.facePageToken) return false;

  // Check for guaranteed name from either source
  const hasGuaranteedName = !!(
    job.firstName ||
    job.lastName ||
    job.escalationData?.guaranteedName
  );

  return hasGuaranteedName;
}

// ============================================
// UI VISIBILITY FUNCTIONS
// ============================================

/**
 * Should wrapper-related UI be shown? (Cards 1-4 on staff side)
 * - Page 1 Data, Page 2 Verification, CHP Wrapper, Wrapper History
 *
 * Hide for:
 * - Fatal reports (always)
 * - Terminal escalations (no face page yet)
 *
 * Show for:
 * - Normal jobs
 * - Escalated jobs with face page + guaranteed name (resume flow)
 */
export function shouldShowWrapperUI(job: Job): boolean {
  // Fatal jobs never show wrapper UI
  if (isFatalJob(job)) return false;

  // Terminal escalations hide wrapper UI
  if (isTerminalEscalation(job)) return false;

  // Escalated jobs that can resume show wrapper UI
  if (isEscalatedJob(job)) {
    return canResumeFromEscalated(job);
  }

  // Normal jobs show wrapper UI
  return true;
}

/**
 * Should driver/passenger questions be shown? (FlowWizard on law firm side)
 *
 * Hide for:
 * - Fatal reports (never ask questions)
 * - Escalated jobs (questions no longer relevant for manual pickup)
 */
export function shouldShowDriverPassengerQuestions(job: Job): boolean {
  // Fatal jobs never show questions
  if (isFatalJob(job)) return false;

  // Escalated jobs don't show questions (manual pickup path)
  if (isEscalatedJob(job)) return false;

  return true;
}

/**
 * Should Page 2 verification forms be shown?
 *
 * Hide for:
 * - Fatal reports (no verification needed)
 * - Terminal escalations (manual pickup path without face page)
 *
 * Show for:
 * - Normal jobs
 * - Escalated jobs that can resume (face page + name)
 */
export function shouldShowPage2Verification(job: Job): boolean {
  // Fatal jobs never show verification forms
  if (isFatalJob(job)) return false;

  // Terminal escalations hide verification
  if (isTerminalEscalation(job)) return false;

  // Escalated jobs that can resume show verification
  if (isEscalatedJob(job)) {
    return canResumeFromEscalated(job);
  }

  return true;
}

/**
 * Should auto-checker UI be shown?
 *
 * Requirements:
 * - Has face page token
 * - Has name (firstName or lastName or guaranteedName)
 * - No full report yet
 * - Not a terminal escalation
 * - Not a fatal job
 */
export function shouldShowAutoChecker(job: Job): boolean {
  // Fatal jobs never show auto-checker
  if (isFatalJob(job)) return false;

  // Must have face page
  if (!job.facePageToken) return false;

  // Must not already have full report
  if (job.fullReportToken) return false;

  // Must have a name
  const hasName = !!(
    job.firstName ||
    job.lastName ||
    job.escalationData?.guaranteedName
  );
  if (!hasName) return false;

  // Terminal escalations without resume capability don't show auto-checker
  // (but this is redundant since we check facePageToken above)

  return true;
}

/**
 * Should escalation-related UI be shown? (Pickup scheduler, auth upload)
 *
 * Show only for escalated jobs
 */
export function shouldShowEscalationUI(job: Job): boolean {
  return isEscalatedJob(job);
}

/**
 * Should manual completion card be shown?
 *
 * Show when:
 * - No face page and no full report (can upload either)
 * - OR: Escalated job (always allow manual completion)
 */
export function shouldShowManualCompletion(job: Job): boolean {
  // Always show for escalated jobs
  if (isEscalatedJob(job)) return true;

  // Show if no documents uploaded yet
  return !job.facePageToken && !job.fullReportToken;
}
