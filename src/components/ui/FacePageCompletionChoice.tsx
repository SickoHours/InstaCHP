'use client';

/**
 * FacePageCompletionChoice - Choice UI when face page is received (V1.6.0)
 *
 * Presents law firm with two options:
 * 1. Complete now with just the face page
 * 2. Set up auto-checker (configure when to check for full report)
 *
 * Theme-aware styling for light/dark modes.
 */

import { CheckCircle2, Settings, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface FacePageCompletionChoiceProps {
  onSelect: (choice: 'complete' | 'wait') => void;
  disabled?: boolean;
  clientName?: string;
}

export default function FacePageCompletionChoice({
  onSelect,
  disabled = false,
  clientName,
}: FacePageCompletionChoiceProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
          <FileText className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className={cn(
            'text-lg font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Your face page is ready!
          </h3>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            {clientName ? `For ${clientName}` : 'A preliminary copy is available'}
          </p>
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col gap-3">
        {/* Option A: Complete with face page */}
        <button
          onClick={() => onSelect('complete')}
          disabled={disabled}
          className={cn(
            'flex items-start gap-4 p-4 rounded-xl text-left',
            'bg-gradient-to-br from-emerald-600/20 to-green-600/20',
            'border border-emerald-500/30',
            'transition-all duration-300',
            'hover:from-emerald-600/30 hover:to-green-600/30',
            'hover:border-emerald-500/50',
            'hover:scale-[1.01]',
            'active:scale-[0.99]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[72px]'
          )}
        >
          <div className="p-2 rounded-lg bg-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1">
            <span className={cn(
              'font-medium block',
              isDark ? 'text-emerald-200' : 'text-emerald-700'
            )}>
              This is all I need
            </span>
            <span className={cn(
              'text-sm block mt-1',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Complete your request now and download the face page
            </span>
          </div>
          <Download className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
        </button>

        {/* Option B: Set up auto-checker */}
        <button
          onClick={() => onSelect('wait')}
          disabled={disabled}
          className={cn(
            'flex items-start gap-4 p-4 rounded-xl text-left',
            'bg-gradient-to-br from-blue-600/20 to-cyan-600/20',
            'border border-blue-500/30',
            'transition-all duration-300',
            'hover:from-blue-600/30 hover:to-cyan-600/30',
            'hover:border-blue-500/50',
            'hover:scale-[1.01]',
            'active:scale-[0.99]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[72px]'
          )}
        >
          <div className="p-2 rounded-lg bg-blue-500/30 shrink-0">
            <Settings className="w-5 h-5 text-blue-300" />
          </div>
          <div className="flex-1">
            <span className={cn(
              'font-medium block',
              isDark ? 'text-blue-200' : 'text-blue-700'
            )}>
              Set Up Auto Checker
            </span>
            <span className={cn(
              'text-sm block mt-1',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Configure when we check for the full report
            </span>
          </div>
        </button>
      </div>

      {/* Helper text */}
      <p className={cn(
        'text-xs text-center mt-2',
        isDark ? 'text-slate-500' : 'text-slate-600'
      )}>
        You can change your mind later if needed
      </p>
    </div>
  );
}
