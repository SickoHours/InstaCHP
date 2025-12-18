/**
 * Page 1 Guardrails Unit Tests
 *
 * Tests for consumedPage1Attempt() and isPage1Rejection() to ensure
 * we never regress on the critical logic of when to increment page1FailureCount.
 *
 * The golden rule: page1FailureCount should ONLY increment when:
 * 1. page1SubmitClicked === true (the Page 1 form was actually submitted)
 * 2. AND the result is a Page 1 rejection (PAGE1_NOT_FOUND or PAGE1_REJECTED_ATTEMPT_RISK)
 *
 * @version V2.7.0
 */

import { describe, it, expect } from 'vitest';
import { isPage1Rejection, consumedPage1Attempt } from '@/lib/wrapperClient';
import {
  getPage1FailureCount,
  isPage1Locked,
  needsPage1Confirmation,
  getPage1WarningLevel,
  canRunWrapperForPage1,
} from '@/lib/jobUIHelpers';
import type { Job, WrapperResult } from '@/lib/types';

// ============================================
// isPage1Rejection() TESTS
// ============================================

describe('isPage1Rejection', () => {
  it('returns true for PAGE1_NOT_FOUND', () => {
    expect(isPage1Rejection('PAGE1_NOT_FOUND')).toBe(true);
  });

  it('returns true for PAGE1_REJECTED_ATTEMPT_RISK', () => {
    expect(isPage1Rejection('PAGE1_REJECTED_ATTEMPT_RISK')).toBe(true);
  });

  it('returns false for PAGE2_VERIFICATION_FAILED', () => {
    expect(isPage1Rejection('PAGE2_VERIFICATION_FAILED')).toBe(false);
  });

  it('returns false for FULL', () => {
    expect(isPage1Rejection('FULL')).toBe(false);
  });

  it('returns false for FACE_PAGE', () => {
    expect(isPage1Rejection('FACE_PAGE')).toBe(false);
  });

  it('returns false for PORTAL_ERROR', () => {
    expect(isPage1Rejection('PORTAL_ERROR')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isPage1Rejection(undefined)).toBe(false);
  });
});

// ============================================
// consumedPage1Attempt() TESTS
// ============================================

describe('consumedPage1Attempt', () => {
  // CRITICAL: The test matrix from requirements
  describe('test matrix - increment rules', () => {
    it('Pre-submit fail (page1SubmitClicked=false) → NOT consumed', () => {
      // Network error before submit
      expect(consumedPage1Attempt('PORTAL_ERROR', false)).toBe(false);

      // Validation error before submit
      expect(consumedPage1Attempt('PAGE1_NOT_FOUND', false)).toBe(false);

      // Even if result is PAGE1_REJECTED_ATTEMPT_RISK, no consume if not clicked
      expect(consumedPage1Attempt('PAGE1_REJECTED_ATTEMPT_RISK', false)).toBe(false);
    });

    it('Page 1 rejected (page1SubmitClicked=true, PAGE1_NOT_FOUND) → CONSUMED', () => {
      expect(consumedPage1Attempt('PAGE1_NOT_FOUND', true)).toBe(true);
    });

    it('Page 1 rejected (page1SubmitClicked=true, PAGE1_REJECTED_ATTEMPT_RISK) → CONSUMED', () => {
      expect(consumedPage1Attempt('PAGE1_REJECTED_ATTEMPT_RISK', true)).toBe(true);
    });

    it('Page 2 failed (page1SubmitClicked=true, PAGE2_VERIFICATION_FAILED) → NOT consumed', () => {
      // Page 1 was successful, only Page 2 failed - don't count against Page 1 attempts
      expect(consumedPage1Attempt('PAGE2_VERIFICATION_FAILED', true)).toBe(false);
    });

    it('Success (page1SubmitClicked=true, FULL) → NOT consumed', () => {
      expect(consumedPage1Attempt('FULL', true)).toBe(false);
    });

    it('Success (page1SubmitClicked=true, FACE_PAGE) → NOT consumed', () => {
      expect(consumedPage1Attempt('FACE_PAGE', true)).toBe(false);
    });

    it('Portal error (page1SubmitClicked=true, PORTAL_ERROR) → NOT consumed', () => {
      // Technical errors don't count against Page 1 attempts
      expect(consumedPage1Attempt('PORTAL_ERROR', true)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false when result is undefined', () => {
      expect(consumedPage1Attempt(undefined, true)).toBe(false);
      expect(consumedPage1Attempt(undefined, false)).toBe(false);
      expect(consumedPage1Attempt(undefined, undefined)).toBe(false);
    });

    it('returns false when page1SubmitClicked is undefined', () => {
      expect(consumedPage1Attempt('PAGE1_NOT_FOUND', undefined)).toBe(false);
      expect(consumedPage1Attempt('PAGE1_REJECTED_ATTEMPT_RISK', undefined)).toBe(false);
    });

    it('handles all WrapperResult types gracefully', () => {
      const allResults: WrapperResult[] = [
        'FULL',
        'FACE_PAGE',
        'PAGE1_NOT_FOUND',
        'PAGE1_REJECTED_ATTEMPT_RISK',
        'PAGE2_VERIFICATION_FAILED',
        'PORTAL_ERROR',
      ];

      allResults.forEach((result) => {
        // Should not throw
        expect(() => consumedPage1Attempt(result, true)).not.toThrow();
        expect(() => consumedPage1Attempt(result, false)).not.toThrow();

        // Only Page 1 rejections with submit clicked should return true
        const expected = (result === 'PAGE1_NOT_FOUND' || result === 'PAGE1_REJECTED_ATTEMPT_RISK');
        expect(consumedPage1Attempt(result, true)).toBe(expected);
      });
    });
  });
});

// ============================================
// PAGE 1 UI HELPER TESTS
// ============================================

describe('Page1 UI Helpers', () => {
  // Factory for creating test jobs with minimal required fields
  const createTestJob = (overrides: Partial<Job> = {}): Job => ({
    _id: 'test_job',
    lawFirmId: 'lf_001',
    lawFirmName: 'Test Law Firm',
    clientName: 'Test Client',
    clientType: null,
    reportNumber: '9234-2024-56789',
    ncic: '9234',
    internalStatus: 'NEW',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  } as Job);

  describe('getPage1FailureCount', () => {
    it('returns 0 when page1FailureCount is undefined', () => {
      const job = createTestJob();
      expect(getPage1FailureCount(job)).toBe(0);
    });

    it('returns 0 when page1FailureCount is 0', () => {
      const job = createTestJob({ page1FailureCount: 0 });
      expect(getPage1FailureCount(job)).toBe(0);
    });

    it('returns the actual count when set', () => {
      expect(getPage1FailureCount(createTestJob({ page1FailureCount: 1 }))).toBe(1);
      expect(getPage1FailureCount(createTestJob({ page1FailureCount: 2 }))).toBe(2);
      expect(getPage1FailureCount(createTestJob({ page1FailureCount: 5 }))).toBe(5);
    });
  });

  describe('isPage1Locked', () => {
    it('returns false for 0 failures', () => {
      const job = createTestJob({ page1FailureCount: 0 });
      expect(isPage1Locked(job)).toBe(false);
    });

    it('returns false for 1 failure', () => {
      const job = createTestJob({ page1FailureCount: 1 });
      expect(isPage1Locked(job)).toBe(false);
    });

    it('returns true for 2 failures (locked threshold)', () => {
      const job = createTestJob({ page1FailureCount: 2 });
      expect(isPage1Locked(job)).toBe(true);
    });

    it('returns true for more than 2 failures', () => {
      const job = createTestJob({ page1FailureCount: 3 });
      expect(isPage1Locked(job)).toBe(true);
      expect(isPage1Locked(createTestJob({ page1FailureCount: 10 }))).toBe(true);
    });

    it('returns false for undefined page1FailureCount', () => {
      const job = createTestJob();
      expect(isPage1Locked(job)).toBe(false);
    });
  });

  describe('needsPage1Confirmation', () => {
    it('returns false for 0 failures', () => {
      const job = createTestJob({ page1FailureCount: 0 });
      expect(needsPage1Confirmation(job)).toBe(false);
    });

    it('returns true for exactly 1 failure (confirmation required)', () => {
      const job = createTestJob({ page1FailureCount: 1 });
      expect(needsPage1Confirmation(job)).toBe(true);
    });

    it('returns false for 2+ failures (already locked)', () => {
      expect(needsPage1Confirmation(createTestJob({ page1FailureCount: 2 }))).toBe(false);
      expect(needsPage1Confirmation(createTestJob({ page1FailureCount: 3 }))).toBe(false);
    });

    it('returns false for undefined page1FailureCount', () => {
      const job = createTestJob();
      expect(needsPage1Confirmation(job)).toBe(false);
    });
  });

  describe('getPage1WarningLevel', () => {
    it('returns "caution" for 0 failures', () => {
      expect(getPage1WarningLevel(createTestJob({ page1FailureCount: 0 }))).toBe('caution');
      expect(getPage1WarningLevel(createTestJob())).toBe('caution');
    });

    it('returns "danger" for 1 failure', () => {
      expect(getPage1WarningLevel(createTestJob({ page1FailureCount: 1 }))).toBe('danger');
    });

    it('returns "locked" for 2+ failures', () => {
      expect(getPage1WarningLevel(createTestJob({ page1FailureCount: 2 }))).toBe('locked');
      expect(getPage1WarningLevel(createTestJob({ page1FailureCount: 5 }))).toBe('locked');
    });
  });

  describe('canRunWrapperForPage1', () => {
    it('returns true when not locked', () => {
      expect(canRunWrapperForPage1(createTestJob({ page1FailureCount: 0 }))).toBe(true);
      expect(canRunWrapperForPage1(createTestJob({ page1FailureCount: 1 }))).toBe(true);
    });

    it('returns false when locked', () => {
      expect(canRunWrapperForPage1(createTestJob({ page1FailureCount: 2 }))).toBe(false);
      expect(canRunWrapperForPage1(createTestJob({ page1FailureCount: 3 }))).toBe(false);
    });
  });
});

// ============================================
// INTEGRATION SCENARIO TESTS
// ============================================

describe('Page 1 Guardrails - Integration Scenarios', () => {
  describe('Complete flow: Fresh job through lockout', () => {
    // Simulate the entire flow from first attempt to lockout
    it('tracks failures correctly through the entire flow', () => {
      let page1FailureCount = 0;

      // Scenario 1: First run - validation error (pre-submit)
      // This should NOT count because page1SubmitClicked was false
      const run1 = consumedPage1Attempt('PAGE1_NOT_FOUND', false);
      expect(run1).toBe(false);
      if (run1) page1FailureCount++;
      expect(page1FailureCount).toBe(0); // Still 0

      // Scenario 2: Second run - network error before submit
      const run2 = consumedPage1Attempt('PORTAL_ERROR', false);
      expect(run2).toBe(false);
      if (run2) page1FailureCount++;
      expect(page1FailureCount).toBe(0); // Still 0

      // Scenario 3: Third run - REAL Page 1 submission, but not found
      const run3 = consumedPage1Attempt('PAGE1_NOT_FOUND', true);
      expect(run3).toBe(true); // This counts!
      if (run3) page1FailureCount++;
      expect(page1FailureCount).toBe(1); // Now 1

      // At this point, needsPage1Confirmation should be true
      const mockJob1 = { page1FailureCount } as Job;
      expect(needsPage1Confirmation(mockJob1)).toBe(true);
      expect(isPage1Locked(mockJob1)).toBe(false);

      // Scenario 4: Fourth run - Page 2 failed (Page 1 passed!)
      const run4 = consumedPage1Attempt('PAGE2_VERIFICATION_FAILED', true);
      expect(run4).toBe(false); // Page 1 was fine
      if (run4) page1FailureCount++;
      expect(page1FailureCount).toBe(1); // Still 1

      // Scenario 5: Fifth run - Another Page 1 rejection after confirmation
      const run5 = consumedPage1Attempt('PAGE1_REJECTED_ATTEMPT_RISK', true);
      expect(run5).toBe(true); // This counts!
      if (run5) page1FailureCount++;
      expect(page1FailureCount).toBe(2); // Now 2

      // At this point, job should be locked
      const mockJob2 = { page1FailureCount } as Job;
      expect(isPage1Locked(mockJob2)).toBe(true);
      expect(needsPage1Confirmation(mockJob2)).toBe(false);
      expect(getPage1WarningLevel(mockJob2)).toBe('locked');
      expect(canRunWrapperForPage1(mockJob2)).toBe(false);
    });
  });

  describe('Edge case: Success after failures', () => {
    it('success does not decrement failure count but allows operation', () => {
      let page1FailureCount = 1; // After one failure

      // Success with submit - does NOT consume attempt
      const run = consumedPage1Attempt('FULL', true);
      expect(run).toBe(false);
      if (run) page1FailureCount++;
      expect(page1FailureCount).toBe(1); // Count unchanged

      // Job is still operational with 1 failure
      const mockJob = { page1FailureCount } as Job;
      expect(isPage1Locked(mockJob)).toBe(false);
      expect(canRunWrapperForPage1(mockJob)).toBe(true);
    });
  });

  describe('Edge case: All failure types in sequence', () => {
    it('correctly identifies which failures consume attempts', () => {
      const scenarios: Array<{
        result: WrapperResult;
        clicked: boolean;
        expected: boolean;
        description: string;
      }> = [
        { result: 'PORTAL_ERROR', clicked: false, expected: false, description: 'Network error (pre-submit)' },
        { result: 'PAGE1_NOT_FOUND', clicked: false, expected: false, description: 'Validation fail (pre-submit)' },
        { result: 'PAGE1_NOT_FOUND', clicked: true, expected: true, description: 'Page 1 not found (submitted)' },
        { result: 'PAGE1_REJECTED_ATTEMPT_RISK', clicked: true, expected: true, description: 'Page 1 attempt risk (submitted)' },
        { result: 'PAGE2_VERIFICATION_FAILED', clicked: true, expected: false, description: 'Page 2 failed (Page 1 OK)' },
        { result: 'FULL', clicked: true, expected: false, description: 'Success - full report' },
        { result: 'FACE_PAGE', clicked: true, expected: false, description: 'Success - face page' },
        { result: 'PORTAL_ERROR', clicked: true, expected: false, description: 'Portal error (submitted)' },
      ];

      scenarios.forEach(({ result, clicked, expected, description }) => {
        const consumed = consumedPage1Attempt(result, clicked);
        expect(consumed).toBe(expected);
        // Log for debugging if test fails
        if (consumed !== expected) {
          console.error(`FAILED: ${description} - expected ${expected}, got ${consumed}`);
        }
      });
    });
  });
});


