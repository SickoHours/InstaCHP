'use client';

/**
 * AutoCheckSetupFlow - Inline setup flow for auto-checker configuration
 *
 * Desktop-optimized component that appears when user selects "Set Up Auto Checker"
 * from the FacePageCompletionChoice. Allows user to select frequency:
 * - Daily: 4:30 PM PT
 * - Twice Daily: 9:00 AM and 4:30 PM PT
 *
 * Fixed times only - no custom time picker.
 */

import { useState } from 'react';
import { ArrowLeft, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoCheckSetupFlowProps {
  onSave: (frequency: 'daily' | 'twice_daily') => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function AutoCheckSetupFlow({
  onSave,
  onCancel,
  disabled = false,
}: AutoCheckSetupFlowProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'twice_daily'>('daily');

  const handleSave = () => {
    onSave(selectedFrequency);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 text-sm text-slate-400',
            'transition-colors duration-200',
            'hover:text-slate-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Title and description */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Set Up Auto Checker
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Choose how often we check for your full report
        </p>
      </div>

      {/* Frequency selection - side by side buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily option */}
        <button
          onClick={() => setSelectedFrequency('daily')}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-3 p-5 rounded-xl text-center',
            'border transition-all duration-300',
            'hover:scale-[1.02] active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            selectedFrequency === 'daily'
              ? 'bg-teal-500/15 border-teal-500/40 shadow-lg shadow-teal-500/10'
              : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
          )}
        >
          {/* Selection indicator */}
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              'transition-all duration-200',
              selectedFrequency === 'daily'
                ? 'border-teal-400 bg-teal-400'
                : 'border-slate-500'
            )}
          >
            {selectedFrequency === 'daily' && (
              <Check className="w-3 h-3 text-slate-900" />
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-base font-semibold',
              selectedFrequency === 'daily' ? 'text-teal-300' : 'text-slate-300'
            )}
          >
            Daily
          </span>

          {/* Time badge */}
          <div
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm',
              selectedFrequency === 'daily'
                ? 'bg-teal-500/20 text-teal-300'
                : 'bg-slate-700/50 text-slate-400'
            )}
          >
            4:30 PM PT
          </div>
        </button>

        {/* Twice Daily option */}
        <button
          onClick={() => setSelectedFrequency('twice_daily')}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-3 p-5 rounded-xl text-center',
            'border transition-all duration-300',
            'hover:scale-[1.02] active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            selectedFrequency === 'twice_daily'
              ? 'bg-teal-500/15 border-teal-500/40 shadow-lg shadow-teal-500/10'
              : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
          )}
        >
          {/* Selection indicator */}
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              'transition-all duration-200',
              selectedFrequency === 'twice_daily'
                ? 'border-teal-400 bg-teal-400'
                : 'border-slate-500'
            )}
          >
            {selectedFrequency === 'twice_daily' && (
              <Check className="w-3 h-3 text-slate-900" />
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-base font-semibold',
              selectedFrequency === 'twice_daily' ? 'text-teal-300' : 'text-slate-300'
            )}
          >
            Twice Daily
          </span>

          {/* Time badges */}
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                'px-3 py-1 rounded-lg text-sm',
                selectedFrequency === 'twice_daily'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-slate-700/50 text-slate-400'
              )}
            >
              9:00 AM PT
            </div>
            <div
              className={cn(
                'px-3 py-1 rounded-lg text-sm',
                selectedFrequency === 'twice_daily'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-slate-700/50 text-slate-400'
              )}
            >
              4:30 PM PT
            </div>
          </div>
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl',
          'bg-gradient-to-r from-teal-600 to-cyan-600',
          'text-white font-semibold',
          'border border-teal-500/30',
          'transition-all duration-300',
          'hover:from-teal-500 hover:to-cyan-500',
          'hover:shadow-lg hover:shadow-teal-500/20',
          'hover:scale-[1.01]',
          'active:scale-[0.99]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Check className="w-5 h-5" />
        Save Settings
      </button>

      {/* V1 Mock Notice */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-400">
          <strong>V1 Demo:</strong> Schedule settings are saved but actual automated
          checks will be enabled in V2 with the Convex backend.
        </p>
      </div>
    </div>
  );
}
