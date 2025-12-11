'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBase, type SkeletonBaseProps } from './SkeletonBase';

// ============================================
// TYPES
// ============================================

interface SkeletonTextProps extends Omit<SkeletonBaseProps, 'height' | 'rounded'> {
  /** Number of text lines to render */
  lines?: number;
  /** Size preset for text height */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Gap between lines */
  gap?: 'sm' | 'md' | 'lg';
  /** Make last line shorter for natural paragraph look */
  lastLineShort?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const sizeClasses = {
  xs: 'h-3',
  sm: 'h-4',
  md: 'h-5',
  lg: 'h-6',
  xl: 'h-8',
};

const gapClasses = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
};

// ============================================
// COMPONENT
// ============================================

export function SkeletonText({
  lines = 1,
  size = 'md',
  gap = 'md',
  width = '100%',
  lastLineShort = true,
  animation = 'shimmer',
  className,
}: SkeletonTextProps) {
  if (lines === 1) {
    return (
      <SkeletonBase
        width={width}
        rounded="md"
        animation={animation}
        className={cn(sizeClasses[size], className)}
      />
    );
  }

  return (
    <div className={cn('flex flex-col', gapClasses[gap], className)}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        const lineWidth = isLast && lastLineShort ? '60%' : width;

        return (
          <SkeletonBase
            key={index}
            width={lineWidth}
            rounded="md"
            animation={animation}
            className={sizeClasses[size]}
          />
        );
      })}
    </div>
  );
}

export default SkeletonText;
