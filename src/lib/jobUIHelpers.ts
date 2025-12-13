/**
 * Job UI Helpers - Single source of truth for UI visibility decisions
 *
 * These functions determine what UI elements should be shown based on job state.
 * Use these throughout the app instead of duplicating conditional logic.
 *
 * @version V1.6.1
 */

import type { Job, EscalationStep } from './types';

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

// ============================================
// ESCALATION QUICK ACTION HELPERS (V1.7.0+)
// ============================================

/**
 * Get the available steps for an escalation workflow
 * Fatal jobs skip auto-check step
 */
export function getAvailableEscalationSteps(job: Job): EscalationStep[] {
  const baseSteps: EscalationStep[] = ['claim', 'schedule', 'download_auth', 'upload_report'];

  // Fatal jobs: NO auto-check step
  if (isFatalJob(job)) {
    return baseSteps;
  }

  // Non-fatal with face page (and no full report): Add auto-check
  if (job.facePageToken && !job.fullReportToken) {
    return [...baseSteps, 'auto_check'];
  }

  return baseSteps;
}

/**
 * Determine current escalation step based on job state
 * Used for quick action buttons on staff dashboard
 *
 * Flow: claim → schedule → download_auth → upload_report → (optional) auto_check
 */
export function getEscalationStep(job: Job): EscalationStep {
  const data = job.escalationData;

  // Not escalated = default to claim (edge case)
  if (!data) return 'claim';

  // Step 5: Auto-checker available (non-fatal, face page + name, no full report)
  if (shouldShowAutoChecker(job) && data.authDocumentAcknowledged) {
    return 'auto_check';
  }

  // Step 4: Ready for upload (has acknowledged auth doc)
  if (data.authDocumentAcknowledged) {
    return 'upload_report';
  }

  // Step 3: Download auth (scheduled + has auth doc)
  if (data.scheduledPickupTime && data.authorizationDocumentToken) {
    return 'download_auth';
  }

  // Step 2: Schedule pickup (claimed but no schedule yet)
  if (data.claimedBy && !data.scheduledPickupTime) {
    return 'schedule';
  }

  // Step 1: Claim pickup (not yet claimed)
  return 'claim';
}

/**
 * Check if a step is completed based on job state
 */
export function isEscalationStepCompleted(job: Job, step: EscalationStep): boolean {
  const data = job.escalationData;
  if (!data) return false;

  switch (step) {
    case 'claim':
      return !!data.claimedBy;
    case 'schedule':
      return !!data.scheduledPickupTime;
    case 'download_auth':
      return !!data.authDocumentAcknowledged;
    case 'upload_report':
      return !!(job.facePageToken || job.fullReportToken);
    case 'auto_check':
      return !!job.fullReportToken;
    default:
      return false;
  }
}

/**
 * Get the number of completed steps for an escalated job
 */
export function getCompletedStepCount(job: Job): number {
  const steps = getAvailableEscalationSteps(job);
  return steps.filter(step => isEscalationStepCompleted(job, step)).length;
}

/**
 * Check if a step can be performed (prerequisites met)
 */
export function canPerformEscalationStep(job: Job, step: EscalationStep): boolean {
  const data = job.escalationData;
  if (!data) return step === 'claim';

  switch (step) {
    case 'claim':
      // Can claim if authorization received or pending (with auth doc)
      return !data.claimedBy && (
        data.status === 'authorization_received' ||
        !!data.authorizationDocumentToken
      );
    case 'schedule':
      return !!data.claimedBy && !data.scheduledPickupTime;
    case 'download_auth':
      return !!data.scheduledPickupTime && !!data.authorizationDocumentToken && !data.authDocumentAcknowledged;
    case 'upload_report':
      return !!data.authDocumentAcknowledged && !job.fullReportToken;
    case 'auto_check':
      return shouldShowAutoChecker(job);
    default:
      return false;
  }
}

// ============================================
// AUTHORIZATION STATUS HELPERS (V1.9.0+)
// ============================================

/**
 * Check if escalated job has authorization uploaded
 */
export function hasAuthorizationUploaded(job: Job): boolean {
  if (!isEscalatedJob(job)) return false;
  return !!(job.escalationData?.authorizationDocumentToken);
}

/**
 * Check if escalated job is ready to claim (auth uploaded, not claimed yet)
 */
export function isReadyToClaim(job: Job): boolean {
  if (!hasAuthorizationUploaded(job)) return false;
  return !job.escalationData?.claimedBy;
}

/**
 * Check if escalated job is pending authorization
 */
export function isPendingAuthorization(job: Job): boolean {
  if (!isEscalatedJob(job)) return false;
  return !hasAuthorizationUploaded(job);
}

/**
 * Get authorization status label for display
 */
export function getAuthorizationStatusLabel(job: Job): string | null {
  if (!isEscalatedJob(job)) return null;

  if (isPendingAuthorization(job)) return 'Pending Authorization';
  if (isReadyToClaim(job)) return 'Ready to Claim';
  if (job.escalationData?.claimedBy) return 'In Progress';

  return null;
}

/**
 * Get authorization status color for badge
 */
export function getAuthorizationStatusColor(job: Job): string {
  if (!isEscalatedJob(job)) return 'slate';
  if (isPendingAuthorization(job)) return 'amber';
  if (isReadyToClaim(job)) return 'emerald';
  return 'blue';
}
