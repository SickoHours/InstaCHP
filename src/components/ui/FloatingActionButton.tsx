import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Optional label (shown when extended) */
  label?: string;
  /** Position on screen. Use 'static' when inside a flex container */
  position?: 'bottom-right' | 'bottom-center' | 'static';
  /** Show label (extended mode) */
  extended?: boolean;
}

const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      className,
      icon,
      label,
      position = 'bottom-right',
      extended = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - fixed only when not static
          position !== 'static' && 'fixed z-50',
          'flex items-center justify-center gap-2',
          'bg-gradient-to-r from-amber-500 to-amber-600',
          'text-white font-semibold',
          'shadow-lg shadow-amber-500/30',
          'transition-all duration-200',

          // Hover/active states
          'hover:scale-105 hover:brightness-110',
          'active:scale-95',

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/20',

          // Size - 56px diameter or extended
          extended ? 'h-14 px-6 rounded-full' : 'h-14 w-14 rounded-full',

          // Position styles (only for fixed positions)
          position === 'bottom-right' && 'bottom-6 right-6',
          position === 'bottom-center' && 'bottom-6 left-1/2 -translate-x-1/2',

          // Hide on desktop (only for fixed positions)
          position !== 'static' && 'md:hidden',

          className
        )}
        {...props}
      >
        {icon}
        {extended && label && <span className="text-base">{label}</span>}
      </button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
