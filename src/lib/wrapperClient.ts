/**
 * Wrapper Client - Browser-side API for calling the CHP wrapper proxy
 *
 * This module provides a type-safe interface for the UI to call the
 * server-side proxy route (/api/wrapper/run), which forwards requests
 * to the Fly.io CHP wrapper.
 *
 * Usage:
 *   import { runWrapper } from '@/lib/wrapperClient';
 *
 *   const result = await runWrapper({
 *     jobId: 'job_001',
 *     reportNumber: '9876-2024-12345',
 *     crashDate: '2024-12-15',  // YYYY-MM-DD format
 *     crashTime: '1430',
 *     ncic: '9876',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *   });
 *
 *   if (result.success) {
 *     console.log('Result:', result.mappedResultType);
 *   } else {
 *     console.error('Error:', result.error);
 *   }
 */

import type { WrapperResult } from './types';

// ============================================
// DATE NORMALIZATION HELPERS
// ============================================

/**
 * Detect if a date string is in MM/DD/YYYY format
 */
function isLegacyDateFormat(date: string): boolean {
  // Match MM/DD/YYYY pattern (e.g., "12/15/2024")
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date);
}

/**
 * Convert MM/DD/YYYY to YYYY-MM-DD format
 * Returns original string if not in MM/DD/YYYY format
 *
 * @example
 * normalizeDate("12/15/2024") => "2024-12-15"
 * normalizeDate("2024-12-15") => "2024-12-15"
 */
function normalizeDate(date: string): string {
  if (!isLegacyDateFormat(date)) {
    return date; // Already YYYY-MM-DD or other format
  }

  const [month, day, year] = date.split('/');
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[wrapperClient] Dev guard: Converting legacy date format "${date}" to "${year}-${mm}-${dd}"`
    );
  }

  return `${year}-${mm}-${dd}`;
}

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Request payload for wrapper execution
 * All fields are optional - wrapper validates required fields
 */
export interface WrapperRequest {
  // Job identifiers (passed through for logging/correlation)
  jobId?: string;
  reportNumber?: string;

  // Page 1 fields (required for CHP lookup)
  crashDate?: string;      // Format: YYYY-MM-DD (recommended) or MM/DD/YYYY (legacy)
  crashTime?: string;      // Format: HHMM (24-hour)
  ncic?: string;           // 4 digits, derived from report number
  officerId?: string;      // 6 digits (optional)

  // Page 2 verification fields (at least one required)
  firstName?: string;
  lastName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;
  organizationName?: string;
  propertyOwnerName?: string;
}

/**
 * Successful wrapper response
 */
export interface WrapperSuccessResponse {
  success: true;
  type: 'FULL' | 'FACE_PAGE' | 'NO_RESULT' | 'ERROR';
  mappedResultType: WrapperResult;
  message?: string;
  downloadToken?: string;
  journeyLog?: string[];
  duration?: number;
  fieldErrors?: Record<string, string>;
}

/**
 * Safety block codes returned by the wrapper when rate limiting is active
 */
export type SafetyBlockCode =
  | 'RATE_LIMIT_ACTIVE'
  | 'RUN_LOCK_ACTIVE'
  | 'COOLDOWN_ACTIVE'
  | 'CIRCUIT_BREAKER_ACTIVE';

/**
 * All possible error codes from wrapper or proxy
 */
export type WrapperErrorCode =
  | 'MISSING_CONFIG'
  | 'INVALID_JSON'
  | 'NETWORK_ERROR'
  | 'WRAPPER_AUTH_FAILED'
  | SafetyBlockCode
  | 'PORTAL_ERROR'
  | 'VALIDATION_ERROR';

/**
 * Error response from wrapper or proxy
 */
export interface WrapperErrorResponse {
  success: false;
  error: string;
  code?: WrapperErrorCode;
  mappedResultType?: WrapperResult;
  message?: string;
  fieldErrors?: Record<string, string>;
  // Safety block fields
  retryAfterSeconds?: number;
  blockedUntil?: number; // Unix timestamp when block expires
}

/**
 * Combined response type
 */
export type WrapperResponse = WrapperSuccessResponse | WrapperErrorResponse;

// ============================================
// CLIENT FUNCTION
// ============================================

/**
 * Call the CHP wrapper via the proxy route
 *
 * @param request - Wrapper request payload
 * @returns Wrapper response with mappedResultType for UI compatibility
 */
export async function runWrapper(request: WrapperRequest): Promise<WrapperResponse> {
  // Normalize crashDate to YYYY-MM-DD format before sending
  const normalizedRequest = {
    ...request,
    crashDate: request.crashDate ? normalizeDate(request.crashDate) : undefined,
  };

  try {
    const response = await fetch('/api/wrapper/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedRequest),
    });

    // Parse response (always JSON from our proxy)
    const data = await response.json();

    // If response has success: true, it's a success response
    if (data.success === true) {
      return data as WrapperSuccessResponse;
    }

    // Otherwise, it's an error response (either from proxy or wrapper)
    return {
      success: false,
      error: data.error || data.message || 'Unknown error',
      code: data.code,
      mappedResultType: data.mappedResultType,
      message: data.message,
      fieldErrors: data.fieldErrors,
    } as WrapperErrorResponse;
  } catch (error) {
    // Network error (couldn't reach proxy)
    console.error('[wrapperClient] Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Check if wrapper is configured (basic health check)
 *
 * @returns true if wrapper proxy is responding
 */
export async function isWrapperConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/wrapper/run', {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// SAFETY BLOCK HELPERS
// ============================================

/**
 * List of error codes that indicate a retryable safety block
 * These should NOT escalate the job - just wait and retry
 */
const SAFETY_BLOCK_CODES: SafetyBlockCode[] = [
  'RATE_LIMIT_ACTIVE',
  'RUN_LOCK_ACTIVE',
  'COOLDOWN_ACTIVE',
  'CIRCUIT_BREAKER_ACTIVE',
];

/**
 * Check if an error response is a retryable safety block
 * Safety blocks are NOT failures - they're protective rate limits
 * that should be respected with a retry after the cooldown
 *
 * @param response - Wrapper error response to check
 * @returns true if this is a safety block that should be retried
 */
export function isRetryableSafetyBlock(response: WrapperErrorResponse): boolean {
  if (!response.code) return false;
  return SAFETY_BLOCK_CODES.includes(response.code as SafetyBlockCode);
}

/**
 * Extract the retry-after time from a safety block response
 *
 * @param response - Wrapper error response
 * @returns Number of seconds to wait before retry, or undefined if not a safety block
 */
export function extractRetryAfterSeconds(response: WrapperErrorResponse): number | undefined {
  if (!isRetryableSafetyBlock(response)) return undefined;
  return response.retryAfterSeconds;
}

/**
 * Get a user-friendly message for a safety block
 *
 * @param response - Wrapper error response
 * @returns Human-readable message for the safety block
 */
export function getSafetyBlockMessage(response: WrapperErrorResponse): string {
  const retrySeconds = extractRetryAfterSeconds(response);
  const retryText = retrySeconds
    ? ` Please wait ${retrySeconds} seconds before trying again.`
    : ' Please wait a moment before trying again.';

  switch (response.code) {
    case 'RATE_LIMIT_ACTIVE':
      return `Rate limit active.${retryText}`;
    case 'RUN_LOCK_ACTIVE':
      return `Another wrapper run is in progress.${retryText}`;
    case 'COOLDOWN_ACTIVE':
      return `Wrapper is in cooldown period.${retryText}`;
    case 'CIRCUIT_BREAKER_ACTIVE':
      return `CHP portal temporarily unavailable (circuit breaker active).${retryText}`;
    default:
      return `Temporarily blocked.${retryText}`;
  }
}

/**
 * Check if an error is a true wrapper failure that should escalate the job
 * Only PORTAL_ERROR and unexpected errors should escalate
 *
 * @param response - Wrapper response (success or error)
 * @returns true if this is a genuine failure that warrants escalation
 */
export function isTrueWrapperError(response: WrapperResponse): boolean {
  if (response.success) return false;

  const errorResponse = response as WrapperErrorResponse;

  // Safety blocks are NOT true errors
  if (isRetryableSafetyBlock(errorResponse)) return false;

  // Config/network issues are infrastructure problems, not job failures
  if (errorResponse.code === 'MISSING_CONFIG' || errorResponse.code === 'NETWORK_ERROR') {
    return false;
  }

  // PORTAL_ERROR, WRAPPER_AUTH_FAILED, or unexpected errors are true failures
  return true;
}

