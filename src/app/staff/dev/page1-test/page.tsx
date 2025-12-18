'use client';

/**
 * Dev Test Panel: Page 1 Attempt Guardrails Verification
 *
 * This page allows developers to:
 * 1. Trigger mock wrapper runs with specific outcomes
 * 2. Verify that page1FailureCount only increments on consumed Page 1 attempts
 * 3. Test the guardrail UI components (warning, confirmation, locked)
 *
 * ACCESS GATING:
 * - Always accessible in development (NODE_ENV=development)
 * - In production: requires DEV_TOOLS_ENABLED=1 AND admin user
 *
 * @version V2.7.1
 * @dev-only This page should not be accessible in production without explicit enablement
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData } from '@/context/MockDataContext';
import { isPage1Rejection, consumedPage1Attempt } from '@/lib/wrapperClient';
import {
  getPage1FailureCount,
  isPage1Locked,
  needsPage1Confirmation,
} from '@/lib/jobUIHelpers';
import { canAccessDevTools, DEV_MODE } from '@/lib/devConfig';
import type { Job, WrapperResult } from '@/lib/types';
import {
  Page1WarningBanner,
  Page1ConfirmationModal,
  Page1LockedBanner,
} from '@/components/ui/Page1AttemptGuard';
import Page1FailureCard from '@/components/ui/Page1FailureCard';

// ============================================
// TEST CASE DEFINITIONS
// ============================================

interface MockWrapperResult {
  id: string;
  name: string;
  description: string;
  result: WrapperResult;
  page1SubmitClicked: boolean;
  shouldIncrementFailure: boolean;
  category: 'pre_submit' | 'page1_rejection' | 'page2_failure' | 'success' | 'error';
}

const TEST_CASES: MockWrapperResult[] = [
  // Pre-submit failures (should NOT increment)
  {
    id: 'validation_error',
    name: 'Validation Error (Pre-Submit)',
    description: 'Form validation failed before Page 1 submit',
    result: 'PAGE1_NOT_FOUND',
    page1SubmitClicked: false,
    shouldIncrementFailure: false,
    category: 'pre_submit',
  },
  {
    id: 'network_before_submit',
    name: 'Network Error (Pre-Submit)',
    description: 'Network error before reaching Page 1',
    result: 'PORTAL_ERROR',
    page1SubmitClicked: false,
    shouldIncrementFailure: false,
    category: 'pre_submit',
  },

  // Page 1 rejections (SHOULD increment)
  {
    id: 'page1_not_found',
    name: 'Page 1 Not Found',
    description: 'CHP portal returned no matching report',
    result: 'PAGE1_NOT_FOUND',
    page1SubmitClicked: true,
    shouldIncrementFailure: true,
    category: 'page1_rejection',
  },
  {
    id: 'page1_attempt_risk',
    name: 'Page 1 Attempt Risk',
    description: 'CHP detected too many attempts',
    result: 'PAGE1_REJECTED_ATTEMPT_RISK',
    page1SubmitClicked: true,
    shouldIncrementFailure: true,
    category: 'page1_rejection',
  },

  // Page 2 failures (should NOT increment)
  {
    id: 'page2_verification_failed',
    name: 'Page 2 Verification Failed',
    description: 'Page 1 passed, but Page 2 verification failed',
    result: 'PAGE2_VERIFICATION_FAILED',
    page1SubmitClicked: true,
    shouldIncrementFailure: false,
    category: 'page2_failure',
  },

  // Success cases (should NOT increment)
  {
    id: 'success_full',
    name: 'Success - Full Report',
    description: 'Full CHP report retrieved',
    result: 'FULL',
    page1SubmitClicked: true,
    shouldIncrementFailure: false,
    category: 'success',
  },
  {
    id: 'success_face_page',
    name: 'Success - Face Page',
    description: 'Face page retrieved',
    result: 'FACE_PAGE',
    page1SubmitClicked: true,
    shouldIncrementFailure: false,
    category: 'success',
  },

  // Portal errors (should NOT increment)
  {
    id: 'portal_error',
    name: 'Portal Error',
    description: 'Technical error with CHP portal',
    result: 'PORTAL_ERROR',
    page1SubmitClicked: true,
    shouldIncrementFailure: false,
    category: 'error',
  },
];

// ============================================
// HELPER COMPONENTS
// ============================================

function TestResultBadge({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        passed
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      )}
    >
      {passed ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: MockWrapperResult['category'] }) {
  const config = {
    pre_submit: { color: 'bg-slate-500/20 text-slate-400', label: 'Pre-Submit' },
    page1_rejection: { color: 'bg-red-500/20 text-red-400', label: 'Page 1 Rejection' },
    page2_failure: { color: 'bg-amber-500/20 text-amber-400', label: 'Page 2 Failure' },
    success: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Success' },
    error: { color: 'bg-orange-500/20 text-orange-400', label: 'Error' },
  };

  const { color, label } = config[category];

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', color)}>
      {label}
    </span>
  );
}

// ============================================
// ACCESS DENIED COMPONENT
// ============================================

function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">
          This page is only accessible in development mode or when{' '}
          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">DEV_TOOLS_ENABLED=1</code>{' '}
          is set with admin access.
        </p>
        <Link
          href="/staff"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Staff Dashboard
        </Link>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function Page1GuardrailsTestPage() {
  const { getAllJobs, updateJob, getJobById } = useMockData();

  // Access gating: Only allow in dev mode or with DEV_TOOLS_ENABLED=1 + admin
  const hasAccess = canAccessDevTools();

  // State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Array<{
      testCase: MockWrapperResult;
      beforeCount: number;
      afterCount: number;
      passed: boolean;
      consumedAttempt: boolean;
      isRejection: boolean;
    }>
  >([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [, setRefresh] = useState(0); // Force re-render after updates

  // Gate access before any other logic
  if (!hasAccess) {
    return <AccessDenied />;
  }

  // Get all jobs from the mock data manager
  const jobs = getAllJobs();

  // Get test jobs - any job can be used for testing
  const testJobs = jobs.slice(0, 5); // Use first 5 jobs as test candidates
  const selectedJob = selectedJobId
    ? getJobById(selectedJobId)
    : null;

  // Computed values for selected job
  const page1FailureCount = selectedJob ? getPage1FailureCount(selectedJob) : 0;
  const page1Locked = selectedJob ? isPage1Locked(selectedJob) : false;
  const needsConfirmation = selectedJob ? needsPage1Confirmation(selectedJob) : false;

  // Run a single test case
  const runTestCase = useCallback(
    async (testCase: MockWrapperResult) => {
      if (!selectedJobId) return null;

      const currentJob = getJobById(selectedJobId);
      if (!currentJob) return null;

      const beforeCount = getPage1FailureCount(currentJob);

      // Calculate what should happen
      const isRejection = isPage1Rejection(testCase.result);
      const consumedAttempt = consumedPage1Attempt(
        testCase.result,
        testCase.page1SubmitClicked
      );

      // Update the job based on the test case
      const newCount = consumedAttempt ? beforeCount + 1 : beforeCount;

      updateJob(selectedJobId, {
        page1FailureCount: newCount,
        lastPage1FailureAt: consumedAttempt ? Date.now() : currentJob.lastPage1FailureAt,
      });

      setRefresh((r) => r + 1); // Force UI update

      // Verify the result
      const passed = consumedAttempt === testCase.shouldIncrementFailure;

      return {
        testCase,
        beforeCount,
        afterCount: newCount,
        passed,
        consumedAttempt,
        isRejection,
      };
    },
    [selectedJobId, getJobById, updateJob]
  );

  // Run all test cases
  const runAllTests = useCallback(async () => {
    if (!selectedJobId) return;

    const initialJob = getJobById(selectedJobId);
    if (!initialJob) return;

    setIsRunningAll(true);
    setTestResults([]);

    // Reset the job first
    updateJob(selectedJobId, {
      page1FailureCount: 0,
      lastPage1FailureAt: undefined,
    });

    // Wait for state to update
    await new Promise((r) => setTimeout(r, 100));

    const results: typeof testResults = [];

    for (const testCase of TEST_CASES) {
      // Get fresh job state
      const currentJob = getJobById(selectedJobId);
      if (!currentJob) continue;

      const beforeCount = getPage1FailureCount(currentJob);
      const isRejection = isPage1Rejection(testCase.result);
      const consumedAttempt = consumedPage1Attempt(
        testCase.result,
        testCase.page1SubmitClicked
      );

      const newCount = consumedAttempt ? beforeCount + 1 : beforeCount;

      updateJob(selectedJobId, {
        page1FailureCount: newCount,
        lastPage1FailureAt: consumedAttempt ? Date.now() : currentJob.lastPage1FailureAt,
      });

      const passed = consumedAttempt === testCase.shouldIncrementFailure;

      results.push({
        testCase,
        beforeCount,
        afterCount: newCount,
        passed,
        consumedAttempt,
        isRejection,
      });

      // Small delay between tests for visual feedback
      await new Promise((r) => setTimeout(r, 50));
    }

    setTestResults(results);
    setIsRunningAll(false);
    setRefresh((r) => r + 1); // Force UI update
  }, [selectedJobId, getJobById, updateJob]);

  // Reset job failure count
  const resetJobFailures = useCallback(() => {
    if (!selectedJobId) return;
    updateJob(selectedJobId, {
      page1FailureCount: 0,
      lastPage1FailureAt: undefined,
    });
    setTestResults([]);
    setRefresh((r) => r + 1); // Force UI update
  }, [selectedJobId, updateJob]);

  // Calculate test summary
  const passedTests = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;
  const allPassed = passedTests === totalTests && totalTests > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/staff"
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Page 1 Guardrails Test Panel</h1>
              {DEV_MODE && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DEV MODE
                </span>
              )}
              {!DEV_MODE && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ADMIN TOOLS
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">
              Test Page 1 attempt tracking logic with mock scenarios
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Test Matrix Rules:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li>
                  <strong>page1FailureCount</strong> should ONLY increment when{' '}
                  <code className="bg-blue-500/20 px-1 rounded">
                    consumedPage1Attempt() === true
                  </code>
                </li>
                <li>
                  <code className="bg-blue-500/20 px-1 rounded">consumedPage1Attempt()</code>{' '}
                  returns true only when{' '}
                  <code className="bg-blue-500/20 px-1 rounded">page1SubmitClicked === true</code>{' '}
                  AND result is a Page 1 rejection
                </li>
                <li>
                  Pre-submit failures, Page 2 failures, and successes should NEVER increment
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Job Selection */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <label className="block text-sm text-slate-400 mb-2">Select Test Job:</label>
          <div className="flex flex-wrap gap-2">
            {testJobs.map((job) => (
              <button
                key={job._id}
                onClick={() => {
                  setSelectedJobId(job._id);
                  setTestResults([]);
                }}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedJobId === job._id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                )}
              >
                {job.clientName}
                <span className="ml-2 text-xs text-slate-500">
                  ({getPage1FailureCount(job)} failures)
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedJob && (
          <>
            {/* Current Job State */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Current Job State</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">page1FailureCount</div>
                  <div className="text-2xl font-bold text-cyan-400">{page1FailureCount}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">isPage1Locked</div>
                  <div
                    className={cn(
                      'text-lg font-bold',
                      page1Locked ? 'text-red-400' : 'text-emerald-400'
                    )}
                  >
                    {page1Locked ? 'LOCKED' : 'NO'}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">needsPage1Confirmation</div>
                  <div
                    className={cn(
                      'text-lg font-bold',
                      needsConfirmation ? 'text-amber-400' : 'text-slate-400'
                    )}
                  >
                    {needsConfirmation ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">UI State</div>
                  <div className="text-sm font-medium text-slate-300">
                    {page1Locked
                      ? '🔒 Show LockedBanner'
                      : page1FailureCount === 0
                      ? '⚠️ Show WarningBanner'
                      : needsConfirmation
                      ? '🔐 Show ConfirmModal on Run'
                      : '✅ Normal'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={runAllTests}
                  disabled={isRunningAll}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium flex items-center gap-2',
                    'bg-gradient-to-r from-amber-500 to-cyan-600 text-white',
                    'hover:from-amber-400 hover:to-cyan-500',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Play className="w-4 h-4" />
                  {isRunningAll ? 'Running Tests...' : 'Run All Test Cases'}
                </button>
                <button
                  onClick={resetJobFailures}
                  className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Failure Count
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  Test Confirm Modal
                </button>
              </div>
            </div>

            {/* UI Component Preview */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">UI Component Preview</h2>
              <div className="space-y-4">
                {page1Locked && <Page1LockedBanner />}
                {page1FailureCount === 0 && <Page1WarningBanner />}
                {page1FailureCount > 0 && !page1Locked && (
                  <Page1FailureCard
                    resultType="PAGE1_NOT_FOUND"
                    attemptNumber={page1FailureCount}
                    crashDate="12/10/2025"
                    crashTime="0930"
                    reportNumber={selectedJob.reportNumber}
                    officerId="01234"
                  />
                )}
              </div>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Test Results</h2>
                  <TestResultBadge
                    passed={allPassed}
                    label={allPassed ? `All ${totalTests} tests passed` : `${passedTests}/${totalTests} passed`}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400">Test Case</th>
                        <th className="text-left py-2 px-3 text-slate-400">Category</th>
                        <th className="text-center py-2 px-3 text-slate-400">page1SubmitClicked</th>
                        <th className="text-center py-2 px-3 text-slate-400">isPage1Rejection</th>
                        <th className="text-center py-2 px-3 text-slate-400">consumedAttempt</th>
                        <th className="text-center py-2 px-3 text-slate-400">Before → After</th>
                        <th className="text-center py-2 px-3 text-slate-400">Expected</th>
                        <th className="text-center py-2 px-3 text-slate-400">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result, idx) => (
                        <tr
                          key={idx}
                          className={cn(
                            'border-b border-slate-700/50',
                            result.passed ? 'bg-emerald-500/5' : 'bg-red-500/10'
                          )}
                        >
                          <td className="py-2 px-3">
                            <div className="font-medium">{result.testCase.name}</div>
                            <div className="text-xs text-slate-500">{result.testCase.description}</div>
                          </td>
                          <td className="py-2 px-3">
                            <CategoryBadge category={result.testCase.category} />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs',
                                result.testCase.page1SubmitClicked
                                  ? 'bg-cyan-500/20 text-cyan-400'
                                  : 'bg-slate-600/50 text-slate-400'
                              )}
                            >
                              {result.testCase.page1SubmitClicked ? 'true' : 'false'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs',
                                result.isRejection
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-slate-600/50 text-slate-400'
                              )}
                            >
                              {result.isRejection ? 'true' : 'false'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                result.consumedAttempt
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-600/50 text-slate-400'
                              )}
                            >
                              {result.consumedAttempt ? 'true' : 'false'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            {result.beforeCount} → {result.afterCount}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-xs text-slate-400">
                              {result.testCase.shouldIncrementFailure ? 'INCREMENT' : 'NO CHANGE'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {result.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Helper Function Reference */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Helper Function Reference</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="font-medium text-cyan-400 mb-2">isPage1Rejection(result)</h3>
                  <pre className="text-xs text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto">
{`function isPage1Rejection(result) {
  return result === 'PAGE1_NOT_FOUND' 
      || result === 'PAGE1_REJECTED_ATTEMPT_RISK';
}`}
                  </pre>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="font-medium text-cyan-400 mb-2">consumedPage1Attempt(result, clicked)</h3>
                  <pre className="text-xs text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto">
{`function consumedPage1Attempt(result, clicked) {
  return clicked === true 
      && isPage1Rejection(result);
}`}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Page1ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          alert('Confirmed! Would run wrapper here.');
        }}
        expectedCrashDate={selectedJob?.crashDate || '12/10/2025'}
        expectedCrashTime={selectedJob?.crashTime || '0930'}
      />
    </div>
  );
}

