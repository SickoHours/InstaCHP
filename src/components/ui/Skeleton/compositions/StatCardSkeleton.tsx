'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBase } from '../SkeletonBase';
import { SkeletonText } from '../SkeletonText';

// ============================================
// TYPES
// ============================================

interface StatCardSkeletonProps {
  /** Stagger animation delay (in ms) */
  delay?: number;
  /** Additional class names */
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function StatCardSkeleton({
  delay = 0,
  className,
}: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        // Glass card styling
        'rounded-xl p-4',
        'bg-slate-900/60 backdrop-blur-sm',
        'border border-slate-700/30',
        // Animation
        'animate-card-entrance',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left - Text content */}
        <div className="flex-1 space-y-2">
          {/* Label */}
          <SkeletonText size="xs" width="60%" />
          {/* Value */}
          <SkeletonBase width={48} height={32} rounded="md" />
        </div>

        {/* Right - Icon */}
        <SkeletonBase
          width={40}
          height={40}
          rounded="lg"
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
}

export default StatCardSkeleton;
