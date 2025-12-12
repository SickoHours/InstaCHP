'use client';

/**
 * InlineFieldsCard - Unified always-visible form for Page 1 + Page 2 data
 *
 * Combines crash details (Page 1) and driver information (Page 2) in a single form.
 * No edit mode - fields are always visible and editable.
 * Includes HHMM time validation for crash time.
 * Used in law firm job detail view with flow gate support.
 *
 * @version V1.0.7
 */

import { useState } from 'react';
import { Calendar, Clock, Shield, User, Car, CreditCard, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page1Data {
  crashDate: string;
  crashTime: string; // HHMM format (24-hour)
  officerId: string;
}

interface Page2Data {
  firstName: string;
  lastName: string;
  plate: string;
  driverLicense: string;
  vin: string;
}

interface InlineFieldsCardProps {
  page1Data: Page1Data;
  page2Data: Page2Data;
  onSave: (data: { page1: Page1Data; page2: Page2Data }) => void | Promise<void>;
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

export default function InlineFieldsCard({
  page1Data: initialPage1Data,
  page2Data: initialPage2Data,
  onSave,
  disabled = false,
}: InlineFieldsCardProps) {
  const [formData, setFormData] = useState({
    page1: { ...initialPage1Data },
    page2: { ...initialPage2Data },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTimeError, setShowTimeError] = useState(false);

  // Check if any data has been entered
  const hasAnyData = !!(
    formData.page1.crashDate ||
    formData.page1.crashTime ||
    formData.page1.officerId ||
    formData.page2.firstName ||
    formData.page2.lastName ||
    formData.page2.plate ||
    formData.page2.driverLicense ||
    formData.page2.vin
  );

  // Validate crash time if entered
  const isCrashTimeValid = !formData.page1.crashTime || isValidCrashTime(formData.page1.crashTime);

  // Save button enabled when: has data AND time is valid (if entered)
  const canSave = hasAnyData && isCrashTimeValid && !disabled;

  const handleCrashTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4
    setFormData({
      ...formData,
      page1: { ...formData.page1, crashTime: value },
    });

    // Show error if 4 digits entered but invalid
    if (value.length === 4) {
      setShowTimeError(!isValidCrashTime(value));
    } else {
      setShowTimeError(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card-dark rounded-lg p-5 border border-cyan-500/20 animate-text-reveal">
      {/* Section 1: Crash Details (Page 1) */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-cyan-300 mb-4">Crash Details (Page 1)</h3>
        <div className="space-y-3">
          {/* Crash Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={formData.page1.crashDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    page1: { ...formData.page1, crashDate: e.target.value },
                  })
                }
                disabled={disabled || isSaving}
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
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Time (24-hour HHMM)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.page1.crashTime}
                onChange={handleCrashTimeChange}
                placeholder="e.g., 1430 for 2:30 PM"
                maxLength={4}
                disabled={disabled || isSaving}
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
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Officer Badge Number
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.page1.officerId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    page1: { ...formData.page1, officerId: e.target.value },
                  })
                }
                placeholder="e.g., 012345"
                disabled={disabled || isSaving}
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
        </div>
      </div>

      {/* Section 2: Driver Information (Page 2) */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-cyan-300 mb-4">Driver Information (Page 2)</h3>
        <div className="space-y-3">
          {/* First Name & Last Name (2-column on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={formData.page2.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      page2: { ...formData.page2, firstName: e.target.value },
                    })
                  }
                  placeholder="e.g., John"
                  disabled={disabled || isSaving}
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

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={formData.page2.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      page2: { ...formData.page2, lastName: e.target.value },
                    })
                  }
                  placeholder="e.g., Doe"
                  disabled={disabled || isSaving}
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
          </div>

          {/* License Plate */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              License Plate
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.page2.plate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    page2: { ...formData.page2, plate: e.target.value },
                  })
                }
                placeholder="e.g., 8ABC123"
                disabled={disabled || isSaving}
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
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.page2.driverLicense}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    page2: { ...formData.page2, driverLicense: e.target.value },
                  })
                }
                placeholder="e.g., D1234567"
                disabled={disabled || isSaving}
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
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.page2.vin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    page2: { ...formData.page2, vin: e.target.value },
                  })
                }
                placeholder="e.g., 1HGBH41JXMN109186"
                disabled={disabled || isSaving}
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
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!canSave || isSaving}
        className={cn(
          'w-full h-12 md:h-10 rounded-xl font-medium text-base md:text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          canSave && !isSaving
            ? [
                'bg-gradient-to-r from-teal-600 to-cyan-600',
                'text-white',
                'hover:from-teal-500 hover:to-cyan-500',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'shadow-lg shadow-teal-500/20',
              ]
            : ['bg-slate-800/50 text-slate-600', 'cursor-not-allowed']
        )}
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Save & Check for Report</span>
          </>
        )}
      </button>

      {/* Helper text */}
      {disabled && (
        <p className="text-xs text-slate-500 text-center mt-3">
          Please select Driver or Passenger first to enable form
        </p>
      )}
      {!hasAnyData && !disabled && (
        <p className="text-xs text-slate-500 text-center mt-3">
          Fill in any fields above to enable saving
        </p>
      )}
    </div>
  );
}
