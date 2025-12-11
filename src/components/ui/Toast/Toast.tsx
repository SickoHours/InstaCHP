'use client';

import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/context/ToastContext';

// ============================================
// TYPES
// ============================================

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
  isExiting?: boolean;
}

// ============================================
// ICON MAP
// ============================================

const icons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// ============================================
// STYLE CONFIG
// ============================================

const toastStyles: Record<ToastVariant, {
  bg: string;
  border: string;
  icon: string;
  text: string;
  glow: string;
}> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    text: 'text-red-200',
    glow: 'shadow-red-500/20',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-200',
    glow: 'shadow-amber-500/20',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-200',
    glow: 'shadow-blue-500/20',
  },
};

// ============================================
// COMPONENT
// ============================================

export function Toast({ toast, onDismiss, isExiting }: ToastProps) {
  const Icon = icons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        // Base styles
        'relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl',
        'backdrop-blur-xl border shadow-lg',
        // Glass effect
        'bg-slate-900/80',
        styles.bg,
        styles.border,
        // Glow
        'shadow-lg',
        styles.glow,
        // Animation
        isExiting ? 'animate-toast-exit' : 'animate-toast-enter',
        // Transition
        'transition-all duration-300'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', styles.text)}>
          {toast.message}
        </p>

        {/* Action button */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-xs font-semibold underline underline-offset-2',
              'hover:opacity-80 transition-opacity',
              styles.icon
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-md',
          'text-slate-400 hover:text-slate-200',
          'hover:bg-slate-700/50',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50'
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar (optional visual for duration) */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
          <div
            className={cn('h-full', styles.icon.replace('text-', 'bg-'))}
            style={{
              animation: `toastProgress ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Toast;
