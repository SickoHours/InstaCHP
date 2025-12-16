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
 * @see docs/prd/04-chp-wrapper.md for wrapper specification
 */

import { NextRequest, NextResponse } from 'next/server';

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
}

/**
 * Proxy response extends wrapper response with mappedResultType
 */
interface ProxyResponse extends WrapperResponse {
  mappedResultType: MappedResultType;
}

/**
 * Error response when proxy itself fails (before reaching wrapper)
 */
interface ProxyErrorResponse {
  success: false;
  error: string;
  code: 'MISSING_CONFIG' | 'INVALID_JSON' | 'NETWORK_ERROR' | 'WRAPPER_AUTH_FAILED';
  missing?: {
    baseUrl: boolean;
    apiKey: boolean;
  };
}

// ============================================
// MAPPING FUNCTION
// ============================================

/**
 * Maps wrapper's type to InstaTCR's internal result type
 * This allows existing UI logic to continue using the 5 internal outcomes
 */
function mapWrapperType(type: WrapperType | undefined, message?: string): MappedResultType {
  switch (type) {
    case 'FULL':
      return 'FULL';
    case 'FACE_PAGE':
      return 'FACE_PAGE';
    case 'NO_RESULT':
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
  const baseUrl = process.env.CHP_WRAPPER_BASE_URL;
  const apiKey = process.env.CHP_WRAPPER_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('[wrapper/run] Missing environment configuration');
    return NextResponse.json(
      {
        success: false,
        error: 'Wrapper service not configured. Contact administrator.',
        code: 'MISSING_CONFIG',
        missing: {
          baseUrl: !baseUrl,
          apiKey: !apiKey,
        },
      } satisfies ProxyErrorResponse,
      { status: 503 }
    );
  }

  // 2. Parse request body (minimal validation - let wrapper enforce field rules)
  let body: Record<string, unknown>;
  try {
    body = await request.json();
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

  // 3. Forward request to CHP wrapper on Fly.io
  const wrapperUrl = `${baseUrl}/api/run-chp`;
  const authHeader = `Bearer ${apiKey}`;

  try {
    const response = await fetch(wrapperUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      // Pass through the body as-is (let wrapper validate)
      body: JSON.stringify(body),
    });

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

    // Add mappedResultType for InstaTCR UI compatibility
    const proxyResponse: ProxyResponse = {
      ...wrapperJson,
      mappedResultType: mapWrapperType(wrapperJson.type, wrapperJson.message),
    };

    // Return wrapper's status code with enriched response
    return NextResponse.json(proxyResponse, { status: response.status });
  } catch (error) {
    console.error('[wrapper/run] Network error calling wrapper:', error);
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
