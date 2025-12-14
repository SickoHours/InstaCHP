'use client';

/**
 * DriverPassengerChoice - Interactive prompt for client type selection
 *
 * Displays two buttons (Driver / Passenger) with theme-aware styling.
 * Used in law firm job chat to collect client type.
 */

import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface DriverPassengerChoiceProps {
  onSelect: (choice: 'driver' | 'passenger') => void;
  disabled?: boolean;
}

export default function DriverPassengerChoice({
  onSelect,
  disabled = false,
}: DriverPassengerChoiceProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Driver button */}
      <button
        onClick={() => onSelect('driver')}
        disabled={disabled}
        className={cn(
          'flex-1 flex items-center justify-center gap-3 p-4 rounded-xl',
          'bg-gradient-to-br border font-medium',
          'transition-all duration-300',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Mobile: 48px height for touch targets
          'h-12 md:h-auto',
          isDark
            ? 'from-amber-500/20 to-cyan-600/20 border-amber-400/30 text-amber-300 hover:from-amber-500/30 hover:to-cyan-600/30 hover:border-amber-400/50'
            : 'from-amber-50 to-cyan-50 border-amber-300 text-amber-700 hover:from-amber-100 hover:to-cyan-100 hover:border-amber-400'
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
          'bg-gradient-to-br border font-medium',
          'transition-all duration-300',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Mobile: 48px height for touch targets
          'h-12 md:h-auto',
          isDark
            ? 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30 text-cyan-300 hover:from-cyan-600/30 hover:to-blue-600/30 hover:border-cyan-500/50'
            : 'from-cyan-50 to-blue-50 border-cyan-300 text-cyan-700 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400'
        )}
      >
        <Users className="w-5 h-5" />
        <span>Passenger</span>
      </button>
    </div>
  );
}
