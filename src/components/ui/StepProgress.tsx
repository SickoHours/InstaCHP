'use client';

import { cn } from '@/lib/utils';
import type { EscalationStep } from '@/lib/types';

interface StepProgressProps {
  /** Current step in the escalation workflow */
  currentStep: EscalationStep;
  /** Whether this is a fatal job (skips auto-check step) */
  isFatal?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Step labels for display (short form for mobile)
 */
const STEP_LABELS: Record<EscalationStep, string> = {
  claim: 'Claim',
  schedule: 'Schedule',
  download_auth: 'Auth',
  upload_report: 'Upload',
  auto_check: 'Check',
};

/**
 * Step order for determining position
 */
const STEP_ORDER: EscalationStep[] = [
  'claim',
  'schedule',
  'download_auth',
  'upload_report',
  'auto_check',
];

/**
 * StepProgress - Visual progress indicator for escalation workflow
 *
 * Shows dots representing each step in the escalation flow.
 * - Completed: Green filled dot
 * - Current: Orange pulsing dot
 * - Pending: Gray dot
 *
 * Fatal jobs have 4 steps (no auto-check), non-fatal have 5.
 */
export default function StepProgress({
  currentStep,
  isFatal = false,
  className,
}: StepProgressProps) {
  // Get available steps based on fatal status
  const availableSteps = isFatal
    ? STEP_ORDER.filter(s => s !== 'auto_check')
    : STEP_ORDER;

  const currentIndex = availableSteps.indexOf(currentStep);

  return (
    <div className={cn('flex flex-col items-center gap-1.5 mb-3', className)}>
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {availableSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                isCompleted && 'bg-emerald-400',
                isCurrent && 'bg-orange-400 animate-pulse scale-125',
                isPending && 'bg-slate-600'
              )}
              title={STEP_LABELS[step]}
            />
          );
        })}
      </div>

      {/* Current step label */}
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        Step {currentIndex + 1} of {availableSteps.length}
      </span>
    </div>
  );
}
