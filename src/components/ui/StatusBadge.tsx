import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { InternalStatus, PublicStatus, StatusColor } from '@/lib/types';
import {
  getPublicStatus,
  getStatusColor,
  getStatusColorClasses,
  getDarkStatusColorClasses,
  formatPublicStatus,
} from '@/lib/statusMapping';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Internal status (staff view) - will be converted to public for display */
  internalStatus?: InternalStatus;
  /** Public status (law firm view) - displayed directly */
  publicStatus?: PublicStatus;
  /** Override color directly */
  color?: StatusColor;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Shape variant */
  variant?: 'badge' | 'pill';
  /** Theme variant */
  theme?: 'light' | 'dark';
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      internalStatus,
      publicStatus,
      color: colorOverride,
      size = 'sm',
      variant = 'badge',
      theme = 'light',
      ...props
    },
    ref
  ) => {
    // Determine display status (prefer publicStatus if provided directly)
    const displayStatus =
      publicStatus ||
      (internalStatus ? getPublicStatus(internalStatus) : 'IN_PROGRESS');

    // Determine color (prefer override, then derive from internal status)
    const color =
      colorOverride ||
      (internalStatus ? getStatusColor(internalStatus) : 'blue');

    const isDark = theme === 'dark';
    const colorClasses = isDark
      ? getDarkStatusColorClasses(color)
      : getStatusColorClasses(color);

    // Active statuses get pulse animation in dark mode
    const isActive = ['blue', 'yellow'].includes(color);

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium border',
          'transition-all duration-200',

          // Size styles
          size === 'sm' && 'px-2 py-0.5 text-xs gap-1.5',
          size === 'md' && 'px-3 py-1 text-sm gap-2',

          // Variant styles
          variant === 'badge' && 'rounded-md',
          variant === 'pill' && 'rounded-full',

          // Color styles
          colorClasses.bg,
          colorClasses.text,
          colorClasses.border,

          // Dark mode glow for active statuses
          isDark && isActive && 'animate-glow-pulse',

          className
        )}
        {...props}
      >
        {/* Pulse dot for active statuses in dark mode */}
        {isDark && isActive && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
        )}
        {formatPublicStatus(displayStatus)}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
