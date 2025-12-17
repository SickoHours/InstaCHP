/**
 * CHP Wrapper Safety Check Proxy Route
 *
 * Server-side proxy that calls the wrapper's /api/safety-check endpoint
 * to verify current safety state without executing a run.
 *
 * This endpoint is primarily used for:
 * - DEV testing: Verify UI safety banners work correctly
 * - Pre-run checks: Determine if wrapper is ready before user clicks "Run"
 * - Health monitoring: Check rate limits, cooldowns, and circuit breaker state
 *
 * Request body:
 * - mode: 'simulate' (required for preflight checks)
 *
 * Response includes:
 * - canRun: boolean - whether it's safe to run now
 * - blockCode: SafetyBlockCode if blocked
 * - retryAfterSeconds: seconds until retry allowed
 * - safetyState: current state of all safety mechanisms
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPE DEFINITIONS
// ============================================

type SafetyBlockCode =
  | 'RATE_LIMIT_ACTIVE'
  | 'RUN_LOCK_ACTIVE'
  | 'COOLDOWN_ACTIVE'
  | 'CIRCUIT_BREAKER_ACTIVE';

interface SafetyCheckRequest {
  mode: 'simulate' | 'check';
}

interface SafetyCheckResponse {
  success: boolean;
  canRun: boolean;
  blockCode?: SafetyBlockCode;
  retryAfterSeconds?: number;
  message: string;
  safetyState?: {
    rateLimitRemaining: number;
    cooldownActive: boolean;
    runLockActive: boolean;
    circuitBreakerState: 'closed' | 'open' | 'half-open';
  };
}

interface ProxyErrorResponse {
  success: false;
  canRun: false;
  error: string;
  code: 'MISSING_CONFIG' | 'NETWORK_ERROR' | 'WRAPPER_ERROR';
}

// ============================================
// DEV MODE SIMULATION
// ============================================

/**
 * In dev mode without real wrapper, simulate safety check responses
 * Allows testing UI without hitting real CHP wrapper
 */
function generateDevResponse(mode: string): SafetyCheckResponse {
  // 80% chance of "can run" in dev mode
  const canRun = Math.random() > 0.2;

  if (canRun) {
    return {
      success: true,
      canRun: true,
      message: '[DEV] Wrapper is ready to run',
      safetyState: {
        rateLimitRemaining: Math.floor(Math.random() * 10) + 5,
        cooldownActive: false,
        runLockActive: false,
        circuitBreakerState: 'closed',
      },
    };
  }

  // Simulate random safety block
  const blocks: SafetyBlockCode[] = [
    'RATE_LIMIT_ACTIVE',
    'RUN_LOCK_ACTIVE',
    'COOLDOWN_ACTIVE',
    'CIRCUIT_BREAKER_ACTIVE',
  ];
  const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
  const retrySeconds = Math.floor(Math.random() * 20) + 5;

  const messages: Record<SafetyBlockCode, string> = {
    RATE_LIMIT_ACTIVE: '[DEV] Rate limit active - too many requests',
    RUN_LOCK_ACTIVE: '[DEV] Another run is in progress',
    COOLDOWN_ACTIVE: '[DEV] Cooldown period after recent run',
    CIRCUIT_BREAKER_ACTIVE: '[DEV] Circuit breaker triggered',
  };

  return {
    success: true,
    canRun: false,
    blockCode: randomBlock,
    retryAfterSeconds: retrySeconds,
    message: messages[randomBlock],
    safetyState: {
      rateLimitRemaining: randomBlock === 'RATE_LIMIT_ACTIVE' ? 0 : 5,
      cooldownActive: randomBlock === 'COOLDOWN_ACTIVE',
      runLockActive: randomBlock === 'RUN_LOCK_ACTIVE',
      circuitBreakerState: randomBlock === 'CIRCUIT_BREAKER_ACTIVE' ? 'open' : 'closed',
    },
  };
}

// ============================================
// ROUTE HANDLERS
// ============================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<SafetyCheckResponse | ProxyErrorResponse>> {
  // 1. Parse request body
  let body: SafetyCheckRequest;
  try {
    body = await request.json();
  } catch {
    body = { mode: 'simulate' };
  }

  // 2. Check for server-side configuration
  const rawBaseUrl = process.env.CHP_WRAPPER_BASE_URL;
  const apiKey = process.env.CHP_WRAPPER_API_KEY;

  // If not configured (dev mode without wrapper), return simulated response
  if (!rawBaseUrl || !apiKey) {
    // DEV MODE: Return simulated safety check
    if (process.env.NODE_ENV === 'development') {
      console.log('[safety-check] DEV MODE: Returning simulated response');
      return NextResponse.json(generateDevResponse(body.mode));
    }

    return NextResponse.json(
      {
        success: false,
        canRun: false,
        error: 'Wrapper service not configured',
        code: 'MISSING_CONFIG',
      } satisfies ProxyErrorResponse,
      { status: 503 }
    );
  }

  // 3. Normalize base URL
  let baseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
  if (baseUrl.endsWith('/api/safety-check')) {
    baseUrl = baseUrl.replace(/\/api\/safety-check$/, '');
  } else if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '');
  }

  // 4. Call wrapper's safety-check endpoint
  const wrapperUrl = `${baseUrl}/api/safety-check`;
  const authHeader = `Bearer ${apiKey}`;

  try {
    const response = await fetch(wrapperUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ mode: body.mode || 'simulate' }),
    });

    // Handle various response codes
    if (!response.ok) {
      // If wrapper doesn't have safety-check endpoint yet (404), simulate
      if (response.status === 404) {
        console.log('[safety-check] Endpoint not found, simulating response');
        return NextResponse.json({
          success: true,
          canRun: true,
          message: 'Safety check endpoint not available - assuming ready',
          safetyState: {
            rateLimitRemaining: 10,
            cooldownActive: false,
            runLockActive: false,
            circuitBreakerState: 'closed',
          },
        });
      }

      // For other errors, return error response
      return NextResponse.json(
        {
          success: false,
          canRun: false,
          error: `Wrapper returned status ${response.status}`,
          code: 'WRAPPER_ERROR',
        } satisfies ProxyErrorResponse,
        { status: response.status }
      );
    }

    // Parse and return wrapper response
    const wrapperJson = await response.json();
    return NextResponse.json(wrapperJson as SafetyCheckResponse);
  } catch (error) {
    console.error('[safety-check] Network error:', error);
    return NextResponse.json(
      {
        success: false,
        canRun: false,
        error: 'Failed to reach wrapper service',
        code: 'NETWORK_ERROR',
      } satisfies ProxyErrorResponse,
      { status: 502 }
    );
  }
}

/**
 * GET handler returns simulated response for quick UI testing
 */
export async function GET(): Promise<NextResponse<SafetyCheckResponse>> {
  // Always return a simulated "all clear" for GET requests (quick test)
  return NextResponse.json({
    success: true,
    canRun: true,
    message: 'GET request - returning default safe state',
    safetyState: {
      rateLimitRemaining: 10,
      cooldownActive: false,
      runLockActive: false,
      circuitBreakerState: 'closed',
    },
  });
}

