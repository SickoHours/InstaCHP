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
