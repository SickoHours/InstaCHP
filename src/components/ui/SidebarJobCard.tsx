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
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { getStatusColor } from '@/lib/statusMapping';

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
    const statusColor = getStatusColor(job.internalStatus);
    const dotColorClass = STATUS_DOT_COLORS[statusColor] || 'bg-slate-400';
    const basePath = userType === 'law_firm' ? '/law' : '/staff';

    return (
      <Link
        ref={ref}
        href={`${basePath}/jobs/${job._id}`}
        onClick={onSelect}
        className={cn(
          // Base styles
          'block px-3 py-3 rounded-lg',
          'transition-all duration-200',
          'border-l-2',

          // Default state
          !isSelected && [
            'border-l-transparent',
            'bg-transparent',
            'hover:bg-white/5',
          ],

          // Selected state
          isSelected && [
            'border-l-teal-500',
            'bg-teal-500/10',
            'shadow-[0_0_20px_rgba(20,184,166,0.1)]',
          ],

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset',

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
              isSelected && 'ring-2 ring-offset-1 ring-offset-slate-900',
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
                isSelected ? 'text-white' : 'text-slate-200'
              )}
            >
              {job.clientName}
            </h4>

            {/* Report number */}
            <p
              className={cn(
                'text-xs truncate mt-0.5',
                isSelected ? 'text-slate-300' : 'text-slate-500'
              )}
            >
              {job.reportNumber}
            </p>

            {/* Relative time */}
            <p className="text-[10px] text-slate-600 mt-1">
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
