'use client';

import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type StatColor = 'slate' | 'amber' | 'blue' | 'green' | 'orange';

interface StatCardProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** The metric value to display */
  value: number;
  /** Label text below the value */
  label: string;
  /** Color theme for the card accent */
  color?: StatColor;
  /** Whether this card is currently selected/active */
  isActive?: boolean;
  /** Animation delay for staggered entrance */
  animationDelay?: number;
  /** Visual variant: 'default' uses glass-card-dark, 'subtle' uses glass-subtle for nested cards */
  variant?: 'default' | 'subtle';
}

/**
 * Color configurations for each theme
 */
const COLOR_CONFIG: Record<
  StatColor,
  {
    glow: string;
    text: string;
    border: string;
    activeBg: string;
  }
> = {
  slate: {
    glow: 'shadow-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-600/30',
    activeBg: 'bg-slate-500/10',
  },
  amber: {
    glow: 'shadow-amber-500/30',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500/10',
  },
  blue: {
    glow: 'shadow-blue-500/30',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-500/10',
  },
  green: {
    glow: 'shadow-emerald-500/30',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    activeBg: 'bg-emerald-500/10',
  },
  orange: {
    glow: 'shadow-orange-500/30',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    activeBg: 'bg-orange-500/10',
  },
};

const StatCard = forwardRef<HTMLButtonElement, StatCardProps>(
  (
    {
      className,
      value,
      label,
      color = 'slate',
      isActive = false,
      animationDelay = 0,
      variant = 'default',
      style,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(0);
    const colorConfig = COLOR_CONFIG[color];

    // Count-up animation
    useEffect(() => {
      const duration = 1000; // 1 second
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), value);
        setDisplayValue(current);

        if (step >= steps) {
          clearInterval(timer);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'relative flex flex-col items-center justify-center',
          'p-4 md:p-5 rounded-xl',
          'transition-all duration-300 ease-out',
          'cursor-pointer',

          // Glass effect - variant determines base style
          variant === 'default' ? 'glass-card-dark' : 'glass-subtle',
          'border',
          colorConfig.border,

          // Hover state - subtle lift for nested cards
          variant === 'default'
            ? 'hover:scale-[1.02]'
            : 'hover-lift-subtle',
          'hover:border-opacity-50',

          // Active state
          isActive && [
            colorConfig.activeBg,
            'ring-1',
            color === 'slate' && 'ring-slate-500/50',
            color === 'amber' && 'ring-amber-500/50',
            color === 'blue' && 'ring-blue-500/50',
            color === 'green' && 'ring-emerald-500/50',
            color === 'orange' && 'ring-orange-500/50',
          ],

          // Animation
          'opacity-0 animate-text-reveal',

          className
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
          ...style,
        }}
        {...props}
      >
        {/* Value */}
        <span
          className={cn(
            'text-3xl md:text-4xl font-bold tabular-nums',
            'transition-colors duration-300',
            colorConfig.text
          )}
        >
          {displayValue}
        </span>

        {/* Label */}
        <span className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          {label}
        </span>

        {/* Glow effect when active */}
        {isActive && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl opacity-50 blur-xl -z-10',
              color === 'slate' && 'bg-slate-500/20',
              color === 'amber' && 'bg-amber-500/20',
              color === 'blue' && 'bg-blue-500/20',
              color === 'green' && 'bg-emerald-500/20',
              color === 'orange' && 'bg-orange-500/20'
            )}
          />
        )}
      </button>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
