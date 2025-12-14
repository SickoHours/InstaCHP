'use client';

/**
 * @deprecated Replaced by InlineFieldsCard as of V1.0.7
 * Kept for reference only. Do not use in new code.
 *
 * Page1DetailsCard - Interactive prompt for collecting crash details
 *
 * Prompts for crash date, crash time, and officer badge number.
 * All fields optional. Used in law firm job chat when status is NEEDS_CALL.
 */

import { useState } from 'react';
import { Calendar, Clock, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page1DetailsData {
  crashDate: string;
  crashTime: string;
  officerId: string;
}

interface Page1DetailsCardProps {
  onSubmit: (data: Page1DetailsData) => void | Promise<void>;
  onSkip: () => void;
  disabled?: boolean;
}

export default function Page1DetailsCard({
  onSubmit,
  onSkip,
  disabled = false,
}: Page1DetailsCardProps) {
  const [formData, setFormData] = useState<Page1DetailsData>({
    crashDate: '',
    crashTime: '',
    officerId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if at least one field is filled
  const hasAtLeastOneField = !!(
    formData.crashDate ||
    formData.crashTime ||
    formData.officerId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAtLeastOneField || disabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Help text */}
      <p className="text-xs text-slate-400">
        This information helps us locate your report faster (all optional):
      </p>

      {/* Crash Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Crash Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={formData.crashDate}
            onChange={(e) => setFormData({ ...formData, crashDate: e.target.value })}
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Crash Time */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Crash Time
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="time"
            value={formData.crashTime}
            onChange={(e) => setFormData({ ...formData, crashTime: e.target.value })}
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Officer Badge Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Officer Badge Number
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={formData.officerId}
            onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
            placeholder="e.g., 012345"
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!hasAtLeastOneField || disabled || isSubmitting}
        className={cn(
          'w-full h-12 md:h-10 rounded-xl font-medium',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          hasAtLeastOneField && !disabled && !isSubmitting
            ? [
                'bg-gradient-to-r from-amber-500 to-cyan-600',
                'text-white',
                'hover:from-amber-400 hover:to-cyan-500',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'shadow-lg shadow-amber-400/20',
              ]
            : [
                'bg-slate-800/50 text-slate-600',
                'cursor-not-allowed',
              ]
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit Information</span>
        )}
      </button>

      {/* Skip Button */}
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled || isSubmitting}
        className={cn(
          'w-full h-10 rounded-lg font-medium',
          'text-slate-400 hover:text-slate-300',
          'border border-slate-700/50 hover:border-slate-600',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Skip for Now
      </button>

      {/* Validation hint */}
      {!hasAtLeastOneField && (
        <p className="text-xs text-slate-500 text-center">
          Fill at least one field or skip
        </p>
      )}
    </form>
  );
}
