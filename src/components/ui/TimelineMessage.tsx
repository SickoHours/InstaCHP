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
import { useTheme } from '@/context/ThemeContext';

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
  // V1.6.0+ Face page completion events
  face_page_complete_chosen: CheckCircle2,
  face_page_wait_chosen: Clock,
  face_page_reopened: RefreshCw,
  // V1.6.0+ Escalation workflow events
  escalation_auto_triggered: AlertCircle,
  escalation_manual_triggered: AlertCircle,
  escalation_fatal_triggered: AlertCircle,
  authorization_requested: FileText,
  authorization_uploaded: CheckCircle2,
  pickup_claimed: UserCheck,
  pickup_scheduled: Clock,
  pickup_completed: CheckCircle2,
  // V1.6.0+ Fatal report events
  fatal_report_created: AlertCircle,
  death_certificate_uploaded: FileText,
  // V2.5.0+ Fast Form events
  fast_form_submitted: Send,
  fast_form_success: CheckCircle2,
  fast_form_failed: XCircle,
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
  file_uploaded: 'text-amber-400',
  check_requested: 'text-violet-400',
  escalated: 'text-amber-400',
  completed: 'text-emerald-400',
  message: 'text-slate-400',
  // V1.0.5+ Interactive prompts
  driver_passenger_prompt: 'text-amber-400',
  driver_selected: 'text-emerald-400',
  passenger_selected: 'text-emerald-400',
  passenger_data_provided: 'text-cyan-400',
  chp_nudge_shown: 'text-cyan-400',
  // V1.0.6+ Enhanced flows
  page1_details_request: 'text-amber-400',
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
  auto_check_started: 'text-amber-400',
  auto_check_found: 'text-emerald-400',
  auto_check_not_found: 'text-slate-400',
  auto_check_settings_updated: 'text-slate-400',
  // V1.6.0+ Face page completion events
  face_page_complete_chosen: 'text-emerald-400',
  face_page_wait_chosen: 'text-blue-400',
  face_page_reopened: 'text-amber-400',
  // V1.6.0+ Escalation workflow events
  escalation_auto_triggered: 'text-amber-400',
  escalation_manual_triggered: 'text-amber-400',
  escalation_fatal_triggered: 'text-red-400',
  authorization_requested: 'text-amber-400',
  authorization_uploaded: 'text-emerald-400',
  pickup_claimed: 'text-blue-400',
  pickup_scheduled: 'text-cyan-400',
  pickup_completed: 'text-emerald-400',
  // V1.6.0+ Fatal report events
  fatal_report_created: 'text-red-400',
  death_certificate_uploaded: 'text-emerald-400',
  // V2.5.0+ Fast Form events
  fast_form_submitted: 'text-blue-400',
  fast_form_success: 'text-emerald-400',
  fast_form_failed: 'text-red-400',
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
    const { theme } = useTheme();
    const isDark = theme === 'dark';
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
        <div className="relative flex flex-col items-center overflow-visible">
          {/* Icon container with glow via box-shadow */}
          <div
            className={cn(
              'relative z-10 flex items-center justify-center',
              'w-10 h-10 rounded-full p-1.5',
              isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200',
              'border shadow-lg',
              isLatest && 'animate-dot-pulse',
              iconColor
            )}
            style={{
              boxShadow: (() => {
                const glowColors: Record<string, string> = {
                  completed: '0 0 12px rgba(16, 185, 129, 0.4), 0 0 24px rgba(16, 185, 129, 0.2)',
                  file_uploaded: '0 0 12px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.2)',
                  status_change: '0 0 12px rgba(34, 211, 238, 0.4), 0 0 24px rgba(34, 211, 238, 0.2)',
                  job_created: '0 0 12px rgba(148, 163, 184, 0.4), 0 0 24px rgba(148, 163, 184, 0.2)',
                  escalated: '0 0 12px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.2)',
                  check_requested: '0 0 12px rgba(139, 92, 246, 0.4), 0 0 24px rgba(139, 92, 246, 0.2)',
                };
                return glowColors[eventType] || '';
              })(),
            }}
          >
            <Icon className="w-5 h-5 relative z-10 shrink-0" />
          </div>

          {/* Vertical connector line (hidden for last item) */}
          <div
            className={cn(
              'absolute top-10 w-0.5 h-full',
              'bg-gradient-to-b',
              isDark ? 'from-slate-700/50' : 'from-slate-300/50',
              'to-transparent',
              isLatest && 'hidden'
            )}
          />
        </div>

        {/* Message Content */}
        <div className="flex-1 pb-8">
          {/* Glass card message bubble */}
          <div
            className={cn(
              isDark ? 'glass-card-dark' : 'bg-white border-slate-200',
              'rounded-2xl p-4 border',
              'transform transition-all duration-300',
              // Disable hover effects for interactive messages
              !isInteractive && (isDark ? 'hover:border-slate-600/50' : 'hover:border-slate-300'),
              !isInteractive && 'hover:scale-[1.01]',
              isLatest && 'border-amber-400/30 animate-subtle-glow'
            )}
          >
            {/* Message text */}
            <p className={cn(
              'text-sm md:text-base leading-relaxed',
              isDark ? 'text-slate-200' : 'text-slate-700'
            )}>
              {message}
            </p>

            {/* Interactive content (buttons, forms, etc.) */}
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}

            {/* Timestamp */}
            <p className={cn(
              'mt-2 text-xs flex items-center gap-1.5',
              isDark ? 'text-slate-500' : 'text-slate-600'
            )}>
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
