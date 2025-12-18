'use client';

/**
 * Page1FailureCard - Explicit failure messaging for Page 1 rejections
 *
 * Shown when the CHP wrapper returns PAGE1_NOT_FOUND or PAGE1_REJECTED_ATTEMPT_RISK.
 * Provides a detailed checklist of fields to verify and explains the situation.
 *
 * @version V2.7.0
 */

import { AlertCircle, XCircle, Calendar, Clock, FileText, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface Page1FailureCardProps {
  /** The specific Page 1 rejection type */
  resultType: 'PAGE1_NOT_FOUND' | 'PAGE1_REJECTED_ATTEMPT_RISK';
  /** Number of Page 1 failures so far (1 or 2) */
  attemptNumber: number;
  /** Current crash date value for display */
  crashDate?: string;
  /** Current crash time value for display */
  crashTime?: string;
  /** Current report number for display */
  reportNumber?: string;
  /** Current officer ID for display */
  officerId?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// CHECKLIST ITEM
// ============================================

interface ChecklistItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  hint: string;
}

function ChecklistItem({ icon, label, value, hint }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 mt-0.5 text-slate-500">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          {value && (
            <code className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {value}
            </code>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Page1FailureCard({
  resultType,
  attemptNumber,
  crashDate,
  crashTime,
  reportNumber,
  officerId,
  className,
}: Page1FailureCardProps) {
  const isAttemptRisk = resultType === 'PAGE1_REJECTED_ATTEMPT_RISK';
  const isLocked = attemptNumber >= 2;

  // Determine header based on result type
  const headerText = isAttemptRisk
    ? 'CHP flagged this as an attempt risk'
    : 'Your Page 1 details did not match CHP records';

  // Determine warning text based on attempt count
  const attemptWarning = isLocked
    ? 'Page 1 attempts exhausted. Manual handling required.'
    : attemptNumber === 1
    ? 'You have 1 attempt remaining. Double-check all fields carefully.'
    : null;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-red-500/5 border border-red-500/20',
        'animate-fade-in',
        className
      )}
      role="alert"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-red-500/10">
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-400">{headerText}</h3>
          <p className="text-xs text-red-400/80 mt-1">
            This is usually a typo OR the report is a counter report not available online.
          </p>
        </div>
      </div>

      {/* Attempt Warning */}
      {attemptWarning && (
        <div
          className={cn(
            'px-4 py-2 flex items-center gap-2',
            isLocked ? 'bg-red-500/15' : 'bg-amber-500/10'
          )}
        >
          <AlertCircle
            className={cn('w-4 h-4', isLocked ? 'text-red-400' : 'text-amber-400')}
          />
          <span
            className={cn(
              'text-xs font-medium',
              isLocked ? 'text-red-400' : 'text-amber-400'
            )}
          >
            {attemptWarning}
          </span>
        </div>
      )}

      {/* Checklist */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Verify these fields
        </h4>
        <div className="divide-y divide-slate-800/50">
          <ChecklistItem
            icon={<Calendar className="w-4 h-4" />}
            label="Crash Date"
            value={crashDate || undefined}
            hint="Must be exact date in MM/DD/YYYY format"
          />
          <ChecklistItem
            icon={<Clock className="w-4 h-4" />}
            label="Crash Time"
            value={crashTime || undefined}
            hint="24-hour format (e.g., 1430 not 2:30 PM)"
          />
          <ChecklistItem
            icon={<FileText className="w-4 h-4" />}
            label="Report Number"
            value={reportNumber || undefined}
            hint="Exact digits, format 9XXX-YYYY-ZZZZZ"
          />
          <ChecklistItem
            icon={<User className="w-4 h-4" />}
            label="Officer ID"
            value={officerId || undefined}
            hint="5 digits, left-padded with zeros (e.g., 01234)"
          />
        </div>
      </div>

      {/* Counter Report Hint */}
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-slate-800/30 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Counter Report?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                If this is a counter report (picked up in person at CHP office), it won&apos;t be
                available online. You&apos;ll need to escalate to manual pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


