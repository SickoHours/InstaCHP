'use client';

/**
 * SpeedUpPrompt - Binary yes/no choice for crash details
 *
 * Asks user if they want to provide crash details to speed up report retrieval.
 * Clean skip experience with friendly, non-pushy copy.
 */

import { Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface SpeedUpPromptProps {
  onChoice: (wantsToProvide: boolean) => void;
  onCollapse?: () => void;  // Soft-dismiss handler for "No thanks" behavior
  disabled?: boolean;
}

export default function SpeedUpPrompt({
  onChoice,
  onCollapse,
  disabled = false,
}: SpeedUpPromptProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      'rounded-xl p-5 border border-cyan-500/20 animate-text-reveal',
      isDark ? 'glass-card-dark' : 'bg-white'
    )}>
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 flex-shrink-0">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className={cn(
            'text-lg font-semibold mb-1',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Want to speed things up?
          </h3>
          <p className={cn(
            'text-sm leading-relaxed',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Sharing crash details (date, time, officer ID) helps us locate your report faster.
            <span className={cn(
              'ml-1',
              isDark ? 'text-slate-500' : 'text-slate-600'
            )}>This is optional.</span>
          </p>
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Yes - Primary action */}
        <button
          onClick={() => onChoice(true)}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl',
            'bg-gradient-to-r from-amber-500/90 to-cyan-600/90',
            'border border-amber-400/30',
            'text-white font-medium',
            'transition-all duration-300',
            'hover:from-amber-400/90 hover:to-cyan-500/90',
            'hover:border-amber-400/50',
            'hover:scale-[1.02]',
            'hover:shadow-lg hover:shadow-amber-400/20',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Mobile: 48px height for touch targets
            'h-12 md:h-auto'
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Yes, I have details</span>
        </button>

        {/* No - Secondary action */}
        <button
          onClick={() => (onCollapse ? onCollapse() : onChoice(false))}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl',
            'border font-medium',
            'transition-all duration-300',
            'hover:scale-[1.02]',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Mobile: 48px height for touch targets
            'h-12 md:h-auto',
            isDark
              ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600/50 hover:text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900'
          )}
        >
          <span>No thanks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
