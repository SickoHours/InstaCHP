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
import { cn, formatOfficerIdError } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    page1: { ...initialPage1Data },
    page2: { ...initialPage2Data },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTimeError, setShowTimeError] = useState(false);
  const [showOfficerIdError, setShowOfficerIdError] = useState(false);
  const [officerIdErrorMsg, setOfficerIdErrorMsg] = useState<string>('');

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

  // Validate officer ID if entered
  const isOfficerIdValid = !formatOfficerIdError(formData.page1.officerId);

  // Save button enabled when: has data AND time is valid AND officer ID is valid (if entered)
  const canSave = hasAnyData && isCrashTimeValid && isOfficerIdValid && !disabled;

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

  const handleOfficerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setFormData({
      ...formData,
      page1: { ...formData.page1, officerId: value },
    });
    // Clear error when typing
    if (showOfficerIdError) {
      setShowOfficerIdError(false);
      setOfficerIdErrorMsg('');
    }
  };

  const handleOfficerIdBlur = () => {
    const error = formatOfficerIdError(formData.page1.officerId);
    if (error) {
      setShowOfficerIdError(true);
      setOfficerIdErrorMsg(error);
    } else {
      setShowOfficerIdError(false);
      setOfficerIdErrorMsg('');
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
    <div className={cn(
      'rounded-lg p-5 border border-cyan-500/20 animate-text-reveal',
      isDark ? 'glass-card-dark' : 'bg-white'
    )}>
      {/* Section 1: Crash Details (Page 1) */}
      <div className="mb-6">
        <h3 className={cn(
          'text-sm font-semibold mb-4',
          isDark ? 'text-cyan-300' : 'text-cyan-600'
        )}>
          Crash Details (Page 1)
        </h3>
        <div className="space-y-3">
          {/* Crash Date */}
          <div className="space-y-1.5">
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Crash Date
            </label>
            <div className="relative">
              <Calendar className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
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
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900',
                  'border text-base md:text-sm',
                  'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Crash Time (HHMM) */}
          <div className="space-y-1.5">
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Crash Time (24-hour HHMM)
            </label>
            <div className="relative">
              <Clock className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
              <input
                type="text"
                value={formData.page1.crashTime}
                onChange={handleCrashTimeChange}
                placeholder="e.g., 1430 for 2:30 PM"
                maxLength={4}
                disabled={disabled || isSaving}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'border text-base md:text-sm',
                  isDark
                    ? 'bg-slate-800/50 text-slate-200 placeholder:text-slate-600'
                    : 'bg-white text-slate-900 placeholder:text-slate-400',
                  showTimeError
                    ? 'border-red-500/50'
                    : isDark ? 'border-slate-700/50' : 'border-slate-300',
                  'focus:outline-none',
                  showTimeError
                    ? 'focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                    : 'focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
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
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Officer Badge Number
            </label>
            <div className="relative">
              <Shield className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
              <input
                type="text"
                value={formData.page1.officerId}
                onChange={handleOfficerIdChange}
                onBlur={handleOfficerIdBlur}
                placeholder="e.g., 012345"
                disabled={disabled || isSaving}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'border text-base md:text-sm',
                  isDark
                    ? 'bg-slate-800/50 text-slate-200 placeholder:text-slate-600'
                    : 'bg-white text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  showOfficerIdError
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : isDark
                    ? 'border-slate-700/50 focus:border-amber-400/50 focus:ring-amber-400/20'
                    : 'border-slate-300 focus:border-amber-400/50 focus:ring-amber-400/20'
                )}
              />
            </div>
            {showOfficerIdError && (
              <p className="text-xs text-red-400 mt-1">{officerIdErrorMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Driver Information (Page 2) */}
      <div className="mb-6">
        <h3 className={cn(
          'text-sm font-semibold mb-4',
          isDark ? 'text-cyan-300' : 'text-cyan-600'
        )}>
          Driver Information (Page 2)
        </h3>
        <div className="space-y-3">
          {/* First Name & Last Name (2-column on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className={cn(
                'text-xs font-medium uppercase tracking-wider',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}>
                First Name
              </label>
              <div className="relative">
                <User className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )} />
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
                    'border text-base md:text-sm',
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
                    'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className={cn(
                'text-xs font-medium uppercase tracking-wider',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}>
                Last Name
              </label>
              <div className="relative">
                <User className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )} />
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
                    'border text-base md:text-sm',
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
                    'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
              </div>
            </div>
          </div>

          {/* License Plate */}
          <div className="space-y-1.5">
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              License Plate
            </label>
            <div className="relative">
              <Car className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
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
                  'border text-base md:text-sm',
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Driver License */}
          <div className="space-y-1.5">
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Driver License
            </label>
            <div className="relative">
              <CreditCard className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
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
                  'border text-base md:text-sm',
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* VIN */}
          <div className="space-y-1.5">
            <label className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              VIN
            </label>
            <div className="relative">
              <Car className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
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
                  'border text-base md:text-sm',
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
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
                'bg-gradient-to-r from-amber-500 to-cyan-600',
                'text-white',
                'hover:from-amber-400 hover:to-cyan-500',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'shadow-lg shadow-amber-400/20',
              ]
            : [
                isDark ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-400',
                'cursor-not-allowed'
              ]
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
        <p className={cn(
          'text-xs text-center mt-3',
          isDark ? 'text-slate-500' : 'text-slate-600'
        )}>
          Please select Driver or Passenger first to enable form
        </p>
      )}
      {!hasAnyData && !disabled && (
        <p className={cn(
          'text-xs text-center mt-3',
          isDark ? 'text-slate-500' : 'text-slate-600'
        )}>
          Fill in any fields above to enable saving
        </p>
      )}
    </div>
  );
}
