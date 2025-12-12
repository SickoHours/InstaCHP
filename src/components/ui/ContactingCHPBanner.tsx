'use client';

/**
 * ContactingCHPBanner - Notification banner for passengers when contacting CHP
 *
 * Shown when:
 * - Public status is CONTACTING_CHP
 * - Client type is passenger
 * - Passenger verification info is still missing
 *
 * Encourages (but doesn't require) providing additional identifiers.
 *
 * @version V1.3.0
 */

import { Info, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactingCHPBannerProps {
  onProvideInfo: () => void;
  onDismiss: () => void;
  disabled?: boolean;
}

export default function ContactingCHPBanner({
  onProvideInfo,
  onDismiss,
  disabled = false,
}: ContactingCHPBannerProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl p-4',
        'bg-amber-500/10 border border-amber-500/20',
        'animate-text-reveal'
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        disabled={disabled}
        className={cn(
          'absolute top-3 right-3',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'text-amber-400/60 hover:text-amber-400',
          'hover:bg-amber-500/10',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3 pr-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-200 leading-relaxed mb-3">
            We're contacting CHP now. If you have any additional identifiers, adding them can help us retrieve the report faster.{' '}
            <span className="text-amber-300/60">It's still optional.</span>
          </p>

          {/* Add info button */}
          <button
            onClick={onProvideInfo}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-amber-500/20 border border-amber-500/30',
              'text-sm text-amber-200 font-medium',
              'hover:bg-amber-500/30 hover:border-amber-500/40',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Add Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
