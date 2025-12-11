'use client';

import { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, FileX, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type ErrorVariant = 'default' | 'network' | 'notFound' | 'server';

interface ErrorStateProps {
  /** Type of error to display */
  variant?: ErrorVariant;
  /** Custom title (overrides variant default) */
  title?: string;
  /** Custom message (overrides variant default) */
  message?: string;
  /** Action button handler */
  onRetry?: () => void;
  /** Custom action button text */
  retryLabel?: string;
  /** Additional class names */
  className?: string;
  /** Children for custom content */
  children?: ReactNode;
  /** Whether the component is compact */
  compact?: boolean;
}

// ============================================
// VARIANT CONFIGS
// ============================================

const VARIANT_CONFIG: Record<ErrorVariant, {
  icon: typeof AlertTriangle;
  title: string;
  message: string;
  iconColor: string;
}> = {
  default: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    iconColor: 'text-amber-400',
  },
  network: {
    icon: WifiOff,
    title: 'Connection lost',
    message: "We couldn't connect to the server. Check your internet connection and try again.",
    iconColor: 'text-red-400',
  },
  notFound: {
    icon: FileX,
    title: 'Not found',
    message: "The content you're looking for doesn't exist or has been moved.",
    iconColor: 'text-slate-400',
  },
  server: {
    icon: ServerCrash,
    title: 'Server error',
    message: "We're experiencing technical difficulties. Please try again later.",
    iconColor: 'text-red-400',
  },
};

// ============================================
// COMPONENT
// ============================================

export function ErrorState({
  variant = 'default',
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
  children,
  compact = false,
}: ErrorStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        'glass-card-dark rounded-2xl',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full mb-4',
          compact ? 'w-12 h-12' : 'w-16 h-16',
          'bg-slate-800/50'
        )}
      >
        <Icon
          className={cn(
            config.iconColor,
            compact ? 'w-6 h-6' : 'w-8 h-8'
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-slate-200 mb-2',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title || config.title}
      </h3>

      {/* Message */}
      <p
        className={cn(
          'text-slate-400 max-w-sm',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        {message || config.message}
      </p>

      {/* Custom content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'mt-6 inline-flex items-center gap-2',
            'px-4 py-2 rounded-lg',
            'bg-teal-600 hover:bg-teal-500',
            'text-white font-medium',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900',
            compact && 'text-sm'
          )}
        >
          <RefreshCw className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export function NetworkError(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState variant="network" {...props} />;
}

export function NotFoundError(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState variant="notFound" {...props} />;
}

export function ServerError(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState variant="server" {...props} />;
}

export default ErrorState;
