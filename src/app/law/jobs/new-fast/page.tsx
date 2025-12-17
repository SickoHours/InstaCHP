'use client';

/**
 * Fast Form - Primary Entry Point for CHP Report Requests (V2.5.0+)
 *
 * Accelerated form that collects Page 1 + Page 2 data upfront and runs
 * the wrapper immediately. For time-sensitive cases within the 72-hour window.
 *
 * Layout:
 * - Desktop: 2-column grid (Page 1 left, Page 2 right)
 * - Mobile: Stacked sections with 48px touch targets
 */

import { useState, useCallback, useMemo, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  FileText,
  User,
  Shield,
  Clock,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { WrapperSafetyBanner } from '@/components/ui/WrapperSafetyBanner';
import { Page1WarningBanner } from '@/components/ui/Page1AttemptGuard';
import {
  cn,
  deriveNcic,
  splitClientName,
  isValidReportNumber,
  isValidCrashTime,
  isValidOfficerId,
  generateId,
} from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useMockData } from '@/context/MockDataContext';
import { useTheme } from '@/context/ThemeContext';
import {
  runWrapper,
  isRetryableSafetyBlock,
  isTrueWrapperError,
  consumedPage1Attempt,
  type WrapperResponse,
  type SafetyBlockCode,
} from '@/lib/wrapperClient';
import type { InternalStatus } from '@/lib/types';

// ============================================
// TYPES
// ============================================

interface FastFormState {
  // Page 1 - CHP Portal Info
  reportNumber: string;
  crashDate: string; // YYYY-MM-DD
  crashTime: string; // HHMM
  officerId: string;
  // Page 2 - Verification
  clientFullName: string;
  plate: string;
  driverLicense: string;
  vin: string;
  // Legal
  perjuryAccepted: boolean;
}

interface FormErrors {
  reportNumber?: string;
  crashDate?: string;
  crashTime?: string;
  officerId?: string;
  clientFullName?: string;
  plate?: string;
  driverLicense?: string;
  vin?: string;
  perjuryAccepted?: string;
}

interface SafetyBlockState {
  code: SafetyBlockCode;
  retryAfter: number;
}

// ============================================
// INITIAL STATE
// ============================================

const initialFormState: FastFormState = {
  reportNumber: '',
  crashDate: '',
  crashTime: '',
  officerId: '',
  clientFullName: '',
  plate: '',
  driverLicense: '',
  vin: '',
  perjuryAccepted: false,
};

// ============================================
// COMPONENT
// ============================================

export default function FastFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createJob, addEvent, updateJob } = useMockData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form state
  const [formState, setFormState] = useState<FastFormState>(initialFormState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');

  // Safety block state
  const [safetyBlock, setSafetyBlock] = useState<SafetyBlockState | null>(null);

  // Auth modal state (for failure flow)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [failedJobId, setFailedJobId] = useState<string | null>(null);

  // Derived NCIC (first 4 digits of report number)
  const derivedNcic = useMemo(() => {
    return deriveNcic(formState.reportNumber);
  }, [formState.reportNumber]);

  // Parse client name into first/last
  const parsedName = useMemo(() => {
    return splitClientName(formState.clientFullName);
  }, [formState.clientFullName]);

  // ============================================
  // VALIDATION
  // ============================================

  const validateField = useCallback(
    (name: string, value: string | boolean): string | undefined => {
      switch (name) {
        case 'reportNumber':
          if (!value) return 'Report number is required';
          if (!isValidReportNumber(value as string)) {
            return 'Format: 9XXX-YYYY-ZZZZZ';
          }
          break;
        case 'crashDate':
          if (!value) return 'Crash date is required';
          // Check if date is in the future
          if (new Date(value as string) > new Date()) {
            return 'Crash date cannot be in the future';
          }
          break;
        case 'crashTime':
          if (!value) return 'Crash time is required';
          if (!isValidCrashTime(value as string)) {
            return 'Format: HHMM (e.g., 1430 for 2:30 PM)';
          }
          break;
        case 'officerId':
          if (value && !isValidOfficerId(value as string)) {
            return '5 digits (left-padded with zeros)';
          }
          break;
        case 'clientFullName':
          if (!value || (value as string).trim().length < 2) {
            return 'Name must be at least 2 characters';
          }
          break;
        case 'perjuryAccepted':
          if (!value) {
            return 'You must accept the perjury declaration';
          }
          break;
      }
      return undefined;
    },
    []
  );

  const handleChange = useCallback(
    (name: string, value: string | boolean) => {
      // Auto-format report number
      if (name === 'reportNumber' && typeof value === 'string') {
        let cleaned = value.replace(/[^\d-]/g, '');
        const digits = cleaned.replace(/-/g, '');
        if (digits.length > 4 && digits.length <= 8) {
          cleaned = `${digits.slice(0, 4)}-${digits.slice(4)}`;
        } else if (digits.length > 8) {
          cleaned = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 13)}`;
        } else {
          cleaned = digits;
        }
        value = cleaned;
      }

      // Auto-format crash time (digits only)
      if (name === 'crashTime' && typeof value === 'string') {
        value = value.replace(/\D/g, '').slice(0, 4);
      }

      // Auto-format officer ID (digits only)
      if (name === 'officerId' && typeof value === 'string') {
        value = value.replace(/\D/g, '').slice(0, 6);
      }

      setFormState((prev) => ({ ...prev, [name]: value }));

      // Validate on change if already touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const value = formState[name as keyof FastFormState];
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [formState, validateField]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required Page 1 fields
    newErrors.reportNumber = validateField('reportNumber', formState.reportNumber);
    newErrors.crashDate = validateField('crashDate', formState.crashDate);
    newErrors.crashTime = validateField('crashTime', formState.crashTime);
    newErrors.officerId = validateField('officerId', formState.officerId);

    // Required Page 2 fields
    newErrors.clientFullName = validateField('clientFullName', formState.clientFullName);

    // Required legal field
    newErrors.perjuryAccepted = validateField('perjuryAccepted', formState.perjuryAccepted);

    // Remove undefined values
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    setTouched({
      reportNumber: true,
      crashDate: true,
      crashTime: true,
      officerId: true,
      clientFullName: true,
      perjuryAccepted: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formState, validateField]);

  const isFieldValid = (name: string): boolean => {
    const value = formState[name as keyof FastFormState];
    const hasValue = typeof value === 'boolean' ? value : !!value;
    return touched[name] && hasValue && !errors[name as keyof FormErrors];
  };

  // ============================================
  // FORM SUBMISSION
  // ============================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous state
    setSafetyBlock(null);
    setShowAuthModal(false);

    if (!validateAll()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) as HTMLInputElement;
        element?.focus();
      }
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep('Running CHP wrapper...');

    // Generate job ID upfront for tracking
    const jobId = `job_${generateId()}`;

    try {
      // Call the real wrapper
      const result: WrapperResponse = await runWrapper({
        jobId,
        reportNumber: formState.reportNumber,
        crashDate: formState.crashDate,
        crashTime: formState.crashTime,
        ncic: derivedNcic,
        officerId: formState.officerId || undefined,
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        plate: formState.plate || undefined,
        driverLicense: formState.driverLicense || undefined,
        vin: formState.vin || undefined,
      });

      // Handle success
      if (result.success) {
        setSubmissionStep('Creating job...');

        let internalStatus: InternalStatus;
        if (result.mappedResultType === 'FULL') {
          internalStatus = 'COMPLETED_FULL_REPORT';
        } else {
          internalStatus = 'FACE_PAGE_ONLY';
        }

        // Create job with appropriate status
        const newJob = createJob({
          clientName: formState.clientFullName,
          reportNumber: formState.reportNumber,
          internalStatus,
        });

        // Update with Page 1 data
        // Note: No page1AttemptsHashes on success - only track failed Page 1 inputs
        updateJob(newJob._id, {
          crashDate: formState.crashDate,
          crashTime: formState.crashTime,
          officerId: formState.officerId || undefined,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          plate: formState.plate || undefined,
          driverLicense: formState.driverLicense || undefined,
          vin: formState.vin || undefined,
          facePageToken: result.downloadToken,
          fullReportToken: result.mappedResultType === 'FULL' ? result.downloadToken : undefined,
          wrapperRuns: [
            {
              runId: `run_${generateId()}`,
              timestamp: Date.now(),
              result: result.mappedResultType,
              duration: result.duration || 0,
              page1Passed: true,
            },
          ],
        });

        // Add timeline events
        addEvent(newJob._id, {
          eventType: 'fast_form_submitted',
          message: 'Fast Form submitted with all crash details',
          isUserFacing: true,
        });

        addEvent(newJob._id, {
          eventType: 'fast_form_success',
          message:
            result.mappedResultType === 'FULL'
              ? 'Full report retrieved successfully!'
              : 'Face page retrieved. Full report may be available later.',
          isUserFacing: true,
        });

        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success(
          result.mappedResultType === 'FULL'
            ? 'Full report retrieved!'
            : 'Face page retrieved!'
        );

        // Navigate to job detail
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push(`/law/jobs/${newJob._id}`);
        return;
      }

      // Handle infrastructure errors FIRST (timeout, network, config)
      // These are not job failures - just retry
      if (!result.success && result.code) {
        if (
          result.code === 'TIMEOUT_ERROR' ||
          result.code === 'NETWORK_ERROR' ||
          result.code === 'MISSING_CONFIG'
        ) {
          setIsSubmitting(false);
          if (result.code === 'TIMEOUT_ERROR') {
            toast.error('Request timed out. The CHP portal may be slow. Please try again.');
          } else if (result.code === 'NETWORK_ERROR') {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            toast.error('Service configuration error. Please contact support.');
          }
          return;
        }
      }

      // Handle safety block (NOT an error)
      if (isRetryableSafetyBlock(result)) {
        setSafetyBlock({
          code: result.code as SafetyBlockCode,
          retryAfter: result.retryAfterSeconds || 30,
        });
        setIsSubmitting(false);
        toast.warning('Rate limit active. Please wait and try again.');
        return;
      }

      // Handle field errors from wrapper
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        const newErrors: FormErrors = {};
        Object.entries(result.fieldErrors).forEach(([field, msg]) => {
          newErrors[field as keyof FormErrors] = msg;
          setTouched((prev) => ({ ...prev, [field]: true }));
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setIsSubmitting(false);
        toast.error('Please fix the validation errors');
        return;
      }

      // Handle true failures
      if (isTrueWrapperError(result)) {
        setSubmissionStep('Creating job...');

        // Check if this is a Page 1 rejection (V2.7.0+)
        const isPage1Rejection = result.mappedResultType === 'PAGE1_NOT_FOUND' || 
                                 result.mappedResultType === 'PAGE1_REJECTED_ATTEMPT_RISK';

        // Create job based on failure type
        let internalStatus: InternalStatus;
        if (isPage1Rejection) {
          internalStatus = 'NEEDS_MORE_INFO';
        } else {
          internalStatus = 'NEEDS_IN_PERSON_PICKUP';
        }

        const newJob = createJob({
          clientName: formState.clientFullName,
          reportNumber: formState.reportNumber,
          internalStatus,
          escalationData:
            !isPage1Rejection
              ? {
                  status: 'pending_authorization',
                  escalatedAt: Date.now(),
                  escalationReason: 'auto_exhausted',
                  authorizationRequested: true,
                  authorizationRequestedAt: Date.now(),
                }
              : undefined,
        });

        // V2.7.0: Track consumed Page 1 attempts
        const page1SubmitClicked = result.page1SubmitClicked ?? false;
        const wasPage1AttemptConsumed = consumedPage1Attempt(result.mappedResultType, page1SubmitClicked);

        // Update with form data
        // Only store page1Hash on Page 1 rejection (deterministic failure)
        // This enables the "one attempt per unique Page 1 input set" rule
        const serverPage1Hash = result.page1Hash; // Server only returns hash for Page 1 rejections
        
        updateJob(newJob._id, {
          crashDate: formState.crashDate,
          crashTime: formState.crashTime,
          officerId: formState.officerId || undefined,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          plate: formState.plate || undefined,
          driverLicense: formState.driverLicense || undefined,
          vin: formState.vin || undefined,
          // Only add hash for Page 1 rejection failures
          ...(serverPage1Hash && { page1AttemptsHashes: [serverPage1Hash] }),
          // V2.7.0: Track Page 1 failure count
          page1FailureCount: wasPage1AttemptConsumed ? 1 : 0,
          lastPage1FailureAt: wasPage1AttemptConsumed ? Date.now() : undefined,
          wrapperRuns: [
            {
              runId: `run_${generateId()}`,
              timestamp: Date.now(),
              result: result.mappedResultType || 'PORTAL_ERROR',
              duration: 0,
              page1Passed: !isPage1Rejection,
              errorMessage: result.error || result.message,
            },
          ],
        });

        // Add timeline events
        addEvent(newJob._id, {
          eventType: 'fast_form_submitted',
          message: 'Fast Form submitted with all crash details',
          isUserFacing: true,
        });

        addEvent(newJob._id, {
          eventType: 'fast_form_failed',
          message:
            isPage1Rejection
              ? 'Report not found. Please verify crash details.'
              : 'Verification failed. Authorization document required.',
          isUserFacing: true,
        });

        if (!isPage1Rejection) {
          addEvent(newJob._id, {
            eventType: 'escalation_auto_triggered',
            message: 'Request escalated for manual pickup',
            isUserFacing: true,
          });

          // Show auth modal for PAGE2_VERIFICATION_FAILED or PORTAL_ERROR
          setFailedJobId(newJob._id);
          setShowAuthModal(true);
          setIsSubmitting(false);
          return;
        }

        // For PAGE1_NOT_FOUND, navigate to job with correction card
        setIsSubmitting(false);
        toast.warning('Report not found. Please verify crash details.');
        router.push(`/law/jobs/${newJob._id}`);
        return;
      }

      // Fallback: Unknown error
      setIsSubmitting(false);
      toast.error('An unexpected error occurred. Please try again.');
    } catch (error) {
      console.error('[FastForm] Error:', error);
      setIsSubmitting(false);
      toast.error('Failed to submit. Please try again.');
    }
  };

  // Safety block countdown timer
  useEffect(() => {
    if (!safetyBlock || safetyBlock.retryAfter <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSafetyBlock((prev) => {
        if (!prev) return null;
        const newRetryAfter = prev.retryAfter - 1;
        if (newRetryAfter <= 0) {
          return null; // Clear safety block when countdown reaches 0
        }
        return { ...prev, retryAfter: newRetryAfter };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [safetyBlock?.retryAfter]);

  // Handle auth modal navigation
  const handleAuthModalContinue = useCallback(() => {
    if (failedJobId) {
      router.push(`/law/jobs/${failedJobId}`);
    }
  }, [failedJobId, router]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-full overflow-auto">
      <div className="py-6 md:py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-page-entrance">
            <div>
              <h1
                className={cn(
                  'text-2xl md:text-3xl font-bold font-serif animate-text-reveal',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Fast Form
              </h1>
              <p
                className={cn(
                  'mt-2 animate-text-reveal',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
                style={{ animationDelay: '100ms' }}
              >
                Submit all crash details for immediate processing
              </p>
            </div>
            <Link
              href="/law"
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                'transition-all duration-200 active:scale-95',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>

          {/* Safety Block Banner */}
          {safetyBlock && (
            <div className="mb-6">
              <WrapperSafetyBanner
                isActive={true}
                safetyBlockCode={safetyBlock.code}
                countdown={safetyBlock.retryAfter}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Two Column Grid (Desktop) / Stacked (Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Page 1 Section - CHP Portal Info */}
              <div
                className={cn(
                  'rounded-2xl p-6 animate-text-reveal',
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : 'bg-white border border-slate-200 shadow-sm'
                )}
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    )}
                  >
                    <FileText
                      className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')}
                    />
                  </div>
                  <div>
                    <h2
                      className={cn(
                        'font-semibold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      CHP Portal Info
                    </h2>
                    <p
                      className={cn(
                        'text-sm',
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      )}
                    >
                      Page 1 data for CHP lookup
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Report Number */}
                  <Input
                    label="Report Number"
                    name="reportNumber"
                    value={formState.reportNumber}
                    onChange={(e) => handleChange('reportNumber', e.target.value)}
                    onBlur={() => handleBlur('reportNumber')}
                    error={touched.reportNumber ? errors.reportNumber : undefined}
                    isValid={isFieldValid('reportNumber')}
                    helperText="Format: 9XXX-YYYY-ZZZZZ"
                    theme={isDark ? 'dark' : 'light'}
                    required
                    inputMode="numeric"
                    maxLength={15}
                  />

                  {/* NCIC (Auto-derived, read-only) */}
                  <div>
                    <label
                      className={cn(
                        'block text-sm font-medium mb-1.5',
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      )}
                    >
                      NCIC Code
                    </label>
                    <div
                      className={cn(
                        'h-12 px-4 rounded-xl flex items-center font-mono',
                        isDark
                          ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      )}
                    >
                      {derivedNcic || '—'}
                    </div>
                    <p
                      className={cn(
                        'text-xs mt-1.5',
                        isDark ? 'text-slate-500' : 'text-slate-500'
                      )}
                    >
                      Auto-derived from report number
                    </p>
                  </div>

                  {/* Crash Date */}
                  <Input
                    label="Crash Date"
                    name="crashDate"
                    type="date"
                    value={formState.crashDate}
                    onChange={(e) => handleChange('crashDate', e.target.value)}
                    onBlur={() => handleBlur('crashDate')}
                    error={touched.crashDate ? errors.crashDate : undefined}
                    isValid={isFieldValid('crashDate')}
                    theme={isDark ? 'dark' : 'light'}
                    required
                  />

                  {/* Crash Time */}
                  <Input
                    label="Crash Time"
                    name="crashTime"
                    value={formState.crashTime}
                    onChange={(e) => handleChange('crashTime', e.target.value)}
                    onBlur={() => handleBlur('crashTime')}
                    error={touched.crashTime ? errors.crashTime : undefined}
                    isValid={isFieldValid('crashTime')}
                    helperText="24-hour format: HHMM (e.g., 1430)"
                    theme={isDark ? 'dark' : 'light'}
                    required
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="HHMM"
                  />

                  {/* Officer ID */}
                  <Input
                    label="Officer ID"
                    name="officerId"
                    value={formState.officerId}
                    onChange={(e) => handleChange('officerId', e.target.value)}
                    onBlur={() => handleBlur('officerId')}
                    error={touched.officerId ? errors.officerId : undefined}
                    isValid={formState.officerId ? isFieldValid('officerId') : undefined}
                    helperText="5 digits, left-padded (optional)"
                    theme={isDark ? 'dark' : 'light'}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="0XXXXX"
                  />
                </div>
              </div>

              {/* Page 2 Section - Verification */}
              <div
                className={cn(
                  'rounded-2xl p-6 animate-text-reveal',
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : 'bg-white border border-slate-200 shadow-sm'
                )}
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    )}
                  >
                    <User
                      className={cn(
                        'w-5 h-5',
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      )}
                    />
                  </div>
                  <div>
                    <h2
                      className={cn(
                        'font-semibold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Verification Info
                    </h2>
                    <p
                      className={cn(
                        'text-sm',
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      )}
                    >
                      Page 2 verification fields
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Client Full Name */}
                  <Input
                    label="Client Full Name"
                    name="clientFullName"
                    value={formState.clientFullName}
                    onChange={(e) => handleChange('clientFullName', e.target.value)}
                    onBlur={() => handleBlur('clientFullName')}
                    error={touched.clientFullName ? errors.clientFullName : undefined}
                    isValid={isFieldValid('clientFullName')}
                    theme={isDark ? 'dark' : 'light'}
                    required
                    autoComplete="name"
                    placeholder="John Doe"
                  />

                  {/* Parsed name preview */}
                  {parsedName.firstName && (
                    <div
                      className={cn(
                        'text-xs px-3 py-2 rounded-lg',
                        isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      Parsed: <span className="font-medium">First:</span> {parsedName.firstName},{' '}
                      <span className="font-medium">Last:</span> {parsedName.lastName || '(none)'}
                    </div>
                  )}

                  {/* License Plate */}
                  <Input
                    label="License Plate"
                    name="plate"
                    value={formState.plate}
                    onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('plate')}
                    error={touched.plate ? errors.plate : undefined}
                    theme={isDark ? 'dark' : 'light'}
                    placeholder="ABC1234"
                  />

                  {/* Driver License */}
                  <Input
                    label="Driver License Number"
                    name="driverLicense"
                    value={formState.driverLicense}
                    onChange={(e) => handleChange('driverLicense', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('driverLicense')}
                    error={touched.driverLicense ? errors.driverLicense : undefined}
                    theme={isDark ? 'dark' : 'light'}
                    placeholder="D1234567"
                  />

                  {/* VIN */}
                  <Input
                    label="VIN (Last 5 digits)"
                    name="vin"
                    value={formState.vin}
                    onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('vin')}
                    error={touched.vin ? errors.vin : undefined}
                    theme={isDark ? 'dark' : 'light'}
                    maxLength={5}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Legal Section - Full Width */}
            <div
              className={cn(
                'mt-6 md:mt-8 rounded-2xl p-6 animate-text-reveal',
                isDark
                  ? 'bg-slate-800/50 border border-slate-700/50'
                  : 'bg-white border border-slate-200 shadow-sm'
              )}
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                  )}
                >
                  <Shield
                    className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')}
                  />
                </div>
                <div>
                  <h2
                    className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}
                  >
                    Legal Declaration
                  </h2>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="perjuryAccepted"
                  checked={formState.perjuryAccepted}
                  onChange={(e) => handleChange('perjuryAccepted', e.target.checked)}
                  onBlur={() => handleBlur('perjuryAccepted')}
                  className={cn(
                    'mt-1 w-5 h-5 rounded border-2 transition-colors',
                    'focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-0',
                    isDark
                      ? 'bg-slate-700 border-slate-600 checked:bg-amber-500 checked:border-amber-500'
                      : 'bg-white border-slate-300 checked:bg-amber-500 checked:border-amber-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  )}
                >
                  I declare under penalty of perjury that I am a person having proper interest
                  or an authorized representative therein as outlined above and as required by
                  California law.
                </span>
              </label>

              {touched.perjuryAccepted && errors.perjuryAccepted && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.perjuryAccepted}
                </p>
              )}
            </div>

            {/* Page 1 Attempt Warning (V2.7.0+) */}
            <div className="mt-6">
              <Page1WarningBanner />
            </div>

            {/* Desktop Submit Button */}
            <div
              className="hidden md:flex justify-end gap-3 mt-8 animate-text-reveal"
              style={{ animationDelay: '500ms' }}
            >
              <Link href="/law">
                <Button
                  variant="secondary"
                  type="button"
                  className={cn(
                    isDark
                      ? 'border-slate-600/50 text-slate-300 hover:bg-slate-800/50'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  Cancel
                </Button>
              </Link>
              <SubmitButton
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                submissionStep={submissionStep}
                disabled={safetyBlock !== null}
              />
            </div>
          </form>

          {/* Mobile Sticky Footer */}
          <div
            className={cn(
              'md:hidden fixed bottom-0 left-0 right-0 p-4 safe-area-inset-bottom',
              isDark
                ? 'bg-slate-900/95 backdrop-blur-lg border-t border-slate-800'
                : 'bg-white/95 backdrop-blur-lg border-t border-slate-200'
            )}
          >
            <SubmitButton
              isSubmitting={isSubmitting}
              isSuccess={isSuccess}
              submissionStep={submissionStep}
              disabled={safetyBlock !== null}
              fullWidth
              onClick={(e) => {
                // Submit the form when mobile button is clicked
                const form = document.querySelector('form');
                if (form) {
                  form.requestSubmit();
                }
                e.preventDefault();
              }}
            />
          </div>

          {/* Spacer for mobile sticky footer */}
          <div className="md:hidden h-24" />
        </div>
      </div>

      {/* Auth Upload Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleAuthModalContinue}
          />

          {/* Modal */}
          <div
            className={cn(
              'relative max-w-md w-full rounded-2xl p-6 animate-slide-up',
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-2xl'
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                )}
              >
                <Clock
                  className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')}
                />
              </div>
              <div>
                <h2
                  className={cn(
                    'text-lg font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  We Need Your Help
                </h2>
              </div>
            </div>

            <p className={cn('mb-6', isDark ? 'text-slate-300' : 'text-slate-600')}>
              To complete your request, please upload your{' '}
              <strong>Authorization to Obtain Governmental Agency Records and Reports</strong>.
              This document is required for manual pickup from CHP.
            </p>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAuthModalContinue}
              >
                Continue to Job
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUBMIT BUTTON COMPONENT
// ============================================

function SubmitButton({
  isSubmitting,
  isSuccess,
  submissionStep,
  disabled = false,
  fullWidth = false,
  onClick,
}: {
  isSubmitting: boolean;
  isSuccess: boolean;
  submissionStep?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={isSubmitting || isSuccess || disabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-300 ease-out overflow-hidden',
        'h-12 md:h-11 px-6 text-base md:text-sm',
        fullWidth && 'w-full',
        // Default state
        !isSuccess &&
          !disabled && [
            'bg-gradient-to-r from-amber-500 to-amber-600',
            'text-white shadow-lg shadow-amber-500/40',
            'hover:scale-102 hover:brightness-110 hover:shadow-xl hover:shadow-amber-400/50',
            'active:scale-98',
          ],
        // Success state
        isSuccess && ['bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'],
        // Disabled state
        disabled && ['bg-slate-500 text-slate-300 cursor-not-allowed opacity-60'],
        // Submitting/success disabled
        (isSubmitting || isSuccess) && 'cursor-not-allowed'
      )}
    >
      {isSuccess && <div className="absolute inset-0 animate-shimmer" />}

      <span className="relative flex items-center gap-2">
        {isSubmitting && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{submissionStep || 'Submitting...'}</span>
          </>
        )}
        {isSuccess && (
          <>
            <Check className="w-5 h-5 animate-check-pop" />
            <span>Success!</span>
          </>
        )}
        {!isSubmitting && !isSuccess && (
          <>
            <span>Submit Fast Form</span>
          </>
        )}
      </span>
    </button>
  );
}

