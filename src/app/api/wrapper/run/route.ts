/**
 * CHP Wrapper Proxy Route
 *
 * Server-side proxy that forwards requests to the Fly.io CHP wrapper.
 * This route keeps API credentials secure by never exposing them to the browser.
 *
 * Environment variables (server-side only):
 * - CHP_WRAPPER_BASE_URL: Base URL of the CHP wrapper service (e.g., https://chp-wrapper.fly.dev)
 * - CHP_WRAPPER_API_KEY: API key for authentication with the wrapper
 *
 * Payload Notes:
 * - crashDate: YYYY-MM-DD format recommended (e.g., "2024-12-15")
 *   The wrapper accepts both YYYY-MM-DD and MM/DD/YYYY, but YYYY-MM-DD
 *   is preferred for consistency and ISO compliance.
 * - crashTime: HHMM 24-hour format (e.g., "1430" for 2:30 PM)
 * - ncic: 4-digit code derived from first 4 digits of report number
 *
 * @see docs/prd/04-chp-wrapper.md for wrapper specification
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// PAGE 1 NORMALIZATION
// ============================================

/**
 * Normalize crashTime to HHMM format
 * Accepts HH:MM or HHMM input
 */
function normalizeCrashTime(value: string): string {
  if (!value) return '';
  // Remove any colons
  const cleaned = value.replace(/:/g, '');
  // Pad to 4 digits if needed
  return cleaned.padStart(4, '0');
}

/**
 * Normalize officerId - preserve original length (CHP wrapper handles padding)
 * NOTE: Wrapper now accepts 1-6 digits. No client-side padding needed.
 */
function normalizeOfficerId(value: string): string {
  if (!value) return '';
  // Extract only digits
  const digitsOnly = value.replace(/\D/g, '');
  // Return as-is (no padding) - let wrapper handle it
  return digitsOnly;
}

/**
 * Derive NCIC from report number (first 4 digits only, must start with 9)
 */
function deriveNcic(reportNumber: string): string {
  const digitsOnly = reportNumber.replace(/\D/g, '');
  return digitsOnly.slice(0, 4);
}

/**
 * Normalize all Page 1 inputs before validation and sending to wrapper
 */
function normalizePage1Inputs(body: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...body };
  
  // Normalize crashTime (accept HH:MM or HHMM -> HHMM)
  if (typeof normalized.crashTime === 'string') {
    normalized.crashTime = normalizeCrashTime(normalized.crashTime);
  }
  
  // Normalize officerId (1-6 digits, no padding)
  if (typeof normalized.officerId === 'string' && normalized.officerId) {
    normalized.officerId = normalizeOfficerId(normalized.officerId);
  }
  
  // Derive NCIC from reportNumber if not provided
  if (!normalized.ncic && typeof normalized.reportNumber === 'string') {
    normalized.ncic = deriveNcic(normalized.reportNumber);
  }
  
  return normalized;
}

// ============================================
// PAGE 1 VALIDATION
// ============================================

/**
 * Page 1 field validation rules - server-side pre-flight checks
 * These prevent obviously invalid inputs from being sent to the wrapper.
 */
interface Page1ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate Page 1 fields before sending to wrapper
 * 
 * Rules (post-normalization):
 * - crashDate: YYYY-MM-DD format, not in future, not before 1990
 * - crashTime: HHMM 24-hour format (0000-2359)
 * - ncic: Exactly 4 digits starting with 9
 * - officerId: 1-6 digits (optional field)
 */
function validatePage1Fields(body: Record<string, unknown>): Page1ValidationResult {
  const errors: Record<string, string> = {};

  // crashDate: YYYY-MM-DD format validation
  const crashDate = body.crashDate;
  if (crashDate !== undefined && crashDate !== null && crashDate !== '') {
    if (typeof crashDate !== 'string') {
      errors.crashDate = 'Crash date must be a string';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(crashDate)) {
      errors.crashDate = 'Crash date must be YYYY-MM-DD format';
    } else {
      // Parse and validate the date
      const [year, month, day] = crashDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const now = new Date();
      
      // Check if date is valid
      if (dateObj.getFullYear() !== year || 
          dateObj.getMonth() !== month - 1 || 
          dateObj.getDate() !== day) {
        errors.crashDate = 'Invalid date';
      }
      // Not in future (allow today)
      else if (dateObj > now) {
        errors.crashDate = 'Crash date cannot be in the future';
      }
      // Not before 1990
      else if (year < 1990) {
        errors.crashDate = 'Crash date must be after 1990';
      }
    }
  }

  // crashTime: HHMM 24-hour format validation (post-normalization)
  const crashTime = body.crashTime;
  if (crashTime !== undefined && crashTime !== null && crashTime !== '') {
    if (typeof crashTime !== 'string') {
      errors.crashTime = 'Crash time must be a string';
    } else if (!/^\d{4}$/.test(crashTime)) {
      errors.crashTime = 'Crash time must be HHMM format (e.g., 1430)';
    } else {
      const hours = parseInt(crashTime.slice(0, 2), 10);
      const minutes = parseInt(crashTime.slice(2, 4), 10);
      if (hours < 0 || hours > 23) {
        errors.crashTime = 'Hours must be 00-23';
      } else if (minutes < 0 || minutes > 59) {
        errors.crashTime = 'Minutes must be 00-59';
      }
    }
  }

  // ncic: Exactly 4 digits starting with 9
  const ncic = body.ncic;
  if (ncic !== undefined && ncic !== null && ncic !== '') {
    if (typeof ncic !== 'string') {
      errors.ncic = 'NCIC must be a string';
    } else if (!/^9\d{3}$/.test(ncic)) {
      errors.ncic = 'NCIC must be 4 digits starting with 9';
    }
  }

  // officerId: 1-6 digits (optional, post-normalization)
  const officerId = body.officerId;
  if (officerId !== undefined && officerId !== null && officerId !== '') {
    if (typeof officerId !== 'string') {
      errors.officerId = 'Officer ID must be a string';
    } else if (!/^\d{1,6}$/.test(officerId)) {
      errors.officerId = 'Officer ID must be 1-6 digits';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generate SHA256 hash of Page 1 inputs for duplicate detection
 * Uses normalized inputs to ensure consistent hashing
 */
function generatePage1Hash(body: Record<string, unknown>): string {
  const page1Fields = {
    reportNumber: (typeof body.reportNumber === 'string' ? body.reportNumber : '').toUpperCase().replace(/[^A-Z0-9-]/g, ''),
    ncic: body.ncic || '',
    crashDate: body.crashDate || '',
    crashTime: body.crashTime || '',
    officerId: body.officerId || '',
  };
  const hashInput = JSON.stringify(page1Fields);
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Real wrapper response type from Fly.io
 */
type WrapperType = 'FULL' | 'FACE_PAGE' | 'NO_RESULT' | 'ERROR';

/**
 * InstaTCR internal result type (for UI compatibility)
 */
type MappedResultType =
  | 'FULL'
  | 'FACE_PAGE'
  | 'PAGE1_NOT_FOUND'
  | 'PAGE1_REJECTED_ATTEMPT_RISK'
  | 'PAGE2_VERIFICATION_FAILED'
  | 'PORTAL_ERROR';

/**
 * Response shape from the real Fly.io wrapper
 */
interface WrapperResponse {
  success: boolean;
  type: WrapperType;
  message?: string;
  downloadToken?: string;
  journeyLog?: string[];
  duration?: number;
  fieldErrors?: Record<string, string>;
  page1SubmitClicked?: boolean; // True if Page 1 submit button was clicked
}

/**
 * Proxy response extends wrapper response with mappedResultType
 */
interface ProxyResponse extends WrapperResponse {
  mappedResultType: MappedResultType;
  page1Hash?: string; // For duplicate detection on client
  page1SubmitClicked?: boolean; // Passed through for attempt tracking
}

/**
 * Error response when proxy itself fails (before reaching wrapper)
 */
interface ProxyErrorResponse {
  success: false;
  error: string;
  code: 'MISSING_CONFIG' | 'INVALID_JSON' | 'NETWORK_ERROR' | 'WRAPPER_AUTH_FAILED' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR';
  missing?: {
    baseUrl: boolean;
    apiKey: boolean;
  };
  fieldErrors?: Record<string, string>;
  page1Hash?: string; // For duplicate detection
}

// ============================================
// MAPPING FUNCTION
// ============================================

/**
 * Maps wrapper's type to InstaTCR's internal result type
 * This allows existing UI logic to continue using the 6 internal outcomes
 */
function mapWrapperType(type: WrapperType | undefined, message?: string): MappedResultType {
  switch (type) {
    case 'FULL':
      return 'FULL';
    case 'FACE_PAGE':
      return 'FACE_PAGE';
    case 'NO_RESULT':
      // Check if CHP flagged as attempt risk / lockout warning
      if (message?.toLowerCase().includes('attempt risk') || 
          message?.toLowerCase().includes('locked') ||
          message?.toLowerCase().includes('too many attempts')) {
        return 'PAGE1_REJECTED_ATTEMPT_RISK';
      }
      return 'PAGE1_NOT_FOUND';
    case 'ERROR':
    default:
      // Check if it's a Page 2 verification failure
      if (message?.toLowerCase().includes('verification')) {
        return 'PAGE2_VERIFICATION_FAILED';
      }
      return 'PORTAL_ERROR';
  }
}

// ============================================
// ROUTE HANDLERS
// ============================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProxyResponse | ProxyErrorResponse>> {
  // 1. Verify server-side configuration exists
  const rawBaseUrl = process.env.CHP_WRAPPER_BASE_URL;
  const apiKey = process.env.CHP_WRAPPER_API_KEY;

  if (!rawBaseUrl || !apiKey) {
    console.error('[wrapper/run] Missing environment configuration');
    return NextResponse.json(
      {
        success: false,
        error: 'Wrapper service not configured. Contact administrator.',
        code: 'MISSING_CONFIG',
        missing: {
          baseUrl: !rawBaseUrl,
          apiKey: !apiKey,
        },
      } satisfies ProxyErrorResponse,
      { status: 503 }
    );
  }

  // Normalize base URL: strip trailing slash and ensure we don't double /api
  // CHP_WRAPPER_BASE_URL should be like "https://chp-wrapper.fly.dev" (no trailing /api)
  let baseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
  
  // Safety check: if someone accidentally includes /api or /api/run-chp, strip it
  if (baseUrl.endsWith('/api/run-chp')) {
    baseUrl = baseUrl.replace(/\/api\/run-chp$/, '');
  } else if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '');
  }

  // 2. Parse request body
  let rawBody: Record<string, unknown>;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      } satisfies ProxyErrorResponse,
      { status: 400 }
    );
  }

  // SECURITY: Strip mockScenario from all requests
  // This ensures production wrapper calls never include test scenarios.
  // Only the dev test panel (/staff/dev/page1-test) can use mock scenarios,
  // and those are processed client-side - never sent to the real wrapper.
  if ('mockScenario' in rawBody) {
    console.warn('[wrapper/run] Stripped mockScenario from request - production safety');
    delete rawBody.mockScenario;
  }

  // 3. Normalize Page 1 inputs before validation
  // This applies: crashTime HH:MM->HHMM, officerId->digits only (1-6), ncic from reportNumber
  const body = normalizePage1Inputs(rawBody);
  console.log('[wrapper/run] Normalized Page 1:', {
    crashDate: body.crashDate,
    crashTime: body.crashTime,
    ncic: body.ncic,
    officerId: body.officerId,
  });

  // 4. Pre-flight validation of Page 1 fields (post-normalization)
  // Catch obviously invalid inputs before wasting a wrapper call
  const validation = validatePage1Fields(body);
  if (!validation.valid) {
    console.warn('[wrapper/run] Pre-flight validation failed:', validation.errors);
    return NextResponse.json(
      {
        success: false,
        error: 'Page 1 validation failed',
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.errors,
      } satisfies ProxyErrorResponse,
      { status: 400 }
    );
  }

  // 5. Forward request to CHP wrapper on Fly.io
  const wrapperUrl = `${baseUrl}/api/run-chp`;
  const authHeader = `Bearer ${apiKey}`;

  // 90-second timeout for wrapper calls (accounts for Fly VM cold start + CHP login)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(wrapperUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      // Pass through the body as-is (let wrapper validate)
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 unauthorized from wrapper
    if (response.status === 401) {
      console.error('[wrapper/run] 401 Unauthorized from wrapper');
      return NextResponse.json(
        {
          success: false,
          error: 'Wrapper authentication failed. Check API key configuration.',
          code: 'WRAPPER_AUTH_FAILED',
        } satisfies ProxyErrorResponse,
        { status: 401 }
      );
    }

    // Try to parse wrapper response as JSON
    let wrapperJson: WrapperResponse;
    try {
      wrapperJson = await response.json();
    } catch {
      // Wrapper returned non-JSON (pass through status)
      return NextResponse.json(
        {
          success: false,
          error: `Wrapper returned non-JSON response (status ${response.status})`,
          code: 'NETWORK_ERROR',
        } satisfies ProxyErrorResponse,
        { status: response.status }
      );
    }

    // Map wrapper type to InstaTCR internal type
    const mappedResultType = mapWrapperType(wrapperJson.type, wrapperJson.message);
    
    // Only include page1Hash for Page 1 deterministic failures (NO_RESULT -> PAGE1_NOT_FOUND or PAGE1_REJECTED_ATTEMPT_RISK)
    // This allows clients to track "one attempt per unique Page 1 input set"
    // Portal errors, timeouts, and other non-deterministic failures should NOT be hashed
    const isPage1DeterministicFailure = wrapperJson.type === 'NO_RESULT';
    const page1Hash = isPage1DeterministicFailure ? generatePage1Hash(body) : undefined;
    
    if (isPage1DeterministicFailure) {
      console.log('[wrapper/run] Page 1 deterministic failure, hash:', page1Hash, 'page1SubmitClicked:', wrapperJson.page1SubmitClicked);
    }

    // Add mappedResultType for InstaTCR UI compatibility
    const proxyResponse: ProxyResponse = {
      ...wrapperJson,
      mappedResultType,
      ...(page1Hash && { page1Hash }), // Only include if it's a Page 1 failure
      page1SubmitClicked: wrapperJson.page1SubmitClicked ?? false, // Pass through for attempt tracking
    };

    // Return wrapper's status code with enriched response
    return NextResponse.json(proxyResponse, { status: response.status });
  } catch (error) {
    clearTimeout(timeoutId);

    // Check if this was a timeout (AbortError)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[wrapper/run] Request timed out after 90s');
      return NextResponse.json(
        {
          success: false,
          error: 'Wrapper request timed out. The CHP portal may be slow or the service is starting up. Please try again.',
          code: 'TIMEOUT_ERROR',
        } satisfies ProxyErrorResponse,
        { status: 504 }
      );
    }

    // Check if it looks like a Fly.io timeout (socket closed after ~60s)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isSocketClosed = errorMessage.includes('fetch failed') || 
      (error instanceof Error && (error.cause as Error | undefined)?.message?.includes('closed'));
    
    console.error('[wrapper/run] Network error calling wrapper:', error);
    
    // If socket was closed (likely Fly timeout), give a timeout-like message
    if (isSocketClosed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wrapper connection was closed. The CHP portal may be slow or the service is starting up. Please try again.',
          code: 'TIMEOUT_ERROR',
        } satisfies ProxyErrorResponse,
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reach wrapper service',
        code: 'NETWORK_ERROR',
      } satisfies ProxyErrorResponse,
      { status: 502 }
    );
  }
}

/**
 * GET handler for health check / route verification
 */
export async function GET(): Promise<NextResponse<{ ok: true }>> {
  return NextResponse.json({ ok: true });
}
