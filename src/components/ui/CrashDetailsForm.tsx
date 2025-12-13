'use client';

/**
 * CrashDetailsForm - Focused crash details form for law firm flow wizard
 *
 * Collects optional crash details (date, time, officer ID) to speed up report retrieval.
 * All fields are optional - "Save & Check for Report" button triggers wrapper immediately.
 * Includes clean skip option.
 *
 * @version V1.2.0
 */

import { useState } from 'react';
import { Calendar, Clock, Shield, Search } from 'lucide-react';
import { cn, formatOfficerIdError } from '@/lib/utils';

export interface CrashDetailsData {
  crashDate: string;
  crashTime: string; // HHMM format (24-hour)
  officerId: string;
}

interface CrashDetailsFormProps {
  initialData?: Partial<CrashDetailsData>;
  onSubmit: (data: CrashDetailsData) => void;
  onSkip: () => void;
  onCollapse?: () => void;  // Soft-dismiss handler for "No thanks" behavior
  disabled?: boolean;
}

/**
 * Validate crash time in HHMM format (24-hour)
 */
function isValidCrashTime(time: string): boolean {
  if (!time || time.length !== 4) return false;
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = parseInt(time.slice(2, 4), 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export default function CrashDetailsForm({
  initialData,
  onSubmit,
  onSkip,
  onCollapse,
  disabled = false,
}: CrashDetailsFormProps) {
  const [formData, setFormData] = useState<CrashDetailsData>({
    crashDate: initialData?.crashDate || '',
    crashTime: initialData?.crashTime || '',
    officerId: initialData?.officerId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeError, setShowTimeError] = useState(false);
  const [showOfficerIdError, setShowOfficerIdError] = useState(false);
  const [officerIdErrorMsg, setOfficerIdErrorMsg] = useState<string>('');

  // Time validation only if 4 digits entered
  const isCrashTimeValid = !formData.crashTime ||
    formData.crashTime.length < 4 ||
    isValidCrashTime(formData.crashTime);

  // Officer ID validation
  const isOfficerIdValid = !formatOfficerIdError(formData.officerId);

  const handleCrashTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4
    setFormData({ ...formData, crashTime: value });

    // Show error if 4 digits entered but invalid
    if (value.length === 4) {
      setShowTimeError(!isValidCrashTime(value));
    } else {
      setShowTimeError(false);
    }
  };

  const handleOfficerIdBlur = () => {
    const error = formatOfficerIdError(formData.officerId);
    if (error) {
      setShowOfficerIdError(true);
      setOfficerIdErrorMsg(error);
    } else {
      setShowOfficerIdError(false);
      setOfficerIdErrorMsg('');
    }
  };

  const handleOfficerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setFormData({ ...formData, officerId: value });
    // Clear error when typing
    if (showOfficerIdError) {
      setShowOfficerIdError(false);
      setOfficerIdErrorMsg('');
    }
  };

  const handleSubmit = async () => {
    // Don't submit if time or officer ID is invalid
    if (!isCrashTimeValid || !isOfficerIdValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card-dark rounded-xl p-5 border border-cyan-500/20 animate-text-reveal">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white mb-1">
          Crash Details
          <span className="text-sm font-normal text-slate-500 ml-2">(all optional)</span>
        </h3>
        <p className="text-sm text-slate-400">
          These help us locate your report faster
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4 mb-6">
        {/* Crash Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Crash Date
            <span className="text-slate-600 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={formData.crashDate}
              onChange={(e) => setFormData({ ...formData, crashDate: e.target.value })}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-base md:text-sm',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
        </div>

        {/* Crash Time (HHMM) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Crash Time
            <span className="text-slate-600 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={formData.crashTime}
              onChange={handleCrashTimeChange}
              placeholder="e.g., 1430 for 2:30 PM"
              maxLength={4}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                'bg-slate-800/50 border',
                showTimeError ? 'border-red-500/50' : 'border-slate-700/50',
                'text-slate-200 text-base md:text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none',
                showTimeError
                  ? 'focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                  : 'focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
          {showTimeError && (
            <p className="text-xs text-red-400">
              Invalid time. Use HHMM format (0000-2359)
            </p>
          )}
        </div>

        {/* Officer Badge */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Officer Badge
            <span className="text-slate-600 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={formData.officerId}
              onChange={handleOfficerIdChange}
              onBlur={handleOfficerIdBlur}
              placeholder="e.g., 012345"
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                'bg-slate-800/50 border',
                'text-slate-200 text-base md:text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:ring-2',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                showOfficerIdError
                  ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                  : 'border-slate-700/50 focus:border-teal-500/50 focus:ring-teal-500/20'
              )}
            />
          </div>
          {showOfficerIdError && (
            <p className="text-xs text-red-400 mt-1">{officerIdErrorMsg}</p>
          )}
        </div>
      </div>

      {/* Primary CTA - Save & Check for Report */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || !isCrashTimeValid || !isOfficerIdValid}
        className={cn(
          'w-full h-12 md:h-10 rounded-xl font-medium text-base md:text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          'bg-gradient-to-r from-teal-600 to-cyan-600',
          'text-white',
          'hover:from-teal-500 hover:to-cyan-500',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'shadow-lg shadow-teal-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Checking CHP...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>Save & Check for Report</span>
          </>
        )}
      </button>

      {/* Skip link */}
      <button
        onClick={onCollapse || onSkip}
        disabled={disabled || isSubmitting}
        className={cn(
          'w-full mt-3 py-2',
          'text-sm text-slate-500',
          'hover:text-slate-300',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Skip this step
      </button>
    </div>
  );
}
