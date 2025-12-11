'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface SkeletonCardProps {
  /** Card content */
  children?: React.ReactNode;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

// ============================================
// COMPONENT
// ============================================

export function SkeletonCard({
  children,
  padding = 'md',
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        // Glass card dark styling
        'rounded-xl',
        'bg-slate-900/60',
        'backdrop-blur-sm',
        'border border-slate-700/30',
        // Padding
        paddingClasses[padding],
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export default SkeletonCard;
