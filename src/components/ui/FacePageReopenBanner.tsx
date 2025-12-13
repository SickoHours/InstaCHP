'use client';

/**
 * FacePageReopenBanner - Compact CTA for reopening face-page-completed jobs (V1.6.0)
 *
 * Shows when job is in COMPLETED_FACE_PAGE_ONLY status.
 * Allows law firm to check if full report is now available.
 */

import { RefreshCw, FileSearch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FacePageReopenBannerProps {
  onCheckNow: () => Promise<void>;
  lastChecked?: number;
  disabled?: boolean;
}

export default function FacePageReopenBanner({
  onCheckNow,
  lastChecked,
  disabled = false,
}: FacePageReopenBannerProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      await onCheckNow();
    } finally {
      setIsChecking(false);
    }
  };

  // Format relative time for last checked
  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-xl',
        'bg-gradient-to-br from-slate-700/50 to-slate-800/50',
        'border border-slate-600/30',
        'backdrop-blur-sm'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <FileSearch className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <span className="text-slate-200 text-sm font-medium block">
            Still need the full report?
          </span>
          {lastChecked && (
            <span className="text-slate-500 text-xs">
              Last checked {getRelativeTime(lastChecked)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={disabled || isChecking}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-gradient-to-r from-blue-600 to-cyan-600',
          'text-white text-sm font-medium',
          'transition-all duration-200',
          'hover:from-blue-500 hover:to-cyan-500',
          'hover:shadow-lg hover:shadow-blue-500/25',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Mobile touch target
          'min-h-[44px] min-w-[100px]'
        )}
      >
        {isChecking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Check Now</span>
          </>
        )}
      </button>
    </div>
  );
}
