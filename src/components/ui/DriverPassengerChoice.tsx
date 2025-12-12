'use client';

/**
 * DriverPassengerChoice - Interactive prompt for client type selection
 *
 * Displays two buttons (Driver / Passenger) in a dark glass-morphism style.
 * Used in law firm job chat to collect client type.
 */

import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverPassengerChoiceProps {
  onSelect: (choice: 'driver' | 'passenger') => void;
  disabled?: boolean;
}

export default function DriverPassengerChoice({
  onSelect,
  disabled = false,
}: DriverPassengerChoiceProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Driver button */}
      <button
        onClick={() => onSelect('driver')}
        disabled={disabled}
        className={cn(
          'flex-1 flex items-center justify-center gap-3 p-4 rounded-xl',
          'bg-gradient-to-br from-teal-600/20 to-cyan-600/20',
          'border border-teal-500/30',
          'text-teal-300 font-medium',
          'transition-all duration-300',
          'hover:from-teal-600/30 hover:to-cyan-600/30',
          'hover:border-teal-500/50',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Mobile: 48px height for touch targets
          'h-12 md:h-auto'
        )}
      >
        <User className="w-5 h-5" />
        <span>Driver</span>
      </button>

      {/* Passenger button */}
      <button
        onClick={() => onSelect('passenger')}
        disabled={disabled}
        className={cn(
          'flex-1 flex items-center justify-center gap-3 p-4 rounded-xl',
          'bg-gradient-to-br from-cyan-600/20 to-blue-600/20',
          'border border-cyan-500/30',
          'text-cyan-300 font-medium',
          'transition-all duration-300',
          'hover:from-cyan-600/30 hover:to-blue-600/30',
          'hover:border-cyan-500/50',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Mobile: 48px height for touch targets
          'h-12 md:h-auto'
        )}
      >
        <Users className="w-5 h-5" />
        <span>Passenger</span>
      </button>
    </div>
  );
}
