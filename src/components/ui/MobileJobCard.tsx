'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { getStatusColor, STATUS_COLORS, DARK_STATUS_COLORS } from '@/lib/statusMapping';
import StatusBadge from './StatusBadge';

interface MobileJobCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Job data to display */
  job: Job;
  /** Animation delay in ms for staggered entrance */
  animationDelay?: number;
  /** Theme variant */
  variant?: 'light' | 'dark';
}

const MobileJobCard = forwardRef<HTMLAnchorElement, MobileJobCardProps>(
  ({ className, job, animationDelay = 0, variant = 'light', style, ...props }, ref) => {
    const isDark = variant === 'dark';
    const statusColor = getStatusColor(job.internalStatus);
    const borderClass = isDark
      ? DARK_STATUS_COLORS[statusColor].borderLeft
      : STATUS_COLORS[statusColor].borderLeft;

    return (
      <Link
        ref={ref}
        href={`/law/jobs/${job._id}`}
        className={cn(
          // Base styles
          'block rounded-xl',
          'transition-all duration-300',

          // Light mode styles
          !isDark && [
            'bg-white shadow-sm border border-slate-200',
            'hover:shadow-md hover:-translate-y-0.5',
          ],

          // Dark mode styles
          isDark && [
            'job-card-dark',
          ],

          'active:scale-[0.99]',

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',

          // Left border accent (status color)
          'border-l-4',
          borderClass,

          // Animation
          'opacity-0 animate-card-entrance',

          className
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
          ...style,
        }}
        {...props}
      >
        <div className="p-4 flex items-center gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Client name (primary) */}
            <h3 className={cn(
              'text-base font-semibold truncate',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {job.clientName}
            </h3>

            {/* Report number (secondary) */}
            <p className={cn(
              'text-sm truncate',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              {job.reportNumber}
            </p>

            {/* Status and time row */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <StatusBadge
                internalStatus={job.internalStatus}
                size="sm"
                theme={isDark ? 'dark' : 'light'}
              />
              <span className={cn(
                'text-xs',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}>
                {formatRelativeTime(job.createdAt)}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5',
            isDark ? 'text-slate-600' : 'text-slate-400'
          )} />
        </div>
      </Link>
    );
  }
);

MobileJobCard.displayName = 'MobileJobCard';

export default MobileJobCard;
