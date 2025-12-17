/**
 * Development/Testing Mode Configuration
 *
 * This file controls mock behavior for faster testing during development.
 * In production builds, all skip flags are false and delays are normal.
 */

export const DEV_MODE = process.env.NODE_ENV === 'development';

export const DEV_CONFIG = {
  /**
   * Skip file upload requirements in dev mode
   * When true, file inputs show [DEV] Skip buttons and validation passes without files
   */
  skipFileUploads: DEV_MODE,

  /**
   * Mock delays (in milliseconds)
   * Shorter in dev mode for faster testing cycles
   */
  delays: {
    /** Wrapper execution: 2s in dev, 8-13s in prod */
    wrapperRun: DEV_MODE ? 2000 : 8000 + Math.random() * 5000,
    /** Auto-checker: 1.5s in dev, 3-5s in prod */
    autoCheck: DEV_MODE ? 1500 : 3000 + Math.random() * 2000,
    /** Form submission: 0.5s in dev, 1.5s in prod */
    formSubmit: DEV_MODE ? 500 : 1500,
    /** File upload simulation: 0.5s in dev, 2-3s in prod */
    fileUpload: DEV_MODE ? 500 : 2000 + Math.random() * 1000,
  },

  /**
   * Force specific wrapper outcomes for testing
   * Set to null for random (default behavior)
   */
  forceWrapperResult: null as
    | 'FULL'
    | 'FACE_PAGE'
    | 'PAGE1_NOT_FOUND'
    | 'PAGE2_VERIFICATION_FAILED'
    | 'PORTAL_ERROR'
    | null,

  /**
   * Force auto-check success/failure for testing
   * Set to null for random (20% success rate by default)
   */
  forceAutoCheckSuccess: null as boolean | null,
};

/**
 * Helper to get appropriate delay
 * Returns the delay value, recalculating random delays each call
 */
export function getDelay(
  type: 'wrapperRun' | 'autoCheck' | 'formSubmit' | 'fileUpload'
): number {
  if (DEV_MODE) {
    return DEV_CONFIG.delays[type] as number;
  }

  // Recalculate random delay for production-like behavior
  switch (type) {
    case 'wrapperRun':
      return 8000 + Math.random() * 5000;
    case 'autoCheck':
      return 3000 + Math.random() * 2000;
    case 'formSubmit':
      return 1500;
    case 'fileUpload':
      return 2000 + Math.random() * 1000;
    default:
      return 1000;
  }
}

// ============================================
// DEV-ONLY: SAFETY BLOCK TESTING
// ============================================

import type { SafetyBlockCode } from './wrapperClient';

/**
 * Safety block simulation result for testing
 * Used to verify the Staff UI handles safety blocks correctly
 */
export interface SafetyBlockTestResult {
  success: boolean;
  code: SafetyBlockCode;
  message: string;
  retryAfterSeconds: number;
}

/**
 * DEV-ONLY: Simulate a safety block for testing the Staff UI
 * 
 * This triggers a mock safety block response without hitting the real wrapper.
 * Used to verify:
 * - Amber banner appears with correct code label
 * - Countdown timer works properly
 * - Button is disabled during countdown
 * - Job status is NOT escalated (no failure language)
 * 
 * @param code - The safety block code to simulate
 * @param retryAfterSeconds - Seconds until retry is allowed (default: 15)
 * @returns SafetyBlockTestResult with the simulated response
 */
export function simulateSafetyBlock(
  code: SafetyBlockCode = 'RATE_LIMIT_ACTIVE',
  retryAfterSeconds: number = 15
): SafetyBlockTestResult {
  if (!DEV_MODE) {
    console.warn('[simulateSafetyBlock] This function is only available in dev mode');
    return {
      success: false,
      code: 'RATE_LIMIT_ACTIVE',
      message: 'Dev-only function called in production',
      retryAfterSeconds: 0,
    };
  }

  const messages: Record<SafetyBlockCode, string> = {
    RATE_LIMIT_ACTIVE: 'Rate limit active. Too many requests to CHP portal.',
    RUN_LOCK_ACTIVE: 'Another wrapper run is in progress.',
    COOLDOWN_ACTIVE: 'Wrapper is in cooldown period after recent run.',
    CIRCUIT_BREAKER_ACTIVE: 'CHP portal temporarily unavailable.',
  };

  console.log(`[DEV] Simulating safety block: ${code} (retry in ${retryAfterSeconds}s)`);

  return {
    success: true,
    code,
    message: messages[code],
    retryAfterSeconds,
  };
}

/**
 * DEV-ONLY: Trigger a real safety block by calling the proxy twice quickly
 * 
 * This sends two rapid requests to the proxy to trigger a RUN_LOCK_ACTIVE
 * or COOLDOWN_ACTIVE response from the real wrapper.
 * 
 * Use this to test the full integration path including real network calls.
 * 
 * @param payload - The wrapper request payload to send
 * @returns Promise that resolves when the second call returns (should be a safety block)
 */
export async function triggerRealSafetyBlock(
  payload: Record<string, unknown>
): Promise<{ firstResponse: Response; secondResponse: Response }> {
  if (!DEV_MODE) {
    throw new Error('[triggerRealSafetyBlock] Only available in dev mode');
  }

  console.log('[DEV] Triggering real safety block with rapid double-call...');

  // Fire both requests simultaneously
  const [firstResponse, secondResponse] = await Promise.all([
    fetch('/api/wrapper/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    // Slight delay to ensure server processes first request first
    new Promise<Response>((resolve) =>
      setTimeout(
        () =>
          fetch('/api/wrapper/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(resolve),
        50
      )
    ),
  ]);

  console.log('[DEV] First response status:', firstResponse.status);
  console.log('[DEV] Second response status:', secondResponse.status);

  return { firstResponse, secondResponse };
}
