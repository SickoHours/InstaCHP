'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn, isValidReportNumber } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useMockData } from '@/context/MockDataContext';
import { getDelay } from '@/lib/devConfig';
import { useTheme } from '@/context/ThemeContext';

// Form state interface - only 2 fields per PRD
interface FormState {
  clientName: string;
  reportNumber: string;
}

// Validation errors interface
interface FormErrors {
  clientName?: string;
  reportNumber?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createJob } = useMockData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form state - simplified to just clientName and reportNumber
  const [formState, setFormState] = useState<FormState>({
    clientName: '',
    reportNumber: '',
  });

  // Touched fields tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // API error state for network failures
  const [apiError, setApiError] = useState<string | null>(null);

  // Validate a single field
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'clientName':
        if (!value || value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
      case 'reportNumber':
        if (!value) {
          return 'Report number is required';
        }
        if (!isValidReportNumber(value)) {
          return 'Format: 9XXX-YYYY-ZZZZZ (e.g., 9465-2025-02802)';
        }
        break;
    }
    return undefined;
  }, []);

  // Handle field change
  const handleChange = useCallback((name: string, value: string) => {
    // Auto-format report number
    if (name === 'reportNumber') {
      // Remove non-digits except dashes
      let cleaned = value.replace(/[^\d-]/g, '');
      // Auto-insert dashes
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

    setFormState((prev) => ({ ...prev, [name]: value }));

    // Validate on change if already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = formState[name as keyof FormState];
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [formState, validateField]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    newErrors.clientName = validateField('clientName', formState.clientName);
    newErrors.reportNumber = validateField('reportNumber', formState.reportNumber);

    // Remove undefined values
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    setTouched({
      clientName: true,
      reportNumber: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formState, validateField]);

  // Check if a field is valid (has value and no error)
  const isFieldValid = (name: string): boolean => {
    const value = formState[name as keyof FormState];
    return touched[name] && !!value && !errors[name as keyof FormErrors];
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateAll()) {
      // Focus first error field
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) as HTMLInputElement;
        element?.focus();
      }
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call (with 10% chance of failure for demo)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, getDelay('formSubmit'));
      });

      // Create new job with initial events
      const newJob = createJob({
        clientName: formState.clientName,
        reportNumber: formState.reportNumber,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Request submitted successfully!');

      // Navigate to new job's chat view
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/law/jobs/${newJob._id}`);
    } catch {
      setIsSubmitting(false);
      const errorMessage = 'Failed to submit request. Please try again.';
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* Main Content */}
      <div className="py-6 md:py-10 px-4">
        <div className="max-w-xl mx-auto">
          {/* Page Header with close button */}
          <div className="flex items-center justify-between mb-8 animate-page-entrance">
            <div>
              <h1
                className={cn(
                  'text-2xl md:text-3xl font-bold font-serif animate-text-reveal',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
                style={{ animationDelay: '100ms' }}
              >
                New Request
              </h1>
              <p
                className={cn(
                  'mt-2 animate-text-reveal',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
                style={{ animationDelay: '200ms' }}
              >
                Submit a CHP crash report request
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

            {/* Form Card - Dark */}
            <form onSubmit={handleSubmit}>
              <div
                className="form-card-dark md:rounded-2xl md:p-8 animate-text-reveal"
                style={{ animationDelay: '300ms' }}
              >
                <div className="p-4 md:p-0 space-y-6">
                  {/* API Error Banner */}
                  {apiError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-slide-up">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-200">{apiError}</p>
                        <button
                          type="button"
                          onClick={() => setApiError(null)}
                          className="text-xs text-red-400 hover:text-red-300 mt-1 underline underline-offset-2"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Client Name */}
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: '400ms' }}
                  >
                    <Input
                      label="Client Name"
                      name="clientName"
                      value={formState.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      onBlur={() => handleBlur('clientName')}
                      error={touched.clientName ? errors.clientName : undefined}
                      isValid={isFieldValid('clientName')}
                      theme={isDark ? 'dark' : 'light'}
                      required
                      autoComplete="name"
                    />
                  </div>

                  {/* Report Number */}
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: '480ms' }}
                  >
                    <Input
                      label="CHP Report Number"
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
                  </div>

                  {/* Desktop Submit Button */}
                  <div
                    className="hidden md:flex justify-end gap-3 pt-4 animate-slide-up"
                    style={{ animationDelay: '560ms' }}
                  >
                    <Link href="/law">
                      <Button
                        variant="secondary"
                        type="button"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <SubmitButton isSubmitting={isSubmitting} isSuccess={isSuccess} />
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Footer - Dark */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 mobile-footer-dark safe-area-inset-bottom">
                <SubmitButton
                  isSubmitting={isSubmitting}
                  isSuccess={isSuccess}
                  fullWidth
                />
              </div>
            </form>

            {/* Spacer for mobile sticky footer */}
            <div className="md:hidden h-24" />
        </div>
      </div>
    </div>
  );
}

// Submit button component with states
function SubmitButton({
  isSubmitting,
  isSuccess,
  fullWidth = false,
}: {
  isSubmitting: boolean;
  isSuccess: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || isSuccess}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-300 ease-out overflow-hidden',
        // Size
        'h-12 md:h-10 px-6 text-base md:text-sm',
        fullWidth && 'w-full',
        // Default state
        !isSuccess && [
          'bg-gradient-to-r from-amber-500 to-amber-600',
          'text-white shadow-lg shadow-amber-500/40',
          'hover:scale-102 hover:brightness-110 hover:shadow-xl hover:shadow-amber-400/50',
          'active:scale-98',
        ],
        // Success state
        isSuccess && [
          'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40',
        ],
        // Disabled
        (isSubmitting || isSuccess) && 'cursor-not-allowed',
      )}
    >
      {/* Shimmer overlay on success */}
      {isSuccess && (
        <div className="absolute inset-0 animate-shimmer" />
      )}

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {isSubmitting && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting...</span>
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
            <span>Submit Request</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </span>
    </button>
  );
}
