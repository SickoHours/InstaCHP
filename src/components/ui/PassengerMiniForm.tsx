'use client';

/**
 * PassengerMiniForm - Compact form for collecting passenger verification data
 *
 * Displays client name (static) and 3 optional fields: plate, driver license, VIN.
 * At least 1 field must be filled. Uses dark glass-morphism styling.
 * Used in law firm job chat when passenger is selected.
 */

import { useState } from 'react';
import { Car, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PassengerFormData {
  plate: string;
  driverLicense: string;
  vin: string;
}

interface PassengerMiniFormProps {
  clientName: string;
  onSubmit: (data: PassengerFormData) => void | Promise<void>;
  disabled?: boolean;
}

export default function PassengerMiniForm({
  clientName,
  onSubmit,
  disabled = false,
}: PassengerMiniFormProps) {
  const [formData, setFormData] = useState<PassengerFormData>({
    plate: '',
    driverLicense: '',
    vin: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipNudge, setShowSkipNudge] = useState(false);

  // Check if at least one field is filled
  const hasAtLeastOneField = !!(
    formData.plate ||
    formData.driverLicense ||
    formData.vin
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

  const handleContinueAnyway = async () => {
    setShowSkipNudge(false);
    setIsSubmitting(true);
    try {
      await onSubmit(formData); // Submit empty or partial data
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client Name (static display) */}
      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <p className="text-xs text-slate-500 mb-1">Client Name</p>
        <p className="text-sm text-slate-300 font-medium">{clientName}</p>
      </div>

      {/* Help text */}
      <p className="text-xs text-slate-400">
        Provide as many fields as possible for the best chance of finding your report:
      </p>

      {/* License Plate */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          License Plate
        </label>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
            placeholder="e.g., 8ABC123"
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Driver License */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Driver License
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={formData.driverLicense}
            onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
            placeholder="e.g., D1234567"
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* VIN */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          VIN
        </label>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
            placeholder="e.g., 1HGBH41JXMN109186"
            disabled={disabled || isSubmitting}
            className={cn(
              'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-base md:text-sm',
              'placeholder:text-slate-600',
              'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Skip Nudge Modal */}
      {showSkipNudge && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-text-reveal">
          <p className="text-sm text-amber-300 mb-3 leading-relaxed">
            Not having this extra information could delay your report. We&apos;ll still work it, but
            there&apos;s a higher chance of delay.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleContinueAnyway}
              disabled={disabled || isSubmitting}
              className={cn(
                'flex-1 h-10 rounded-lg font-medium',
                'bg-amber-600 text-white hover:bg-amber-500',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Continue Anyway
            </button>
            <button
              type="button"
              onClick={() => setShowSkipNudge(false)}
              className={cn(
                'flex-1 h-10 rounded-lg font-medium',
                'bg-slate-700 text-slate-300 hover:bg-slate-600',
                'transition-all duration-200'
              )}
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* "I don't have this info" button */}
      {!hasAtLeastOneField && !showSkipNudge && (
        <button
          type="button"
          onClick={() => setShowSkipNudge(true)}
          disabled={disabled || isSubmitting}
          className={cn(
            'w-full h-10 rounded-lg font-medium',
            'text-slate-400 hover:text-slate-300',
            'border border-slate-700/50 hover:border-slate-600',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          I don&apos;t have this information
        </button>
      )}

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
                'bg-gradient-to-r from-teal-600 to-cyan-600',
                'text-white',
                'hover:from-teal-500 hover:to-cyan-500',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'shadow-lg shadow-teal-500/20',
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

      {/* Validation hint */}
      {!hasAtLeastOneField && (
        <p className="text-xs text-amber-400 text-center">
          Please fill at least one field to continue
        </p>
      )}
    </form>
  );
}
