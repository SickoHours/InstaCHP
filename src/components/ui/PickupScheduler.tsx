'use client';

/**
 * PickupScheduler - Staff pickup time selection (V1.6.0)
 *
 * Quick buttons for scheduling manual pickup time:
 * - Around 9:00 AM
 * - Around Afternoon
 * - Around 4:00 PM
 * - Next business day option
 *
 * Monday-Friday only (government building, closed holidays)
 */

import { useState } from 'react';
import { Clock, Calendar, Download, CheckCircle2, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PickupTimeSlot } from '@/lib/types';

interface PickupSchedulerProps {
  onClaim: () => Promise<void>;
  onSchedule: (time: PickupTimeSlot, date: string) => Promise<void>;
  onDownloadAuth: () => void;
  claimed?: boolean;
  claimedBy?: string;
  scheduledTime?: PickupTimeSlot;
  scheduledDate?: string;
  hasAuthDocument?: boolean;
  disabled?: boolean;
}

const TIME_SLOTS: { value: PickupTimeSlot; label: string; subLabel: string }[] = [
  { value: '9am', label: '9:00 AM', subLabel: 'Morning' },
  { value: 'afternoon', label: '12:00 PM', subLabel: 'Afternoon' },
  { value: '4pm', label: '4:00 PM', subLabel: 'End of day' },
];

/**
 * Get next business day (Mon-Fri)
 */
function getNextBusinessDay(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + 1);

  // Skip weekends
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

/**
 * Format date for display
 */
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function PickupScheduler({
  onClaim,
  onSchedule,
  onDownloadAuth,
  claimed = false,
  claimedBy,
  scheduledTime,
  scheduledDate,
  hasAuthDocument = false,
  disabled = false,
}: PickupSchedulerProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedTime, setSelectedTime] = useState<PickupTimeSlot | null>(scheduledTime || null);
  const [selectedDate, setSelectedDate] = useState<string>(
    scheduledDate || new Date().toISOString().split('T')[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const nextBusinessDay = getNextBusinessDay().toISOString().split('T')[0];

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      await onClaim();
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedTime || isScheduling) return;
    setIsScheduling(true);
    try {
      await onSchedule(selectedTime, selectedDate);
    } finally {
      setIsScheduling(false);
    }
  };

  // Not claimed yet - show claim button
  if (!claimed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <User className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-slate-200 font-medium">Manual Pickup Required</h3>
            <p className="text-sm text-slate-500">Claim this pickup to proceed</p>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={disabled || isClaiming}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-4 rounded-xl',
            'bg-gradient-to-r from-orange-600 to-amber-600',
            'text-white font-medium',
            'transition-all duration-200',
            'hover:from-orange-500 hover:to-amber-500',
            'hover:shadow-lg hover:shadow-orange-500/25',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          {isClaiming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Claiming...</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5" />
              <span>Claim This Pickup</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Claimed - show scheduling UI
  return (
    <div className="space-y-4">
      {/* Claimed Badge */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-emerald-300 text-sm font-medium">
            Pickup claimed{claimedBy ? ` by ${claimedBy}` : ''}
          </p>
          {scheduledTime && scheduledDate && (
            <p className="text-emerald-400/70 text-xs">
              Scheduled: {formatDateDisplay(scheduledDate)} around {
                TIME_SLOTS.find(t => t.value === scheduledTime)?.label || scheduledTime
              }
            </p>
          )}
        </div>
      </div>

      {/* Time Selection */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
          When can you go?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.value}
              onClick={() => setSelectedTime(slot.value)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg',
                'border transition-all duration-200',
                selectedTime === slot.value
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                  : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50'
              )}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{slot.label}</span>
              <span className="text-xs opacity-70">{slot.subLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
          Date
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDate(today)}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg',
              'border transition-all duration-200',
              selectedDate === today
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50'
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Today</span>
          </button>
          <button
            onClick={() => setSelectedDate(nextBusinessDay)}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg',
              'border transition-all duration-200',
              selectedDate === nextBusinessDay
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50'
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Next Business Day</span>
          </button>
        </div>
        {/* Custom date option */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="mt-2 text-xs text-slate-500 hover:text-slate-400"
        >
          {showDatePicker ? 'Hide custom date' : 'Pick a different date'}
        </button>
        {showDatePicker && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className={cn(
              'mt-2 w-full p-3 rounded-lg',
              'bg-slate-800/50 border border-slate-700/50',
              'text-slate-200 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-amber-400/50'
            )}
          />
        )}
        <p className="text-xs text-slate-500 mt-2">
          Mon-Fri only (government building)
        </p>
      </div>

      {/* Download Authorization */}
      {hasAuthDocument && (
        <button
          onClick={onDownloadAuth}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-3 rounded-lg',
            'bg-slate-700/50 border border-slate-600/50',
            'text-slate-300 text-sm font-medium',
            'transition-all duration-200',
            'hover:bg-slate-700/70 hover:border-slate-500/50',
            'active:scale-[0.98]'
          )}
        >
          <Download className="w-4 h-4" />
          <span>Download Authorization Document</span>
        </button>
      )}

      {/* Confirm Schedule Button */}
      {selectedTime && (
        <button
          onClick={handleSchedule}
          disabled={disabled || isScheduling}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-4 rounded-xl',
            'bg-gradient-to-r from-amber-500 to-cyan-600',
            'text-white font-medium',
            'transition-all duration-200',
            'hover:from-amber-400 hover:to-cyan-500',
            'hover:shadow-lg hover:shadow-amber-400/25',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          {isScheduling ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scheduling...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Schedule</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
