'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface SkeletonBaseProps {
  /** Width of the skeleton (CSS value or number for px) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number for px) */
  height?: string | number;
  /** Border radius variant */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'none';
  /** Additional class names */
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const animationClasses = {
  pulse: 'animate-skeleton-pulse',
  shimmer: 'skeleton-shimmer',
  none: '',
};

// ============================================
// COMPONENT
// ============================================

export function SkeletonBase({
  width,
  height,
  rounded = 'md',
  animation = 'shimmer',
  className,
}: SkeletonBaseProps) {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={cn(
        // Base styles
        'bg-slate-800/60',
        // Border radius
        roundedClasses[rounded],
        // Animation
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

export default SkeletonBase;
