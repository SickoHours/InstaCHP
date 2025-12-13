'use client';

import { forwardRef } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  AlertCircle,
  Send,
  XCircle,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { EventType } from '@/lib/types';

interface TimelineMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Event type determines the icon */
  eventType: EventType;
  /** Message text to display */
  message: string;
  /** Timestamp for relative time display */
  timestamp: number;
  /** Animation delay in ms for staggered entrance */
  animationDelay?: number;
  /** Whether this is the latest/most recent event */
  isLatest?: boolean;
  /** Interactive content (buttons, forms) to embed in message bubble */
  children?: React.ReactNode;
  /** Whether this message contains interactive elements */
  isInteractive?: boolean;
}

/**
 * Icon mapping for different event types
 */
const EVENT_ICONS: Record<EventType, React.ComponentType<{ className?: string }>> = {
  job_created: Send,
  status_change: Clock,
  page1_updated: FileText,
  page2_updated: FileText,
  wrapper_triggered: Sparkles,
  wrapper_completed: CheckCircle2,
  file_uploaded: FileText,
  check_requested: RefreshCw,
  escalated: AlertCircle,
  completed: CheckCircle2,
  message: MessageCircle,
  // V1.0.5+ Interactive prompts
  driver_passenger_prompt: MessageCircle,
  driver_selected: CheckCircle2,
  passenger_selected: CheckCircle2,
  passenger_data_provided: CheckCircle2,
  chp_nudge_shown: MessageCircle,
  // V1.0.6+ Enhanced flows
  page1_details_request: MessageCircle,
  auto_wrapper_triggered: Sparkles,
  auto_wrapper_success: CheckCircle2,
  auto_wrapper_failed: XCircle,
  // V1.1.0+ Flow wizard events
  flow_speedup_prompt: Zap,
  flow_speedup_yes: CheckCircle2,
  flow_speedup_no: ArrowRight,
  flow_crash_details_saved: FileText,
  flow_verification_saved: UserCheck,
  flow_completed: Sparkles,
  // V1.2.0+ Rescue flow events
  page1_not_found: AlertCircle,
  page2_verification_needed: AlertCircle,
  rescue_info_saved: CheckCircle2,
  rescue_wrapper_triggered: Sparkles,
  // V1.3.0+ Decline tracking events
  driver_speedup_declined: ArrowRight,
  driver_speedup_reopened: Zap,
  passenger_helper_declined: ArrowRight,
  passenger_helper_reopened: UserCheck,
  // V1.4.0+ Auto-checker events (law firm)
  auto_check_started: RefreshCw,
  auto_check_found: CheckCircle2,
  auto_check_not_found: Clock,
  auto_check_settings_updated: Clock,
};

/**
 * Color classes for different event types (for the icon glow)
 */
const EVENT_COLORS: Record<EventType, string> = {
  job_created: 'text-slate-400',
  status_change: 'text-cyan-400',
  page1_updated: 'text-blue-400',
  page2_updated: 'text-blue-400',
  wrapper_triggered: 'text-purple-400',
  wrapper_completed: 'text-emerald-400',
  file_uploaded: 'text-teal-400',
  check_requested: 'text-violet-400',
  escalated: 'text-amber-400',
  completed: 'text-emerald-400',
  message: 'text-slate-400',
  // V1.0.5+ Interactive prompts
  driver_passenger_prompt: 'text-teal-400',
  driver_selected: 'text-emerald-400',
  passenger_selected: 'text-emerald-400',
  passenger_data_provided: 'text-cyan-400',
  chp_nudge_shown: 'text-cyan-400',
  // V1.0.6+ Enhanced flows
  page1_details_request: 'text-teal-400',
  auto_wrapper_triggered: 'text-purple-400',
  auto_wrapper_success: 'text-emerald-400',
  auto_wrapper_failed: 'text-red-400',
  // V1.1.0+ Flow wizard events
  flow_speedup_prompt: 'text-amber-400',
  flow_speedup_yes: 'text-emerald-400',
  flow_speedup_no: 'text-slate-400',
  flow_crash_details_saved: 'text-cyan-400',
  flow_verification_saved: 'text-cyan-400',
  flow_completed: 'text-emerald-400',
  // V1.2.0+ Rescue flow events
  page1_not_found: 'text-amber-400',
  page2_verification_needed: 'text-amber-400',
  rescue_info_saved: 'text-emerald-400',
  rescue_wrapper_triggered: 'text-purple-400',
  // V1.3.0+ Decline tracking events
  driver_speedup_declined: 'text-slate-400',
  driver_speedup_reopened: 'text-amber-400',
  passenger_helper_declined: 'text-slate-400',
  passenger_helper_reopened: 'text-cyan-400',
  // V1.4.0+ Auto-checker events (law firm)
  auto_check_started: 'text-teal-400',
  auto_check_found: 'text-emerald-400',
  auto_check_not_found: 'text-slate-400',
  auto_check_settings_updated: 'text-slate-400',
};

const TimelineMessage = forwardRef<HTMLDivElement, TimelineMessageProps>(
  (
    {
      className,
      eventType,
      message,
      timestamp,
      animationDelay = 0,
      isLatest = false,
      children,
      isInteractive = false,
      style,
      ...props
    },
    ref
  ) => {
    const Icon = EVENT_ICONS[eventType] || MessageCircle;
    const iconColor = EVENT_COLORS[eventType] || 'text-slate-400';

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex gap-4',
          'animate-message-cascade',
          className
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
          ...style,
        }}
        {...props}
      >
        {/* Timeline Node */}
        <div className="relative flex flex-col items-center">
          {/* Icon container with glow */}
          <div
            className={cn(
              'relative z-10 flex items-center justify-center',
              'w-10 h-10 rounded-full',
              'bg-slate-800/80 border border-slate-700/50',
              'shadow-lg',
              isLatest && 'animate-dot-pulse',
              iconColor
            )}
          >
            <Icon className="w-5 h-5" />

            {/* Glow effect behind icon */}
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-md opacity-30',
                eventType === 'completed' && 'bg-emerald-500',
                eventType === 'file_uploaded' && 'bg-teal-500',
                eventType === 'status_change' && 'bg-cyan-500',
                eventType === 'job_created' && 'bg-slate-500',
                eventType === 'escalated' && 'bg-amber-500',
                eventType === 'check_requested' && 'bg-violet-500',
              )}
            />
          </div>

          {/* Vertical connector line (hidden for last item) */}
          <div
            className={cn(
              'absolute top-10 w-0.5 h-full',
              'bg-gradient-to-b from-slate-700/50 to-transparent',
              isLatest && 'hidden'
            )}
          />
        </div>

        {/* Message Content */}
        <div className="flex-1 pb-8">
          {/* Glass card message bubble */}
          <div
            className={cn(
              'glass-card-dark rounded-2xl p-4',
              'transform transition-all duration-300',
              // Disable hover effects for interactive messages
              !isInteractive && 'hover:scale-[1.01] hover:border-slate-600/50',
              isLatest && 'border-teal-500/30 animate-subtle-glow'
            )}
          >
            {/* Message text */}
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {message}
            </p>

            {/* Interactive content (buttons, forms, etc.) */}
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}

            {/* Timestamp */}
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

TimelineMessage.displayName = 'TimelineMessage';

export default TimelineMessage;
