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
import { useTheme } from '@/context/ThemeContext';

interface CHPNudgeProps {
  reportNumber: string;
  onDismiss: () => void;
}

export default function CHPNudge({ reportNumber, onDismiss }: CHPNudgeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      'rounded-lg p-4 border border-cyan-500/30 animate-text-reveal',
      isDark ? 'glass-card-dark' : 'bg-white'
    )}>
      <div className="flex items-start gap-3">
        {/* Phone Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0">
          <Phone className="w-5 h-5 text-cyan-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={cn(
              'text-sm font-medium',
              isDark ? 'text-cyan-300' : 'text-cyan-600'
            )}>
              Speed things up!
            </p>
            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full',
                isDark
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                'transition-all duration-200',
                'active:scale-95'
              )}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={cn(
            'text-sm mb-3 leading-relaxed',
            isDark ? 'text-slate-300' : 'text-slate-700'
          )}>
            Call CHP with report #{' '}
            <span className="font-mono text-amber-400 font-medium">{reportNumber}</span> to get
            crash date, crash time, and officer ID.
          </p>

          <p className={cn(
            'text-xs',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Or our team will handle this for you!
          </p>
        </div>
      </div>
    </div>
  );
}
