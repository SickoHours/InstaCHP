'use client';

/**
 * Fatal Report Form Page (V1.6.0)
 *
 * Separate flow for fatal crash reports:
 * - Always requires authorization document
 * - Asks if client was deceased → requires death certificate
 * - Auto-escalates to NEEDS_IN_PERSON_PICKUP (skips wrapper)
 *
 * MESSAGING RULE: Use friendly language, no technical jargon
 */

import { useState, useCallback, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Container, Button, Input } from '@/components/ui';
import { cn, isValidReportNumber } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useMockData } from '@/context/MockDataContext';
import { DEV_CONFIG, getDelay } from '@/lib/devConfig';

// Form state interface
interface FormState {
  clientName: string;
  reportNumber: string;
  clientWasDeceased: boolean;
}

// File state
interface FileState {
  authorizationDocument: File | null;
  deathCertificate: File | null;
}

// Validation errors interface
interface FormErrors {
  clientName?: string;
  reportNumber?: string;
  authorizationDocument?: string;
  deathCertificate?: string;
}

export default function NewFatalReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createJob } = useMockData();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    clientName: '',
    reportNumber: '',
    clientWasDeceased: false,
  });

  // File state
  const [files, setFiles] = useState<FileState>({
    authorizationDocument: null,
    deathCertificate: null,
  });

  // Refs for file inputs
  const authFileRef = useRef<HTMLInputElement>(null);
  const deathCertFileRef = useRef<HTMLInputElement>(null);

  // Touched fields tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // API error state
  const [apiError, setApiError] = useState<string | null>(null);

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: string | File | null): string | undefined => {
      switch (name) {
        case 'clientName':
          if (!value || (typeof value === 'string' && value.trim().length < 2)) {
            return 'Name must be at least 2 characters';
          }
          break;
        case 'reportNumber':
          if (!value) {
            return 'Report number is required';
          }
          if (typeof value === 'string' && !isValidReportNumber(value)) {
            return 'Format: 9XXX-YYYY-ZZZZZ (e.g., 9465-2025-02802)';
          }
          break;
        case 'authorizationDocument':
          // Skip file validation in dev mode
          if (!DEV_CONFIG.skipFileUploads && !value) {
            return 'Authorization document is required';
          }
          break;
        case 'deathCertificate':
          // Skip file validation in dev mode
          if (!DEV_CONFIG.skipFileUploads && formState.clientWasDeceased && !value) {
            return 'Death certificate is required';
          }
          break;
      }
      return undefined;
    },
    [formState.clientWasDeceased]
  );

  // Handle field change
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

      setFormState((prev) => ({ ...prev, [name]: value }));

      // Validate on change if already touched
      if (touched[name] && typeof value === 'string') {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }

      // If toggling deceased off, clear death certificate requirement
      if (name === 'clientWasDeceased' && value === false) {
        setFiles((prev) => ({ ...prev, deathCertificate: null }));
        setErrors((prev) => ({ ...prev, deathCertificate: undefined }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const value = formState[name as keyof FormState];
      if (typeof value === 'string') {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [formState, validateField]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (fieldName: 'authorizationDocument' | 'deathCertificate', file: File | null) => {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      const error = validateField(fieldName, file);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [validateField]
  );

  // Handle file input change
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'authorizationDocument' | 'deathCertificate'
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrors((prev) => ({ ...prev, [fieldName]: 'Please upload a PDF file' }));
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [fieldName]: 'File must be less than 10MB' }));
        return;
      }
      handleFileSelect(fieldName, file);
    }
  };

  // Remove file
  const handleRemoveFile = (fieldName: 'authorizationDocument' | 'deathCertificate') => {
    handleFileSelect(fieldName, null);
    // Reset the input
    if (fieldName === 'authorizationDocument' && authFileRef.current) {
      authFileRef.current.value = '';
    } else if (fieldName === 'deathCertificate' && deathCertFileRef.current) {
      deathCertFileRef.current.value = '';
    }
  };

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    newErrors.clientName = validateField('clientName', formState.clientName);
    newErrors.reportNumber = validateField('reportNumber', formState.reportNumber);
    newErrors.authorizationDocument = validateField(
      'authorizationDocument',
      files.authorizationDocument
    );

    if (formState.clientWasDeceased) {
      newErrors.deathCertificate = validateField('deathCertificate', files.deathCertificate);
    }

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
      authorizationDocument: true,
      deathCertificate: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formState, files, validateField]);

  // Check if a field is valid
  const isFieldValid = (name: string): boolean => {
    if (name === 'authorizationDocument') {
      // In dev mode, file is optional
      if (DEV_CONFIG.skipFileUploads) {
        return touched[name] && !errors[name];
      }
      return touched[name] && !!files.authorizationDocument && !errors[name];
    }
    if (name === 'deathCertificate') {
      // In dev mode, file is optional
      if (DEV_CONFIG.skipFileUploads) {
        return touched[name] && !errors[name];
      }
      return touched[name] && !!files.deathCertificate && !errors[name];
    }
    const value = formState[name as keyof FormState];
    return touched[name] && !!value && !errors[name as keyof FormErrors];
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

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

    try {
      // Simulate API call with dev mode delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, getDelay('formSubmit'));
      });

      // Create new fatal job - auto-escalated
      const newJob = createJob({
        clientName: formState.clientName,
        reportNumber: formState.reportNumber,
        isFatal: true,
        fatalDetails: {
          clientWasDeceased: formState.clientWasDeceased,
          deathCertificateToken: formState.clientWasDeceased
            ? `death-cert-${Date.now()}`
            : undefined,
        },
        // Auto-escalate to NEEDS_IN_PERSON_PICKUP
        internalStatus: 'NEEDS_IN_PERSON_PICKUP',
        escalationData: {
          status: 'authorization_received',
          escalatedAt: Date.now(),
          escalationReason: 'fatal_report',
          authorizationDocumentToken: `auth-${Date.now()}`,
          authorizationUploadedAt: Date.now(),
        },
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Fatal report submitted successfully!');

      // Navigate to new job's detail view
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs - Red/Orange tint for fatal */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb-dark w-[500px] h-[500px] bg-red-600/15 top-[-10%] left-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="orb-dark w-[400px] h-[400px] bg-orange-600/10 bottom-[20%] right-[-5%]"
          style={{ animationDelay: '5s' }}
        />
        <div
          className="orb-dark w-[600px] h-[600px] bg-slate-700/20 bottom-[-20%] left-[30%]"
          style={{ animationDelay: '10s' }}
        />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 header-blur border-b border-slate-800/50">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/law"
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="ml-2 text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Fatal Report
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        <Container>
          <div className="py-6 md:py-10 md:max-w-xl md:mx-auto">
            {/* Desktop Header */}
            <div className="hidden md:block mb-8 animate-page-entrance">
              <Link
                href="/law"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1
                className="text-3xl font-bold text-white font-serif animate-text-reveal flex items-center gap-3"
                style={{ animationDelay: '100ms' }}
              >
                <AlertTriangle className="w-8 h-8 text-red-400" />
                Fatal Report Request
              </h1>
              <p
                className="text-slate-400 mt-2 animate-text-reveal"
                style={{ animationDelay: '200ms' }}
              >
                Request a fatal crash report
              </p>
            </div>

            {/* Info Banner */}
            <div
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-text-reveal"
              style={{ animationDelay: '250ms' }}
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">
                    Additional documentation required
                  </p>
                  <p className="text-xs text-amber-300/70 mt-1">
                    Fatal reports require an authorization document to process your request.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
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
                  <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <Input
                      label="Client Name"
                      name="clientName"
                      value={formState.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      onBlur={() => handleBlur('clientName')}
                      error={touched.clientName ? errors.clientName : undefined}
                      isValid={isFieldValid('clientName')}
                      theme="dark"
                      required
                      autoComplete="name"
                    />
                  </div>

                  {/* Report Number */}
                  <div className="animate-slide-up" style={{ animationDelay: '480ms' }}>
                    <Input
                      label="CHP Report Number"
                      name="reportNumber"
                      value={formState.reportNumber}
                      onChange={(e) => handleChange('reportNumber', e.target.value)}
                      onBlur={() => handleBlur('reportNumber')}
                      error={touched.reportNumber ? errors.reportNumber : undefined}
                      isValid={isFieldValid('reportNumber')}
                      helperText="Format: 9XXX-YYYY-ZZZZZ"
                      theme="dark"
                      required
                      inputMode="numeric"
                      maxLength={15}
                    />
                  </div>

                  {/* Authorization Document Upload */}
                  <div className="animate-slide-up" style={{ animationDelay: '560ms' }}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Authorization Document
                      <span className="text-red-400 ml-1">*</span>
                    </label>

                    {files.authorizationDocument ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="flex-1 text-sm text-emerald-200 truncate">
                          {files.authorizationDocument.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('authorizationDocument')}
                          className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => authFileRef.current?.click()}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 p-6 rounded-xl',
                          'border-2 border-dashed cursor-pointer',
                          'transition-all duration-200',
                          errors.authorizationDocument && touched.authorizationDocument
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500/50 hover:bg-slate-800/50'
                        )}
                      >
                        <Upload className="w-8 h-8 text-slate-400" />
                        <p className="text-sm text-slate-400">
                          Click to upload authorization document
                        </p>
                        <p className="text-xs text-slate-500">PDF only, max 10MB</p>
                      </div>
                    )}

                    <input
                      ref={authFileRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileInputChange(e, 'authorizationDocument')}
                      className="hidden"
                    />

                    {errors.authorizationDocument && touched.authorizationDocument && (
                      <p className="mt-2 text-sm text-red-400">{errors.authorizationDocument}</p>
                    )}

                    {/* DEV MODE: Skip upload button */}
                    {DEV_CONFIG.skipFileUploads && !files.authorizationDocument && (
                      <button
                        type="button"
                        onClick={() => {
                          handleFileSelect('authorizationDocument', new File(['mock'], 'mock-auth.pdf', { type: 'application/pdf' }));
                          setTouched((prev) => ({ ...prev, authorizationDocument: true }));
                        }}
                        className="mt-2 px-3 py-1.5 text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
                      >
                        [DEV] Skip Upload
                      </button>
                    )}
                  </div>

                  {/* Deceased Toggle */}
                  <div className="animate-slide-up" style={{ animationDelay: '640ms' }}>
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            Was your client the deceased?
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Additional documentation may be required
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleChange('clientWasDeceased', !formState.clientWasDeceased)
                          }
                          className={cn(
                            'relative w-12 h-7 rounded-full transition-colors duration-200 overflow-hidden',
                            formState.clientWasDeceased ? 'bg-red-500' : 'bg-slate-600'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200',
                              formState.clientWasDeceased && 'translate-x-5'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Death Certificate Upload (conditional) */}
                  {formState.clientWasDeceased && (
                    <div className="animate-slide-up">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Death Certificate
                        <span className="text-red-400 ml-1">*</span>
                      </label>

                      {files.deathCertificate ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <FileText className="w-5 h-5 text-emerald-400" />
                          <span className="flex-1 text-sm text-emerald-200 truncate">
                            {files.deathCertificate.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('deathCertificate')}
                            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => deathCertFileRef.current?.click()}
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 p-6 rounded-xl',
                            'border-2 border-dashed cursor-pointer',
                            'transition-all duration-200',
                            errors.deathCertificate && touched.deathCertificate
                              ? 'border-red-500/50 bg-red-500/5'
                              : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500/50 hover:bg-slate-800/50'
                          )}
                        >
                          <Upload className="w-8 h-8 text-slate-400" />
                          <p className="text-sm text-slate-400">Click to upload death certificate</p>
                          <p className="text-xs text-slate-500">PDF only, max 10MB</p>
                        </div>
                      )}

                      <input
                        ref={deathCertFileRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileInputChange(e, 'deathCertificate')}
                        className="hidden"
                      />

                      {errors.deathCertificate && touched.deathCertificate && (
                        <p className="mt-2 text-sm text-red-400">{errors.deathCertificate}</p>
                      )}

                      {/* DEV MODE: Skip upload button */}
                      {DEV_CONFIG.skipFileUploads && !files.deathCertificate && (
                        <button
                          type="button"
                          onClick={() => {
                            handleFileSelect('deathCertificate', new File(['mock'], 'mock-death-cert.pdf', { type: 'application/pdf' }));
                            setTouched((prev) => ({ ...prev, deathCertificate: true }));
                          }}
                          className="mt-2 px-3 py-1.5 text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
                        >
                          [DEV] Skip Upload
                        </button>
                      )}
                    </div>
                  )}

                  {/* Desktop Submit Button */}
                  <div
                    className="hidden md:flex justify-end gap-3 pt-4 animate-slide-up"
                    style={{ animationDelay: '720ms' }}
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

              {/* Mobile Sticky Footer */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 mobile-footer-dark safe-area-inset-bottom">
                <SubmitButton isSubmitting={isSubmitting} isSuccess={isSuccess} fullWidth />
              </div>
            </form>

            {/* Spacer for mobile sticky footer */}
            <div className="md:hidden h-24" />
          </div>
        </Container>
      </div>
    </div>
  );
}

// Submit button component
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
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-300 ease-out overflow-hidden',
        'h-12 md:h-10 px-6 text-base md:text-sm',
        fullWidth && 'w-full',
        !isSuccess && [
          'bg-gradient-to-r from-red-600 to-orange-600',
          'text-white shadow-lg shadow-red-600/40',
          'hover:scale-102 hover:brightness-110 hover:shadow-xl hover:shadow-red-500/50',
          'active:scale-98',
        ],
        isSuccess && ['bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'],
        (isSubmitting || isSuccess) && 'cursor-not-allowed'
      )}
    >
      {isSuccess && <div className="absolute inset-0 animate-shimmer" />}

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
            <span>Submit Fatal Report</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </span>
    </button>
  );
}
