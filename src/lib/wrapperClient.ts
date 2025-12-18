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
  officerId?: string;      // 1-6 digits (optional)

  // Page 2 verification fields (at least one required)
  firstName?: string;
  lastName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;
  organizationName?: string;
  propertyOwnerName?: string;

  // Preflight mode (NEW in wrapper v2.0+)
  // When true, fills Page 1 form and verifies inputs WITHOUT clicking submit
  // This lets you test inputs without consuming CHP attempt budget
  preflightMode?: boolean;

  // Mock mode (DEV/TEST ONLY - NEW in wrapper v2.0+)
  // Requires wrapper WRAPPER_MOCK_MODE=1 and X-Mock-Key header
  // WARNING: This field is stripped by runWrapper() and the API route for security
  // Available scenarios: 'success-full-report', 'success-face-page', 'no-result',
  //                      'page1-rejected', 'page2-failed'
  mockScenario?: string;
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
  journeyLog?: string[]; // Always present in wrapper v2.0+
  duration?: number;
  fieldErrors?: Record<string, string>;
  page1Hash?: string; // For duplicate detection
  page1SubmitClicked?: boolean; // True if Page 1 submit button was clicked (attempt consumed)

  // NEW in wrapper v2.0+
  wrapperMode?: 'live' | 'mock'; // Indicates if response is from mock or live mode
  mockScenario?: string; // If mock mode, which scenario was used
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
  | 'TIMEOUT_ERROR'
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
  journeyLog?: string[]; // Always present in wrapper v2.0+ (shows what happened)
  // Safety block fields
  retryAfterSeconds?: number;
  blockedUntil?: number; // Unix timestamp when block expires
  page1Hash?: string; // For duplicate detection
  page1SubmitClicked?: boolean; // True if Page 1 submit button was clicked (attempt consumed)

  // NEW in wrapper v2.0+
  wrapperMode?: 'live' | 'mock'; // Indicates if response is from mock or live mode
  mockScenario?: string; // If mock mode, which scenario was used
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
 * SECURITY: This function never sends mockScenario to the wrapper.
 * Mock scenarios are only for the dev test panel's client-side testing.
 *
 * NEW in wrapper v2.0+:
 * - preflightMode: Test Page 1 inputs without clicking submit (no attempt consumed)
 * - firstName-only strategy: Can omit lastName (firstName-only tried before plate/VIN)
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

  // SECURITY: Never send mockScenario to the real wrapper
  // This is a defense-in-depth measure (server also strips it)
  // preflightMode is allowed and passed through safely
  const safeRequest = { ...normalizedRequest };
  if ('mockScenario' in safeRequest) {
    delete (safeRequest as Record<string, unknown>).mockScenario;
    if (process.env.NODE_ENV === 'development') {
      console.warn('[wrapperClient] Stripped mockScenario from request');
    }
  }

  try {
    const response = await fetch('/api/wrapper/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safeRequest),
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
      journeyLog: data.journeyLog,
      retryAfterSeconds: data.retryAfterSeconds,
      blockedUntil: data.blockedUntil,
      page1Hash: data.page1Hash,
      page1SubmitClicked: data.page1SubmitClicked,
      wrapperMode: data.wrapperMode,
      mockScenario: data.mockScenario,
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
// PAGE 1 HASH HELPERS
// ============================================

/**
 * Page 1 input fields used for hash generation
 */
interface Page1HashInput {
  crashDate?: string;
  crashTime?: string;
  ncic?: string;
  officerId?: string;
}

/**
 * Generate a deterministic hash for Page 1 inputs
 * 
 * This creates a unique identifier for a specific set of Page 1 inputs,
 * used to detect if the same inputs have already been tried (and failed).
 * This prevents redundant wrapper calls with identical Page 1 data.
 * 
 * The hash is a simple base64-encoded JSON string of the normalized inputs.
 * For true cryptographic hashing, the server uses SHA256, but for client-side
 * duplicate detection, this lightweight approach is sufficient.
 * 
 * @param input - Page 1 input fields
 * @returns A deterministic hash string
 */
export function generatePage1Hash(input: Page1HashInput): string {
  // Normalize inputs - empty strings and undefined should be treated the same
  const normalized = {
    crashDate: input.crashDate || '',
    crashTime: input.crashTime || '',
    ncic: input.ncic || '',
    officerId: input.officerId || '',
  };
  
  // Create a deterministic string representation
  const jsonStr = JSON.stringify(normalized, Object.keys(normalized).sort());
  
  // Use btoa for browser-compatible base64 encoding
  // This creates a unique, readable hash for the input set
  if (typeof window !== 'undefined') {
    return btoa(jsonStr);
  }
  
  // Node.js fallback (for SSR)
  return Buffer.from(jsonStr).toString('base64');
}

/**
 * Check if a Page 1 input set has already been tried on a job
 * 
 * NOTE: The server generates SHA256 hashes for Page 1 inputs and only
 * returns them on PAGE1_NOT_FOUND (deterministic failures). The client
 * can also generate hashes locally for pre-checks before calling the wrapper.
 * 
 * @param existingHashes - Array of previously attempted hashes (from job.page1AttemptsHashes)
 * @param newHash - The hash to check (from generatePage1Hash or server response)
 * @returns true if this exact Page 1 input set was already attempted
 */
export function isPage1AlreadyAttempted(
  existingHashes: string[] | undefined,
  newHash: string
): boolean {
  if (!existingHashes || existingHashes.length === 0) return false;
  return existingHashes.includes(newHash);
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

  // Config/network/timeout issues are infrastructure problems, not job failures
  if (
    errorResponse.code === 'MISSING_CONFIG' ||
    errorResponse.code === 'NETWORK_ERROR' ||
    errorResponse.code === 'TIMEOUT_ERROR'
  ) {
    return false;
  }

  // PORTAL_ERROR, WRAPPER_AUTH_FAILED, or unexpected errors are true failures
  return true;
}

// ============================================
// PAGE 1 REJECTION HELPERS
// ============================================

/**
 * Check if a wrapper result is a Page 1 rejection
 * 
 * Both PAGE1_NOT_FOUND and PAGE1_REJECTED_ATTEMPT_RISK count as Page 1 rejections.
 * These indicate that CHP did not find a matching report with the given Page 1 inputs.
 *
 * @param result - Wrapper result type
 * @returns true if this is a Page 1 rejection
 */
export function isPage1Rejection(result: WrapperResult | undefined): boolean {
  return result === 'PAGE1_NOT_FOUND' || result === 'PAGE1_REJECTED_ATTEMPT_RISK';
}

/**
 * Check if a wrapper run consumed a Page 1 attempt
 * 
 * A Page 1 attempt is only "consumed" (counts against the limit) when:
 * 1. The Page 1 submit button was actually clicked (page1SubmitClicked === true)
 * 2. AND the result was a Page 1 rejection (not found or attempt risk)
 * 
 * This ensures we don't count client-side validation failures or network errors
 * against the user's limited Page 1 attempts.
 *
 * @param result - Wrapper result type
 * @param page1SubmitClicked - Whether Page 1 submit was clicked
 * @returns true if this run consumed a Page 1 attempt
 */
export function consumedPage1Attempt(
  result: WrapperResult | undefined,
  page1SubmitClicked: boolean | undefined
): boolean {
  return page1SubmitClicked === true && isPage1Rejection(result);
}

// ============================================
// SAFETY PREFLIGHT CHECK
// ============================================

/**
 * Response from the safety preflight check
 */
export interface SafetyPreflightResponse {
  /** Whether the preflight was successful */
  success: boolean;
  /** Whether it's safe to run the wrapper now */
  canRun: boolean;
  /** If blocked, the safety block code */
  blockCode?: SafetyBlockCode;
  /** If blocked, seconds until retry is allowed */
  retryAfterSeconds?: number;
  /** Human-readable message */
  message: string;
  /** Current state of all safety mechanisms */
  safetyState?: {
    rateLimitRemaining: number;
    cooldownActive: boolean;
    runLockActive: boolean;
    circuitBreakerState: 'closed' | 'open' | 'half-open';
  };
}

/**
 * DEV-ONLY: Run a preflight safety check to verify wrapper state
 * 
 * Calls the wrapper's /api/safety-check endpoint with mode=simulate
 * to check if it's safe to run without actually executing a run.
 * 
 * This is useful for:
 * - Testing the UI safety banner without burning real runs
 * - Verifying the wrapper is configured and reachable
 * - Checking current rate limit status
 * 
 * @returns SafetyPreflightResponse with current safety state
 */
export async function runSafetyPreflight(): Promise<SafetyPreflightResponse> {
  try {
    const response = await fetch('/api/wrapper/safety-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: 'simulate' }),
    });

    const data = await response.json();

    // Map response to SafetyPreflightResponse
    if (data.success && data.canRun) {
      return {
        success: true,
        canRun: true,
        message: data.message || 'Wrapper is ready to run',
        safetyState: data.safetyState,
      };
    }

    // Check for safety block
    if (data.blockCode || data.code) {
      const blockCode = (data.blockCode || data.code) as SafetyBlockCode;
      return {
        success: true,
        canRun: false,
        blockCode,
        retryAfterSeconds: data.retryAfterSeconds,
        message: data.message || getSafetyBlockMessage({
          success: false,
          error: 'Safety block active',
          code: blockCode,
          retryAfterSeconds: data.retryAfterSeconds,
        }),
        safetyState: data.safetyState,
      };
    }

    // Generic blocked response
    return {
      success: true,
      canRun: false,
      message: data.message || 'Wrapper is not ready',
      safetyState: data.safetyState,
    };
  } catch (error) {
    console.error('[wrapperClient] Preflight check error:', error);
    return {
      success: false,
      canRun: false,
      message: error instanceof Error ? error.message : 'Failed to reach wrapper service',
    };
  }
}

