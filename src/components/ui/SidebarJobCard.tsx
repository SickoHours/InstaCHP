'use client';

/**
 * SidebarJobCard - V2.0.0
 *
 * Compact job card for the sidebar job list.
 * Shows client name, report number, and status indicator dot.
 * Highlights when selected (current route).
 *
 * Used in the ChatGPT-style app shell sidebar.
 */

import { forwardRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { getStatusColor } from '@/lib/statusMapping';
import { useTheme } from '@/context/ThemeContext';

interface SidebarJobCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Job data to display */
  job: Job;
  /** Whether this job is currently selected (viewed) */
  isSelected?: boolean;
  /** User type determines the link path */
  userType: 'law_firm' | 'staff';
  /** Callback when job is clicked (for mobile drawer close) */
  onSelect?: () => void;
  /** Animation delay for staggered entrance */
  animationDelay?: number;
}

/**
 * Status dot color mapping for sidebar cards
 */
const STATUS_DOT_COLORS: Record<string, string> = {
  gray: 'bg-slate-400',
  blue: 'bg-blue-400',
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
};

const SidebarJobCard = forwardRef<HTMLAnchorElement, SidebarJobCardProps>(
  (
    {
      className,
      job,
      isSelected = false,
      userType,
      onSelect,
      animationDelay = 0,
      style,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const statusColor = getStatusColor(job.internalStatus);
    const dotColorClass = STATUS_DOT_COLORS[statusColor] || 'bg-slate-400';
    const basePath = userType === 'law_firm' ? '/law' : '/staff';
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If job is already selected, navigate to base path to close the job view
      if (isSelected) {
        e.preventDefault();
        router.push(basePath);
        onSelect?.();
        return;
      }
      // Otherwise, let the Link handle navigation normally
      onSelect?.();
    };

    return (
      <Link
        ref={ref}
        href={`${basePath}/jobs/${job._id}`}
        onClick={handleClick}
        className={cn(
          // Base styles
          'block px-3 py-3 rounded-lg',
          'transition-all duration-200',
          'border-l-2',

          // Default state
          !isSelected && [
            'border-l-transparent',
            'bg-transparent',
            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100',
          ],

          // Selected state
          isSelected && [
            'border-l-amber-400',
            'bg-amber-400/10',
            'shadow-[0_0_20px_rgba(251,191,36,0.1)]',
          ],

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset',

          // Animation
          animationDelay > 0 && 'opacity-0 animate-card-entrance',

          className
        )}
        style={{
          ...(animationDelay > 0 && { animationDelay: `${animationDelay}ms` }),
          ...style,
        }}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Status dot */}
          <div
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
              dotColorClass,
              isSelected && 'ring-2 ring-offset-1',
              isSelected && (isDark ? 'ring-offset-slate-900' : 'ring-offset-white'),
              statusColor === 'blue' && isSelected && 'ring-blue-400/50',
              statusColor === 'green' && isSelected && 'ring-emerald-400/50',
              statusColor === 'yellow' && isSelected && 'ring-yellow-400/50',
              statusColor === 'amber' && isSelected && 'ring-amber-400/50',
              statusColor === 'red' && isSelected && 'ring-red-400/50'
            )}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Client name */}
            <h4
              className={cn(
                'text-sm font-medium truncate',
                isSelected
                  ? (isDark ? 'text-white' : 'text-slate-900')
                  : (isDark ? 'text-slate-200' : 'text-slate-700')
              )}
            >
              {job.clientName}
            </h4>

            {/* Report number */}
            <p
              className={cn(
                'text-xs truncate mt-0.5',
                isSelected
                  ? (isDark ? 'text-slate-300' : 'text-slate-600')
                  : (isDark ? 'text-slate-500' : 'text-slate-500')
              )}
            >
              {job.reportNumber}
            </p>

            {/* Relative time */}
            <p className={cn(
              'text-[10px] mt-1',
              isDark ? 'text-slate-600' : 'text-slate-400'
            )}>
              {formatRelativeTime(job.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }
);

SidebarJobCard.displayName = 'SidebarJobCard';

export { SidebarJobCard };
export default SidebarJobCard;
