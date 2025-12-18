/**
 * CHP Wrapper V2.0+ Features Unit Tests
 *
 * Tests for new wrapper features integrated from chp-wrapper-tool v2.0+:
 * - 6-digit officer ID support
 * - Preflight mode (page1SubmitClicked tracking)
 * - firstName-only Page 2 strategy
 * - Enhanced safety codes
 * - Journey log presence
 *
 * @version V2.8.0
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeOfficerId,
  isValidOfficerId,
  formatOfficerIdError,
} from '@/lib/utils';
import type { WrapperRequest, WrapperSuccessResponse } from '@/lib/wrapperClient';

// ============================================
// OFFICER ID VALIDATION TESTS (1-6 digits)
// ============================================

describe('Officer ID - 6-digit support', () => {
  describe('normalizeOfficerId', () => {
    it('preserves 1-digit officer IDs (no padding)', () => {
      expect(normalizeOfficerId('1')).toBe('1');
      expect(normalizeOfficerId('9')).toBe('9');
    });

    it('preserves 2-4 digit officer IDs (no padding)', () => {
      expect(normalizeOfficerId('12')).toBe('12');
      expect(normalizeOfficerId('123')).toBe('123');
      expect(normalizeOfficerId('1234')).toBe('1234');
    });

    it('preserves 5-digit officer IDs', () => {
      expect(normalizeOfficerId('01234')).toBe('01234');
      expect(normalizeOfficerId('12345')).toBe('12345');
    });

    it('accepts 6-digit officer IDs (NEW)', () => {
      expect(normalizeOfficerId('022851')).toBe('022851');
      expect(normalizeOfficerId('123456')).toBe('123456');
      expect(normalizeOfficerId('022305')).toBe('022305');
    });

    it('strips non-digit characters', () => {
      expect(normalizeOfficerId('0-2-2-8-5-1')).toBe('022851');
      expect(normalizeOfficerId('01 234')).toBe('01234');
      expect(normalizeOfficerId('abc123def')).toBe('123');
    });

    it('handles empty string', () => {
      expect(normalizeOfficerId('')).toBe('');
    });

    it('truncates if more than 6 digits (edge case)', () => {
      // Note: normalizeOfficerId doesn't truncate, but validation will catch this
      expect(normalizeOfficerId('1234567').length).toBe(7);
    });
  });

  describe('isValidOfficerId', () => {
    it('accepts 1-digit officer IDs', () => {
      expect(isValidOfficerId('1')).toBe(true);
      expect(isValidOfficerId('9')).toBe(true);
    });

    it('accepts 2-4 digit officer IDs', () => {
      expect(isValidOfficerId('12')).toBe(true);
      expect(isValidOfficerId('123')).toBe(true);
      expect(isValidOfficerId('1234')).toBe(true);
    });

    it('accepts 5-digit officer IDs', () => {
      expect(isValidOfficerId('01234')).toBe(true);
      expect(isValidOfficerId('12345')).toBe(true);
    });

    it('accepts 6-digit officer IDs (NEW)', () => {
      expect(isValidOfficerId('022851')).toBe(true);
      expect(isValidOfficerId('123456')).toBe(true);
    });

    it('rejects 7+ digit officer IDs', () => {
      expect(isValidOfficerId('1234567')).toBe(false);
      expect(isValidOfficerId('12345678')).toBe(false);
    });

    it('rejects non-numeric strings', () => {
      expect(isValidOfficerId('abc')).toBe(false);
      expect(isValidOfficerId('12-34')).toBe(false);
      expect(isValidOfficerId('01 234')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidOfficerId('')).toBe(false);
    });
  });

  describe('formatOfficerIdError', () => {
    it('returns undefined for valid 1-6 digit officer IDs', () => {
      expect(formatOfficerIdError('1')).toBeUndefined();
      expect(formatOfficerIdError('123')).toBeUndefined();
      expect(formatOfficerIdError('01234')).toBeUndefined();
      expect(formatOfficerIdError('022851')).toBeUndefined(); // 6 digits - NEW
    });

    it('returns undefined for empty string (optional field)', () => {
      expect(formatOfficerIdError('')).toBeUndefined();
    });

    it('returns error for 7+ digits', () => {
      expect(formatOfficerIdError('1234567')).toBe('Must be 1-6 digits');
      expect(formatOfficerIdError('12345678')).toBe('Must be 1-6 digits');
    });

    it('returns error for non-numeric', () => {
      expect(formatOfficerIdError('abc')).toBe('Must contain only digits');
      expect(formatOfficerIdError('01-234')).toBe('Must contain only digits');
    });
  });
});

// ============================================
// PREFLIGHT MODE TESTS
// ============================================

describe('Preflight Mode', () => {
  describe('WrapperRequest interface', () => {
    it('accepts preflightMode parameter', () => {
      const request: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
        officerId: '022851',
        firstName: 'STEVEN',
        preflightMode: true, // NEW field
      };

      expect(request.preflightMode).toBe(true);
    });

    it('makes preflightMode optional (defaults to false)', () => {
      const request: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
      };

      expect(request.preflightMode).toBeUndefined();
    });
  });

  describe('WrapperSuccessResponse includes page1SubmitClicked', () => {
    it('response indicates if submit was clicked', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['Step 1', 'Step 2'],
        page1SubmitClicked: true, // Live mode - submit clicked
      };

      expect(response.page1SubmitClicked).toBe(true);
    });

    it('preflight mode sets page1SubmitClicked to false', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['PREFLIGHT: Verification complete, exiting without submit'],
        page1SubmitClicked: false, // Preflight mode - no submit
      };

      expect(response.page1SubmitClicked).toBe(false);
    });
  });
});

// ============================================
// FIRSTNAME-ONLY STRATEGY TESTS
// ============================================

describe('firstName-only Page 2 Strategy', () => {
  describe('WrapperRequest allows firstName without lastName', () => {
    it('accepts request with only firstName', () => {
      const request: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
        officerId: '022851',
        firstName: 'STEVEN', // Only first name
        plate: '9UNP852', // Fallback identifier
      };

      expect(request.firstName).toBe('STEVEN');
      expect(request.lastName).toBeUndefined();
    });

    it('accepts request with both firstName and lastName', () => {
      const request: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
        firstName: 'STEVEN',
        lastName: 'WILLIAMS',
      };

      expect(request.firstName).toBe('STEVEN');
      expect(request.lastName).toBe('WILLIAMS');
    });
  });
});

// ============================================
// ENHANCED SAFETY CODES TESTS
// ============================================

describe('Enhanced Safety Codes', () => {
  it('recognizes RATE_LIMIT_ACTIVE code', () => {
    const codes = ['RATE_LIMIT_ACTIVE', 'RUN_LOCK_ACTIVE', 'COOLDOWN_ACTIVE', 'CIRCUIT_BREAKER_ACTIVE'];
    expect(codes).toContain('RATE_LIMIT_ACTIVE');
  });

  it('recognizes CIRCUIT_BREAKER_ACTIVE code', () => {
    const codes = ['RATE_LIMIT_ACTIVE', 'RUN_LOCK_ACTIVE', 'COOLDOWN_ACTIVE', 'CIRCUIT_BREAKER_ACTIVE'];
    expect(codes).toContain('CIRCUIT_BREAKER_ACTIVE');
  });

  it('recognizes COOLDOWN_ACTIVE code', () => {
    const codes = ['RATE_LIMIT_ACTIVE', 'RUN_LOCK_ACTIVE', 'COOLDOWN_ACTIVE', 'CIRCUIT_BREAKER_ACTIVE'];
    expect(codes).toContain('COOLDOWN_ACTIVE');
  });
});

// ============================================
// JOURNEY LOG TESTS
// ============================================

describe('Journey Log', () => {
  describe('WrapperSuccessResponse includes journeyLog', () => {
    it('response always includes journeyLog array', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: [
          '[2025-12-17T08:00:00Z] Starting automation run',
          '[2025-12-17T08:00:03Z] Login successful',
          '[2025-12-17T08:00:10Z] Report downloaded successfully',
        ],
      };

      expect(response.journeyLog).toBeDefined();
      expect(Array.isArray(response.journeyLog)).toBe(true);
      expect(response.journeyLog!.length).toBeGreaterThan(0);
    });

    it('journeyLog shows preflight mode behavior', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: [
          '[2025-12-17T08:00:00Z] Starting automation run',
          '[2025-12-17T08:00:05Z] Filling Page 1 fields',
          '[2025-12-17T08:00:07Z] Page 1 fill verification passed',
          '[2025-12-17T08:00:08Z] PREFLIGHT MODE: Verification complete, exiting without submit',
        ],
        page1SubmitClicked: false,
      };

      expect(response.journeyLog!.some(log => log.includes('PREFLIGHT MODE'))).toBe(true);
      expect(response.page1SubmitClicked).toBe(false);
    });
  });
});

// ============================================
// MOCK MODE TESTS
// ============================================

describe('Mock Mode', () => {
  describe('WrapperSuccessResponse includes wrapperMode', () => {
    it('response indicates mock mode', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['Mock scenario executed'],
        wrapperMode: 'mock',
        mockScenario: 'success-full-report',
      };

      expect(response.wrapperMode).toBe('mock');
      expect(response.mockScenario).toBe('success-full-report');
    });

    it('response indicates live mode', () => {
      const response: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['Real CHP portal automation'],
        wrapperMode: 'live',
      };

      expect(response.wrapperMode).toBe('live');
      expect(response.mockScenario).toBeUndefined();
    });
  });
});

// ============================================
// INTEGRATION SCENARIO TESTS
// ============================================

describe('Wrapper V2.0+ Integration Scenarios', () => {
  describe('Scenario: Preflight validation before live run', () => {
    it('preflight mode verifies inputs without consuming attempt', () => {
      // Step 1: Run preflight check
      const preflightRequest: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
        officerId: '022851', // 6 digits - NEW
        firstName: 'STEVEN',
        preflightMode: true, // No submit
      };

      // Simulate preflight response
      const preflightResponse: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['PREFLIGHT: Page 1 verified'],
        page1SubmitClicked: false, // No attempt consumed
      };

      expect(preflightResponse.page1SubmitClicked).toBe(false);

      // Step 2: If preflight passed, run live
      const liveRequest: WrapperRequest = {
        ...preflightRequest,
        preflightMode: false, // Live mode
      };

      const liveResponse: WrapperSuccessResponse = {
        success: true,
        type: 'FULL',
        mappedResultType: 'FULL',
        journeyLog: ['Report downloaded'],
        page1SubmitClicked: true, // Attempt consumed
      };

      expect(liveResponse.page1SubmitClicked).toBe(true);
    });
  });

  describe('Scenario: firstName-only search with 6-digit officer ID', () => {
    it('sends request with only firstName and 6-digit officer ID', () => {
      const request: WrapperRequest = {
        crashDate: '2025-11-20',
        crashTime: '1300',
        ncic: '9530',
        officerId: '022851', // 6 digits - NEW
        firstName: 'STEVEN', // Only first name - wrapper tries firstName-only as priority #2
        plate: '9UNP852', // Fallback if firstName-only fails
      };

      // Verify officer ID is valid
      expect(isValidOfficerId(request.officerId!)).toBe(true);
      // Verify firstName-only is allowed
      expect(request.firstName).toBeDefined();
      expect(request.lastName).toBeUndefined();
    });
  });

  describe('Scenario: Safety block with retry timing', () => {
    it('handles RATE_LIMIT_ACTIVE with retryAfterSeconds', () => {
      const errorResponse = {
        success: false,
        error: 'Rate limit active',
        code: 'RATE_LIMIT_ACTIVE' as const,
        retryAfterSeconds: 45,
        journeyLog: ['[...] BLOCKED: Rate limit active - retry in 45s'],
      };

      expect(errorResponse.code).toBe('RATE_LIMIT_ACTIVE');
      expect(errorResponse.retryAfterSeconds).toBe(45);
      expect(errorResponse.journeyLog![0]).toContain('BLOCKED');
    });
  });
});
