'use client';

/**
 * Page1AttemptGuard - Guardrail components for Page 1 attempt tracking
 *
 * CHP limits Page 1 attempts (~2 max before lockout). These components protect
 * users from burning attempts by:
 * 1. Warning before first run
 * 2. Requiring confirmation before second run (after one failure)
 * 3. Locking the UI after two failures
 *
 * @version V2.7.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Lock, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// NORMALIZATION HELPERS
// ============================================

/**
 * Normalize date to MMDDYYYY for comparison
 * Handles both MM/DD/YYYY and YYYY-MM-DD formats
 */
function normalizeDateForComparison(d: string): string {
  if (!d) return '';
  
  // Try YYYY-MM-DD format
  const isoMatch = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[2]}${isoMatch[3]}${isoMatch[1]}`; // MMDDYYYY
  }
  
  // Try MM/DD/YYYY format
  const usMatch = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    return `${usMatch[1].padStart(2, '0')}${usMatch[2].padStart(2, '0')}${usMatch[3]}`;
  }
  
  // Fallback: just digits
  return d.replace(/\D/g, '');
}

/**
 * Normalize time to HHMM for comparison
 * Handles HHMM and HH:MM formats
 */
function normalizeTimeForComparison(t: string): string {
  if (!t) return '';
  return t.replace(/\D/g, '').padStart(4, '0');
}

// ============================================
// PAGE 1 WARNING BANNER
// ============================================

interface Page1WarningBannerProps {
  className?: string;
}

/**
 * Warning banner shown before first Page 1 run
 * Reminds users that CHP limits attempts
 */
export function Page1WarningBanner({ className }: Page1WarningBannerProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-4',
        'bg-amber-500/10 border border-amber-500/20',
        'animate-fade-in',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-400 mb-1">
            CHP limits Page 1 attempts
          </h4>
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Double-check these details before running:
          </p>
          <ul className="text-xs text-amber-400/70 mt-2 space-y-1 list-disc list-inside">
            <li>Crash Date (exact date, MM/DD/YYYY)</li>
            <li>Crash Time (24-hour format, e.g., 1430)</li>
            <li>Report Number (exact digits)</li>
            <li>Officer ID (1-6 digits)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE 1 CONFIRMATION MODAL
// ============================================

interface Page1ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expectedCrashDate: string;
  expectedCrashTime: string;
}

/**
 * Confirmation modal shown after one CONSUMED Page 1 failure
 * (i.e., page1SubmitClicked === true AND Page 1 rejection)
 *
 * A "consumed" failure means CHP actually processed and rejected the Page 1 lookup.
 * This is tracked via page1FailureCount in the job state.
 *
 * NOT triggered by:
 * - Validation failures (pre-submit, client-side)
 * - Network errors or timeouts (no CHP contact)
 * - Page 2 failures (Page 1 passed)
 * - DOM/timeout issues before submission
 *
 * Requires re-typing crash date and time to confirm intent
 */
export function Page1ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  expectedCrashDate,
  expectedCrashTime,
}: Page1ConfirmationModalProps) {
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputDate('');
      setInputTime('');
      setConfirmed(false);
    }
  }, [isOpen]);

  // Normalize and compare values
  const dateMatches = normalizeDateForComparison(inputDate) === normalizeDateForComparison(expectedCrashDate);
  const timeMatches = normalizeTimeForComparison(inputTime) === normalizeTimeForComparison(expectedCrashTime);
  const canConfirm = dateMatches && timeMatches && confirmed;

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="page1-confirm-title"
    >
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-red-500/30 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 id="page1-confirm-title" className="text-lg font-semibold text-red-400">
              Last Attempt Warning
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400 font-medium">
              This is likely your last attempt before CHP locks you out.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            CHP rejected your previous Page 1 lookup attempt. This counts against the limited attempts before lockout. Please verify the crash details before your final attempt:
          </p>

          {/* Crash Date Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Date (MM/DD/YYYY or YYYY-MM-DD)
            </label>
            <input
              type="text"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              placeholder="e.g., 12/15/2024"
              className={cn(
                'w-full h-12 px-4 rounded-lg',
                'bg-slate-800/50 border',
                'text-slate-200 text-base',
                'placeholder:text-slate-600',
                'focus:outline-none focus:ring-2',
                'transition-all duration-200',
                inputDate && dateMatches
                  ? 'border-green-500/50 focus:ring-green-500/20'
                  : inputDate
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-slate-700/50 focus:ring-slate-500/20'
              )}
            />
            {inputDate && !dateMatches && (
              <p className="text-xs text-red-400">Date doesn&apos;t match. Check format.</p>
            )}
            {inputDate && dateMatches && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Date matches
              </p>
            )}
          </div>

          {/* Crash Time Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Time (24-hour, e.g., 1430 or 14:30)
            </label>
            <input
              type="text"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              placeholder="e.g., 1430"
              className={cn(
                'w-full h-12 px-4 rounded-lg',
                'bg-slate-800/50 border',
                'text-slate-200 text-base',
                'placeholder:text-slate-600',
                'focus:outline-none focus:ring-2',
                'transition-all duration-200',
                inputTime && timeMatches
                  ? 'border-green-500/50 focus:ring-green-500/20'
                  : inputTime
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-slate-700/50 focus:ring-slate-500/20'
              )}
            />
            {inputTime && !timeMatches && (
              <p className="text-xs text-red-400">Time doesn&apos;t match. Check format.</p>
            )}
            {inputTime && timeMatches && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Time matches
              </p>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500/20"
            />
            <span className="text-sm text-slate-300 group-hover:text-slate-200">
              I have verified these details are correct and understand this may be my last attempt
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 h-12 rounded-lg font-medium text-sm',
              'bg-slate-800 text-slate-300',
              'hover:bg-slate-700',
              'transition-all duration-200'
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={cn(
              'flex-1 h-12 rounded-lg font-medium text-sm',
              'transition-all duration-200',
              canConfirm
                ? 'bg-red-600 text-white hover:bg-red-500 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            )}
          >
            Confirm & Run Wrapper
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE 1 LOCKED BANNER
// ============================================

interface Page1LockedBannerProps {
  className?: string;
}

/**
 * Locked banner shown after two Page 1 failures
 * Indicates manual staff handling is required
 */
export function Page1LockedBanner({ className }: Page1LockedBannerProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-4',
        'bg-red-500/10 border border-red-500/30',
        'animate-fade-in',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-400 mb-1">
            Page 1 attempts exhausted
          </h4>
          <p className="text-xs text-red-400/80 leading-relaxed mb-2">
            This job requires manual staff handling. The Run Wrapper button has been disabled.
          </p>
          <p className="text-xs text-red-400/60">
            CHP may have locked this report number. Contact CHP directly or escalate to manual pickup.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  Page1WarningBanner,
  Page1ConfirmationModal,
  Page1LockedBanner,
};

