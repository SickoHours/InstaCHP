'use client';

/**
 * @deprecated Replaced by InlineFieldsCard as of V1.0.7
 * Kept for reference only. Do not use in new code.
 *
 * Page1DataCard - Editable crash details card for law firm view
 *
 * Displays crash date, crash time, and officer ID with edit functionality.
 * Used in law firm job detail to collect/display Page 1 data.
 * Auto-triggers wrapper on save if prerequisites met.
 */

import { useState } from 'react';
import { Calendar, Clock, Shield, Edit, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page1Data {
  crashDate: string;
  crashTime: string;
  officerId: string;
}

interface Page1DataCardProps {
  crashDate: string;
  crashTime: string;
  officerId: string;
  onSave: (data: Page1Data) => void | Promise<void>;
  disabled?: boolean;
}

export default function Page1DataCard({
  crashDate: initialCrashDate,
  crashTime: initialCrashTime,
  officerId: initialOfficerId,
  onSave,
  disabled = false,
}: Page1DataCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Page1Data>({
    crashDate: initialCrashDate,
    crashTime: initialCrashTime,
    officerId: initialOfficerId,
  });

  const hasData = !!(initialCrashDate || initialCrashTime || initialOfficerId);

  const handleEdit = () => {
    setFormData({
      crashDate: initialCrashDate,
      crashTime: initialCrashTime,
      officerId: initialOfficerId,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      crashDate: initialCrashDate,
      crashTime: initialCrashTime,
      officerId: initialOfficerId,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="glass-card-dark rounded-lg p-4 border border-cyan-500/20 animate-text-reveal">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-cyan-300">Crash Details (Page 1)</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md',
              'text-xs font-medium',
              hasData
                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Edit className="w-3 h-3" />
            <span>{hasData ? 'Edit' : 'Add Details'}</span>
          </button>
        )}
      </div>

      {/* Display Mode */}
      {!isEditing && hasData && (
        <div className="space-y-2">
          {initialCrashDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Crash Date:</span>
              <span className="text-slate-200">{initialCrashDate}</span>
            </div>
          )}
          {initialCrashTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Crash Time:</span>
              <span className="text-slate-200">{initialCrashTime}</span>
            </div>
          )}
          {initialOfficerId && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Officer Badge:</span>
              <span className="text-slate-200 font-mono">{initialOfficerId}</span>
            </div>
          )}
        </div>
      )}

      {/* Display Mode - Empty State */}
      {!isEditing && !hasData && (
        <p className="text-xs text-slate-500">
          No crash details yet. Click &quot;Add Details&quot; to provide information.
        </p>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-3">
          {/* Crash Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Date
            </label>
            <input
              type="date"
              value={formData.crashDate}
              onChange={(e) => setFormData({ ...formData, crashDate: e.target.value })}
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Crash Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Crash Time
            </label>
            <input
              type="time"
              value={formData.crashTime}
              onChange={(e) => setFormData({ ...formData, crashTime: e.target.value })}
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Officer Badge */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Officer Badge Number
            </label>
            <input
              type="text"
              value={formData.officerId}
              onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
              placeholder="e.g., 012345"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={disabled}
              className={cn(
                'flex-1 h-9 rounded-lg font-medium text-sm',
                'bg-amber-500 text-white hover:bg-amber-400',
                'flex items-center justify-center gap-1.5',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={disabled}
              className={cn(
                'flex-1 h-9 rounded-lg font-medium text-sm',
                'bg-slate-700 text-slate-300 hover:bg-slate-600',
                'flex items-center justify-center gap-1.5',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
