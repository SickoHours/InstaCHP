'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Job, InternalStatus, PublicStatus } from '@/lib/types';
import {
  getPublicStatus,
  getStatusColor,
  formatPublicStatus,
} from '@/lib/statusMapping';

interface StaffJobCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Job data to display */
  job: Job;
  /** Animation delay in ms for staggered entrance */
  animationDelay?: number;
}

/**
 * Format internal status for display
 * Converts SNAKE_CASE to Title Case
 */
function formatInternalStatus(status: InternalStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Dark mode badge colors for internal status
 */
const INTERNAL_STATUS_COLORS: Record<InternalStatus, string> = {
  NEW: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
  NEEDS_CALL: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  CALL_IN_PROGRESS: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  READY_FOR_AUTOMATION: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  AUTOMATION_RUNNING: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  FACE_PAGE_ONLY: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  WAITING_FOR_FULL_REPORT: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  COMPLETED_FULL_REPORT: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  COMPLETED_MANUAL: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  COMPLETED_FACE_PAGE_ONLY: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  NEEDS_MORE_INFO: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  NEEDS_IN_PERSON_PICKUP: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
  AUTOMATION_ERROR: 'bg-red-500/20 text-red-200 border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-200 border-red-500/30',
};

/**
 * Dark mode badge colors for public status
 */
const PUBLIC_STATUS_COLORS: Record<PublicStatus, string> = {
  SUBMITTED: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  CONTACTING_CHP: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  FACE_PAGE_READY: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  WAITING_FOR_REPORT: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  REPORT_READY: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  NEEDS_INFO: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  CANCELLED: 'bg-red-500/20 text-red-200 border-red-500/30',
};

const StaffJobCard = forwardRef<HTMLAnchorElement, StaffJobCardProps>(
  ({ className, job, animationDelay = 0, style, ...props }, ref) => {
    const publicStatus = getPublicStatus(job.internalStatus);

    return (
      <Link
        ref={ref}
        href={`/staff/jobs/${job._id}`}
        className={cn(
          // Base styles
          'block rounded-xl',
          'glass-card-dark',
          'transition-all duration-300 ease-out',

          // Hover effects
          'hover:scale-[1.01]',
          'hover:border-slate-600/50',
          'hover:shadow-lg hover:shadow-teal-500/5',

          // Active state
          'active:scale-[0.99]',

          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',

          // Animation
          'opacity-0 animate-message-cascade',

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
            <h3 className="text-base font-semibold text-slate-100 truncate">
              {job.clientName}
            </h3>

            {/* Report number */}
            <p className="text-sm text-slate-400 font-mono truncate">
              {job.reportNumber}
            </p>

            {/* Law firm name */}
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {job.lawFirmName}
            </p>

            {/* Status badges row */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {/* Internal status badge */}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                  INTERNAL_STATUS_COLORS[job.internalStatus]
                )}
              >
                {formatInternalStatus(job.internalStatus)}
              </span>

              {/* Arrow between statuses */}
              <ArrowRight className="w-3 h-3 text-slate-600" />

              {/* Public status badge */}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                  PUBLIC_STATUS_COLORS[publicStatus]
                )}
              >
                {formatPublicStatus(publicStatus)}
              </span>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-slate-500 mt-2">
              {formatRelativeTime(job.createdAt)}
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
        </div>
      </Link>
    );
  }
);

StaffJobCard.displayName = 'StaffJobCard';

export default StaffJobCard;
