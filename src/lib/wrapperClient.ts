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
 *     crashDate: '12/15/2024',
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
  crashDate?: string;      // Format: MM/DD/YYYY
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
 * Error response from wrapper or proxy
 */
export interface WrapperErrorResponse {
  success: false;
  error: string;
  code?: 'MISSING_CONFIG' | 'INVALID_JSON' | 'NETWORK_ERROR' | 'WRAPPER_AUTH_FAILED';
  mappedResultType?: WrapperResult;
  message?: string;
  fieldErrors?: Record<string, string>;
  // Debug info for 401 errors (temporary)
  debug?: {
    hasBaseUrl: boolean;
    baseUrlLength: number;
    hasKey: boolean;
    keyLength: number;
    sentAuthHeader: boolean;
    authHeaderLength: number;
  };
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
  try {
    const response = await fetch('/api/wrapper/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
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
      debug: data.debug,
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

