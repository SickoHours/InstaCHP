'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBase } from '../SkeletonBase';
import { SkeletonText } from '../SkeletonText';

// ============================================
// TYPES
// ============================================

interface TimelineItemSkeletonProps {
  /** Stagger animation delay (in ms) */
  delay?: number;
  /** Whether this is the last item (no connector line) */
  isLast?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function TimelineItemSkeleton({
  delay = 0,
  isLast = false,
  className,
}: TimelineItemSkeletonProps) {
  return (
    <div
      className={cn(
        'relative flex gap-4 pb-6',
        'animate-card-entrance',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      {/* Timeline node */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <SkeletonBase
          width={12}
          height={12}
          rounded="full"
          className="z-10"
        />

        {/* Connector line */}
        {!isLast && (
          <div className="absolute top-3 w-0.5 h-full bg-slate-700/30" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2">
        {/* Glass card */}
        <div className={cn(
          'rounded-xl p-4',
          'bg-slate-900/60 backdrop-blur-sm',
          'border border-slate-700/30'
        )}>
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {/* Icon */}
              <SkeletonBase width={20} height={20} rounded="md" />
              {/* Event type */}
              <SkeletonText size="sm" width={100} />
            </div>
            {/* Time */}
            <SkeletonText size="xs" width={60} />
          </div>

          {/* Message content */}
          <SkeletonText lines={2} size="sm" gap="sm" />
        </div>
      </div>
    </div>
  );
}

export default TimelineItemSkeleton;
