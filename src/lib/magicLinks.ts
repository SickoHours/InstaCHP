/**
 * Magic Links - V1.8.0
 *
 * Token generation and decoding for magic links.
 * In V1, these are simple encoded tokens that redirect to app routes.
 * In V2+, they will include HMAC signatures and server-side validation.
 *
 * Token Format: {action}_{jobId}_{expiry}_{optionalData}
 * Examples:
 *   - ma_job_001_1735689600000 (upload_auth)
 *   - mv_job_001_1735689600000 (view_job)
 *   - md_job_001_fp_token_123_1735689600000 (download with file token)
 */

import type { MagicLink, MagicLinkAction } from './notificationTypes';

// ============================================================================
// Constants
// ============================================================================

/**
 * Token prefix for each action type.
 */
const ACTION_PREFIXES: Record<MagicLinkAction, string> = {
  upload_auth: 'ma', // "magic auth"
  view_job: 'mv', // "magic view"
  download_report: 'md', // "magic download"
};

/**
 * Action labels for UI buttons.
 */
const ACTION_LABELS: Record<MagicLinkAction, string> = {
  upload_auth: 'Upload Authorization',
  view_job: 'View Job',
  download_report: 'Download Report',
};

/**
 * Default expiry time: 7 days in milliseconds.
 */
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a thread ID for a job.
 * All notifications for the same job share this thread ID.
 */
export function generateThreadId(jobId: string): string {
  return `thread_${jobId}_${Date.now()}`;
}

/**
 * Generate a magic link token.
 */
export function generateMagicToken(
  action: MagicLinkAction,
  jobId: string,
  downloadToken?: string
): string {
  const prefix = ACTION_PREFIXES[action];
  const expiry = Date.now() + DEFAULT_EXPIRY_MS;

  if (action === 'download_report' && downloadToken) {
    return `${prefix}_${jobId}_${downloadToken}_${expiry}`;
  }

  return `${prefix}_${jobId}_${expiry}`;
}

/**
 * Generate a magic link object.
 */
export function generateMagicLink(
  action: MagicLinkAction,
  jobId: string,
  downloadToken?: string
): MagicLink {
  const token = generateMagicToken(action, jobId, downloadToken);
  const expiresAt = Date.now() + DEFAULT_EXPIRY_MS;

  return {
    action,
    token,
    url: `/m/${token}`,
    expiresAt,
    label: ACTION_LABELS[action],
  };
}

// ============================================================================
// Token Decoding
// ============================================================================

/**
 * Decoded magic link data.
 */
export interface DecodedMagicLink {
  action: MagicLinkAction;
  jobId: string;
  expiresAt: number;
  downloadToken?: string;
  isExpired: boolean;
  isValid: boolean;
}

/**
 * Decode a magic link token.
 */
export function decodeMagicToken(token: string): DecodedMagicLink {
  try {
    const parts = token.split('_');

    if (parts.length < 3) {
      return createInvalidResult();
    }

    const prefix = parts[0];
    const action = getActionFromPrefix(prefix);

    if (!action) {
      return createInvalidResult();
    }

    // Handle different token formats
    if (action === 'download_report' && parts.length >= 4) {
      // Format: md_job_001_downloadToken_expiry
      const jobId = parts[1];
      const downloadToken = parts.slice(2, -1).join('_'); // Everything between jobId and expiry
      const expiresAt = parseInt(parts[parts.length - 1], 10);
      const isExpired = Date.now() > expiresAt;

      return {
        action,
        jobId,
        downloadToken,
        expiresAt,
        isExpired,
        isValid: true,
      };
    }

    // Standard format: prefix_jobId_expiry
    const jobId = parts[1];
    const expiresAt = parseInt(parts[parts.length - 1], 10);
    const isExpired = Date.now() > expiresAt;

    return {
      action,
      jobId,
      expiresAt,
      isExpired,
      isValid: true,
    };
  } catch {
    return createInvalidResult();
  }
}

/**
 * Get action type from prefix.
 */
function getActionFromPrefix(prefix: string): MagicLinkAction | null {
  const entries = Object.entries(ACTION_PREFIXES);
  const found = entries.find(([, p]) => p === prefix);
  return found ? (found[0] as MagicLinkAction) : null;
}

/**
 * Create invalid result object.
 */
function createInvalidResult(): DecodedMagicLink {
  return {
    action: 'view_job',
    jobId: '',
    expiresAt: 0,
    isExpired: true,
    isValid: false,
  };
}

// ============================================================================
// URL Generation (for quick actions)
// ============================================================================

/**
 * Get the destination URL for a magic link action.
 * This is used by quick action buttons to simulate magic link behavior.
 */
export function getMagicLinkDestination(
  action: MagicLinkAction,
  jobId: string,
  userType: 'law_firm' | 'staff',
  downloadToken?: string
): string {
  const basePath = userType === 'law_firm' ? '/law' : '/staff';

  switch (action) {
    case 'upload_auth':
      return `${basePath}/jobs/${jobId}?action=upload_auth`;
    case 'view_job':
      return `${basePath}/jobs/${jobId}`;
    case 'download_report':
      // In V1, just navigate to job detail with download action
      // In V2, this would be an API route
      return `${basePath}/jobs/${jobId}?action=download&token=${downloadToken || ''}`;
    default:
      return `${basePath}/jobs/${jobId}`;
  }
}

/**
 * Check if a query param action is valid.
 */
export function isValidActionParam(action: string | null): action is 'upload_auth' | 'download' {
  return action === 'upload_auth' || action === 'download';
}
