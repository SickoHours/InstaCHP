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
  escalated: AlertCircle,
  completed: CheckCircle2,
  message: MessageCircle,
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
  escalated: 'text-amber-400',
  completed: 'text-emerald-400',
  message: 'text-slate-400',
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
              'hover:scale-[1.01] hover:border-slate-600/50',
              isLatest && 'border-teal-500/30 animate-subtle-glow'
            )}
          >
            {/* Message text */}
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {message}
            </p>

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
