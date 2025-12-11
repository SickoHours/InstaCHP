'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBase } from '../SkeletonBase';
import { SkeletonText } from '../SkeletonText';
import { SkeletonCard } from '../SkeletonCard';

// ============================================
// TYPES
// ============================================

interface JobCardSkeletonProps {
  /** Visual variant */
  variant?: 'mobile' | 'table-row';
  /** Stagger animation delay (in ms) */
  delay?: number;
  /** Additional class names */
  className?: string;
}

// ============================================
// MOBILE CARD SKELETON
// ============================================

function MobileCardSkeleton({ delay = 0, className }: { delay?: number; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-slate-900/60 backdrop-blur-sm',
        'border border-slate-700/30',
        'animate-card-entrance',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700/50" />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Client name */}
            <SkeletonText size="md" width="70%" />
            {/* Report number */}
            <SkeletonText size="sm" width="50%" />
          </div>

          {/* Right side - status badge */}
          <SkeletonBase
            width={80}
            height={24}
            rounded="full"
            className="flex-shrink-0"
          />
        </div>

        {/* Bottom row - time */}
        <div className="mt-3 pt-3 border-t border-slate-700/30">
          <SkeletonText size="xs" width="30%" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TABLE ROW SKELETON
// ============================================

function TableRowSkeleton({ delay = 0, className }: { delay?: number; className?: string }) {
  return (
    <tr
      className={cn(
        'animate-card-entrance border-b border-slate-700/30',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      {/* Client Name */}
      <td className="px-4 py-3">
        <SkeletonText size="sm" width="80%" />
      </td>
      {/* Report Number */}
      <td className="px-4 py-3">
        <SkeletonText size="sm" width="70%" />
      </td>
      {/* Law Firm */}
      <td className="px-4 py-3">
        <SkeletonText size="sm" width="60%" />
      </td>
      {/* Internal Status */}
      <td className="px-4 py-3">
        <SkeletonBase width={90} height={24} rounded="full" />
      </td>
      {/* Public Status */}
      <td className="px-4 py-3">
        <SkeletonBase width={85} height={24} rounded="full" />
      </td>
      {/* Updated */}
      <td className="px-4 py-3">
        <SkeletonText size="xs" width="50%" />
      </td>
    </tr>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function JobCardSkeleton({
  variant = 'mobile',
  delay = 0,
  className,
}: JobCardSkeletonProps) {
  if (variant === 'table-row') {
    return <TableRowSkeleton delay={delay} className={className} />;
  }

  return <MobileCardSkeleton delay={delay} className={className} />;
}

export default JobCardSkeleton;
