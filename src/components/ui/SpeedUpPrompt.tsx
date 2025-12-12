'use client';

/**
 * SpeedUpPrompt - Binary yes/no choice for crash details
 *
 * Asks user if they want to provide crash details to speed up report retrieval.
 * Clean skip experience with friendly, non-pushy copy.
 */

import { Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedUpPromptProps {
  onChoice: (wantsToProvide: boolean) => void;
  disabled?: boolean;
}

export default function SpeedUpPrompt({
  onChoice,
  disabled = false,
}: SpeedUpPromptProps) {
  return (
    <div className="glass-card-dark rounded-xl p-5 border border-cyan-500/20 animate-text-reveal">
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 flex-shrink-0">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Want to speed things up?
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sharing crash details (date, time, officer ID) helps us locate your report faster.
            <span className="text-slate-500 ml-1">This is optional.</span>
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
            'bg-gradient-to-r from-teal-600/90 to-cyan-600/90',
            'border border-teal-500/30',
            'text-white font-medium',
            'transition-all duration-300',
            'hover:from-teal-500/90 hover:to-cyan-500/90',
            'hover:border-teal-500/50',
            'hover:scale-[1.02]',
            'hover:shadow-lg hover:shadow-teal-500/20',
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
          onClick={() => onChoice(false)}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl',
            'bg-slate-800/50',
            'border border-slate-700/50',
            'text-slate-300 font-medium',
            'transition-all duration-300',
            'hover:bg-slate-800/70',
            'hover:border-slate-600/50',
            'hover:text-white',
            'hover:scale-[1.02]',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Mobile: 48px height for touch targets
            'h-12 md:h-auto'
          )}
        >
          <span>No thanks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
