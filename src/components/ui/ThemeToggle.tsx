'use client';

/**
 * ThemeToggle - V1.0.0
 *
 * A button component for toggling between light and dark themes.
 * Features smooth icon animation and full accessibility support.
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label text (for dropdown menus) */
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  size = 'md',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, canToggleTheme } = useTheme();

  // Hide toggle for staff users (always dark mode)
  if (!canToggleTheme) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-lg transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',

        // Theme-aware colors
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--hover-bg)]',

        // Size variants
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10',

        // With label (for dropdown menus)
        showLabel && 'w-auto gap-2 px-3',

        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Icon container with rotation animation */}
      <span className="relative flex items-center justify-center">
        {/* Sun icon (visible in dark mode, click to switch to light) */}
        <Sun
          className={cn(
            'absolute transition-all duration-300',
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
        />
        {/* Moon icon (visible in light mode, click to switch to dark) */}
        <Moon
          className={cn(
            'absolute transition-all duration-300',
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
            isDark
              ? '-rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        {/* Invisible spacer to maintain layout */}
        <span className={cn('invisible', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
      </span>

      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}

/**
 * ThemeToggleMenuItem - For use in dropdown menus
 * Shows full row with icon and label
 */
export function ThemeToggleMenuItem({ className }: { className?: string }) {
  const { theme, toggleTheme, canToggleTheme } = useTheme();

  // Hide toggle for staff users (always dark mode)
  if (!canToggleTheme) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors',
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--hover-bg)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/50',
        className
      )}
      role="menuitem"
    >
      {isDark ? (
        <Sun className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Moon className="h-4 w-4 flex-shrink-0" />
      )}
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}

export default ThemeToggle;
