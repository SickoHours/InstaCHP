'use client';

import { AlertTriangle, Clock, Lock, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SafetyBlockCode } from '@/lib/wrapperClient';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WrapperSafetyBannerProps {
  /**
   * Whether a safety block is currently active
   */
  isActive: boolean;

  /**
   * The type of safety block (determines messaging)
   */
  safetyBlockCode: SafetyBlockCode | null;

  /**
   * Seconds remaining until retry is allowed
   */
  countdown: number;

  /**
   * Optional: Last run ID for debugging
   */
  lastRunId?: string | null;

  /**
   * Optional: Additional CSS classes
   */
  className?: string;

  /**
   * Variant: 'inline' (within a card) or 'standalone' (full-width banner)
   * @default 'inline'
   */
  variant?: 'inline' | 'standalone';
}

// ============================================
// SAFETY BLOCK CONFIGURATIONS
// ============================================

interface SafetyBlockConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  extendedDescription: string;
}

/**
 * Consistent messaging for each safety block type
 * These are NOT errors - they're protective rate limits
 */
const SAFETY_BLOCK_CONFIG: Record<SafetyBlockCode, SafetyBlockConfig> = {
  RATE_LIMIT_ACTIVE: {
    icon: Zap,
    title: 'Rate Limit Active',
    description: 'CHP portal is receiving too many requests.',
    extendedDescription:
      "We're temporarily pausing to avoid overloading the CHP portal. This protects your access.",
  },
  RUN_LOCK_ACTIVE: {
    icon: Lock,
    title: 'Run in Progress',
    description: 'Another wrapper run is currently executing.',
    extendedDescription:
      'Only one run can execute at a time to ensure portal stability. Please wait.',
  },
  COOLDOWN_ACTIVE: {
    icon: Clock,
    title: 'Cooldown Active',
    description: 'Wrapper is cooling down after recent run.',
    extendedDescription:
      'A brief pause between runs helps maintain reliable CHP portal access.',
  },
  CIRCUIT_BREAKER_ACTIVE: {
    icon: AlertTriangle,
    title: 'Circuit Breaker',
    description: 'CHP portal temporarily unavailable.',
    extendedDescription:
      'Multiple errors detected. Circuit breaker triggered to prevent cascading failures.',
  },
};

/**
 * Fallback configuration for unknown safety block codes
 * Used when the API returns a code not in our known list
 */
const FALLBACK_CONFIG: SafetyBlockConfig = {
  icon: AlertTriangle,
  title: 'Safety Block Active',
  description: 'A temporary block is in effect.',
  extendedDescription:
    'Please wait a moment before trying again.',
};

// ============================================
// COMPONENT
// ============================================

/**
 * WrapperSafetyBanner - Universal safety-awareness component
 *
 * Displays a consistent amber banner when wrapper safety blocks are active.
 * Used across staff and (future) law-firm screens to show:
 * - The type of safety block
 * - Countdown until retry is available
 * - Clear messaging that this is NOT an error
 *
 * @example
 * ```tsx
 * <WrapperSafetyBanner
 *   isActive={safetyBlockActive}
 *   safetyBlockCode={safetyBlockCode}
 *   countdown={safetyBlockCountdown}
 * />
 * ```
 */
export function WrapperSafetyBanner({
  isActive,
  safetyBlockCode,
  countdown,
  lastRunId,
  className,
  variant = 'inline',
}: WrapperSafetyBannerProps) {
  // Don't render if not active
  if (!isActive || !safetyBlockCode) {
    return null;
  }

  // Use fallback config for unknown safety block codes
  const config = SAFETY_BLOCK_CONFIG[safetyBlockCode] ?? FALLBACK_CONFIG;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg animate-slide-up',
        'bg-amber-500/10 border border-amber-500/20',
        variant === 'standalone' && 'p-4',
        variant === 'inline' && 'mt-3 p-3',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Header Row */}
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-sm font-medium text-amber-400">{config.title}</span>
        {countdown > 0 && (
          <span className="ml-auto text-xs font-mono text-amber-400/80 bg-amber-500/20 px-2 py-0.5 rounded">
            {countdown}s
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-amber-400/80 mb-2">{config.description}</p>

      {/* Retry Countdown */}
      {countdown > 0 && (
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3 h-3 text-amber-400/60" />
          <span className="text-xs text-amber-400/70">
            Retry available in {countdown} second{countdown !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* This is NOT an error notice */}
      <p className="text-xs text-amber-400/60 mt-2 italic">
        This is not an error – just a protective pause.
      </p>

      {/* Debug info (optional) */}
      {lastRunId && (
        <div className="mt-2 pt-2 border-t border-amber-500/20">
          <span className="text-xs text-amber-400/50">
            Run ID: <code className="font-mono">{lastRunId}</code>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * WrapperSafetyStatus - Compact status indicator for wrapper state
 *
 * A smaller, inline component that shows current safety state.
 * Useful for header bars or status displays.
 */
export function WrapperSafetyStatus({
  safetyBlockCode,
  countdown,
  className,
}: {
  safetyBlockCode: SafetyBlockCode | null;
  countdown: number;
  className?: string;
}) {
  if (!safetyBlockCode || countdown <= 0) {
    return null;
  }

  // Use fallback config for unknown safety block codes
  const config = SAFETY_BLOCK_CONFIG[safetyBlockCode] ?? FALLBACK_CONFIG;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-md',
        'bg-amber-500/15 border border-amber-500/25',
        'text-xs text-amber-400',
        className
      )}
    >
      <IconComponent className="w-3 h-3" />
      <span className="font-medium">{config.title}</span>
      <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">{countdown}s</span>
    </div>
  );
}

export default WrapperSafetyBanner;

