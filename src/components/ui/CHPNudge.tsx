'use client';

/**
 * CHPNudge - Dismissible info card prompting law firms to call CHP
 *
 * Shows when status is NEW and client type is selected.
 * Auto-hides when status changes from NEW.
 * Displays plain-language message encouraging optional CHP call.
 */

import { Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CHPNudgeProps {
  reportNumber: string;
  onDismiss: () => void;
}

export default function CHPNudge({ reportNumber, onDismiss }: CHPNudgeProps) {
  return (
    <div className="glass-card-dark rounded-lg p-4 border border-cyan-500/30 animate-text-reveal">
      <div className="flex items-start gap-3">
        {/* Phone Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0">
          <Phone className="w-5 h-5 text-cyan-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-cyan-300 font-medium">Speed things up!</p>
            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full',
                'text-slate-500 hover:text-slate-300',
                'hover:bg-slate-700/50',
                'transition-all duration-200',
                'active:scale-95'
              )}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-slate-300 mb-3 leading-relaxed">
            Call CHP with report #{' '}
            <span className="font-mono text-teal-400 font-medium">{reportNumber}</span> to get
            crash date, crash time, and officer ID.
          </p>

          <p className="text-xs text-slate-400">Or our team will handle this for you!</p>
        </div>
      </div>
    </div>
  );
}
