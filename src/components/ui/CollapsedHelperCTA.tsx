'use client';

/**
 * CollapsedHelperCTA - Compact call-to-action shown after "No thanks" decline
 *
 * Displays a compact row that allows users to re-expand the full helper UI
 * while the job is still in progress. Stays visible until status changes
 * to CONTACTING_CHP (for driver) or info is provided (for passenger).
 *
 * @version V1.3.0
 */

import { Zap, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface CollapsedHelperCTAProps {
  variant: 'driver' | 'passenger';
  onExpand: () => void;
  disabled?: boolean;
}

export default function CollapsedHelperCTA({
  variant,
  onExpand,
  disabled = false,
}: CollapsedHelperCTAProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isDriver = variant === 'driver';

  const Icon = isDriver ? Zap : Users;
  const text = isDriver
    ? 'Want to speed things up? Add details'
    : 'Have more info to share?';
  const iconBgColor = isDriver ? 'bg-amber-500/10' : 'bg-cyan-500/10';
  const iconColor = isDriver ? 'text-amber-400' : 'text-cyan-400';

  return (
    <button
      onClick={onExpand}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl',
        'border transition-all duration-300',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'animate-text-reveal',
        isDark
          ? 'glass-card-dark border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0',
          iconBgColor
        )}
      >
        <Icon className={cn('w-4 h-4', iconColor)} />
      </div>

      {/* Text */}
      <span className={cn(
        'flex-1 text-left text-sm font-medium',
        isDark ? 'text-slate-300' : 'text-slate-700'
      )}>
        {text}
      </span>

      {/* Expand arrow */}
      <ChevronRight className={cn(
        'w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5',
        isDark ? 'text-slate-500' : 'text-slate-400'
      )} />
    </button>
  );
}
