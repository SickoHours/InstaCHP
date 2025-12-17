'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import {
  Phone,
  Bot,
  FileText,
  Download,
  Sparkles,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  History,
  Lock,
  Unlock,
  AlertTriangle,
  Upload,
  ChevronDown,
  ChevronRight,
  Loader2,
  Info,
  Calendar,
  User,
  Car,
  CreditCard,
  Hash,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getJobById, getUserFacingEvents, getJobEvents } from '@/lib/mockData';
import { useToast } from '@/context/ToastContext';
import {
  getPublicStatus,
  getStatusColor,
  getStatusMessage,
  formatPublicStatus,
  isCompletedStatus,
} from '@/lib/statusMapping';
import type { Job, WrapperRun, WrapperResult, InternalStatus } from '@/lib/types';
import TimelineMessage from '@/components/ui/TimelineMessage';
import TabBar from '@/components/ui/TabBar';
import PickupScheduler from '@/components/ui/PickupScheduler';
import { formatRelativeTime } from '@/lib/utils';
import { getDelay, DEV_MODE, simulateSafetyBlock } from '@/lib/devConfig';
import {
  runWrapper,
  isRetryableSafetyBlock,
  extractRetryAfterSeconds,
  getSafetyBlockMessage,
  isTrueWrapperError,
  runSafetyPreflight,
} from '@/lib/wrapperClient';
import type { WrapperErrorResponse, SafetyBlockCode } from '@/lib/wrapperClient';
import { WrapperSafetyBanner } from '@/components/ui/WrapperSafetyBanner';
import type { PickupTimeSlot, EscalationStatus } from '@/lib/types';
import {
  isFatalJob,
  isEscalatedJob,
  shouldShowWrapperUI,
  shouldShowManualCompletion,
  shouldShowAutoChecker,
  canResumeFromEscalated,
} from '@/lib/jobUIHelpers';
import { notificationManager } from '@/lib/notificationManager';

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function splitClientName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

function deriveNcic(reportNumber: string): string {
  return reportNumber.substring(0, 4);
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ============================================
// DARK STATUS BADGE (Public Status)
// ============================================

function DarkStatusBadge({
  internalStatus,
  showInternal = false,
}: {
  internalStatus: InternalStatus;
  showInternal?: boolean;
}) {
  const publicStatus = getPublicStatus(internalStatus);
  const color = getStatusColor(internalStatus);

  const glowColors: Record<string, string> = {
    gray: 'shadow-slate-500/20',
    blue: 'shadow-blue-500/30',
    yellow: 'shadow-yellow-500/30',
    green: 'shadow-emerald-500/30',
    amber: 'shadow-amber-500/30',
    red: 'shadow-red-500/30',
  };

  const bgColors: Record<string, string> = {
    gray: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
    blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    green: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    red: 'bg-red-500/20 text-red-200 border-red-500/30',
  };

  const isActive = ['blue', 'yellow'].includes(color);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'text-sm font-medium border',
        'transition-all duration-300',
        bgColors[color],
        glowColors[color],
        isActive && 'animate-glow-pulse'
      )}
    >
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {showInternal ? internalStatus.replace(/_/g, ' ') : formatPublicStatus(publicStatus)}
    </span>
  );
}

// ============================================
// WRAPPER RESULT BADGE
// ============================================

function WrapperResultBadge({ result }: { result: WrapperResult }) {
  const config: Record<WrapperResult, { color: string; label: string }> = {
    FULL: { color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30', label: 'Full Report' },
    FACE_PAGE: { color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30', label: 'Face Page' },
    PAGE1_NOT_FOUND: { color: 'bg-slate-500/20 text-slate-200 border-slate-500/30', label: 'Page 1 Not Found' },
    PAGE2_VERIFICATION_FAILED: { color: 'bg-amber-500/20 text-amber-200 border-amber-500/30', label: 'Verification Failed' },
    PORTAL_ERROR: { color: 'bg-red-500/20 text-red-200 border-red-500/30', label: 'Portal Error' },
  };

  const { color, label } = config[result];

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border', color)}>
      {label}
    </span>
  );
}

// ============================================
// STAFF CONTROL CARD WRAPPER
// ============================================

function StaffControlCard({
  title,
  icon: Icon,
  children,
  headerAction,
  animationDelay = 0,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  animationDelay?: number;
}) {
  return (
    <div
      className={cn(
        'glass-subtle p-5 animate-text-reveal',
        'transition-all duration-200',
        'hover-lift-subtle'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20">
              <Icon className="w-4 h-4 text-amber-400" />
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

// ============================================
// DARK INPUT COMPONENT
// ============================================

function DarkInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  readOnly = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-slate-500" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            'w-full h-12 md:h-10 rounded-lg border bg-slate-800/50 text-slate-200',
            'text-base md:text-sm',
            'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
            'placeholder:text-slate-500',
            'transition-all duration-200',
            Icon ? 'pl-10 pr-4' : 'px-4',
            (disabled || readOnly) && 'opacity-60 cursor-not-allowed bg-slate-900/50'
          )}
        />
      </div>
    </div>
  );
}

// ============================================
// PREREQUISITE ITEM
// ============================================

function PrerequisiteItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-500" />
      )}
      <span className={cn('text-sm', met ? 'text-slate-300' : 'text-slate-500')}>{label}</span>
    </div>
  );
}

// ============================================
// DOWNLOAD BUTTON
// ============================================

function DownloadButton({
  label,
  subLabel,
  icon: Icon,
  onClick,
  variant = 'primary',
}: {
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full flex items-center gap-4 p-4 rounded-xl',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        variant === 'primary' && [
          'bg-gradient-to-r from-amber-500/90 to-cyan-600/90',
          'border border-amber-400/30',
          'hover:from-amber-400/90 hover:to-cyan-500/90',
          'shadow-lg shadow-amber-400/20',
        ],
        variant === 'secondary' && [
          'glass-card-dark',
          'border border-slate-600/30',
          'hover:border-amber-400/30',
        ]
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg',
          variant === 'primary' ? 'bg-white/10' : 'bg-amber-400/10'
        )}
      >
        <Icon className={cn('w-6 h-6', variant === 'primary' ? 'text-white' : 'text-amber-400')} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn('font-semibold', variant === 'primary' ? 'text-white' : 'text-slate-200')}>
          {label}
        </p>
        {subLabel && (
          <p className={cn('text-sm', variant === 'primary' ? 'text-amber-100' : 'text-slate-400')}>
            {subLabel}
          </p>
        )}
      </div>
      <Download
        className={cn(
          'w-5 h-5 transition-transform duration-300',
          'group-hover:translate-y-0.5',
          variant === 'primary' ? 'text-white/70' : 'text-slate-500'
        )}
      />
    </button>
  );
}

// ============================================
// ESCALATION DIALOG
// ============================================

function EscalationDialog({
  isOpen,
  onClose,
  onConfirm,
  notes,
  onNotesChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-elevated p-6 max-w-md w-full animate-text-reveal">
        <h3 className="text-lg font-semibold text-white mb-2">Escalate to Manual Pickup</h3>
        <p className="text-sm text-slate-400 mb-4">
          This will mark the job for in-person pickup at the CHP office. A staff member will need to
          physically retrieve the report.
        </p>
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Escalation Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Reason for escalation..."
            className={cn(
              'w-full h-24 rounded-lg border bg-slate-800/50 text-slate-200',
              'text-base md:text-sm p-3',
              'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
              'placeholder:text-slate-500',
              'resize-none'
            )}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 md:h-10 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 md:h-10 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 transition-colors"
          >
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INFO ROW (Read-only display)
// ============================================

function InfoRow({
  label,
  value,
  icon: Icon,
  copyable = false,
}: {
  label: string;
  value: string | undefined;
  icon?: React.ComponentType<{ className?: string }>;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  if (!value) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-b-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-200 font-medium">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3 text-slate-500 hover:text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// JOB SUMMARY CARD (Completed/Cancelled State)
// ============================================

function JobSummaryCard({
  job,
  page1Data,
  page2Data,
  isCompleted,
  onRunWrapper,
  canRunWrapper,
  isWrapperRunning,
}: {
  job: Job;
  page1Data: { crashDate: string; crashTime: string; officerId: string };
  page2Data: { firstName: string; lastName: string; plate: string; driverLicense: string; vin: string };
  isCompleted: boolean;
  onRunWrapper?: () => void;
  canRunWrapper?: boolean;
  isWrapperRunning?: boolean;
}) {
  const isCancelled = job.internalStatus === 'CANCELLED';
  const isManual = job.internalStatus === 'COMPLETED_MANUAL';
  const clientName = [page2Data.firstName, page2Data.lastName].filter(Boolean).join(' ') || job.clientName;

  const getCompletionBadge = () => {
    if (isCancelled) {
      return { label: 'Cancelled', color: 'bg-red-500/20 text-red-200 border-red-500/30' };
    }
    if (isManual) {
      return { label: 'Manual', color: 'bg-amber-500/20 text-amber-200 border-amber-500/30' };
    }
    return { label: 'Automated', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
  };

  const badge = getCompletionBadge();

  return (
    <div
      className={cn(
        'glass-subtle p-5 animate-text-reveal',
        'border-l-4',
        isCancelled ? 'border-l-slate-500' : 'border-l-emerald-500'
      )}
      style={{ animationDelay: '100ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full',
            isCancelled ? 'bg-slate-500/10' : 'bg-emerald-500/10'
          )}>
            {isCancelled ? (
              <XCircle className="w-5 h-5 text-slate-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Job Summary
            </h3>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mt-1',
              badge.color
            )}>
              {badge.label}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-500">
          {formatDateTime(job.updatedAt)}
        </span>
      </div>

      {/* Report Details Section */}
      <div className="mb-6">
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-3 h-3" />
          Report Details
        </h4>
        <div className="bg-slate-800/30 rounded-lg p-3">
          <InfoRow label="Report #" value={job.reportNumber} icon={Hash} copyable />
          <InfoRow label="NCIC" value={deriveNcic(job.reportNumber)} icon={Hash} />
          <InfoRow label="Crash Date" value={page1Data.crashDate} icon={Calendar} />
          <InfoRow label="Crash Time" value={page1Data.crashTime} icon={Clock} />
          <InfoRow label="Officer ID" value={page1Data.officerId} icon={User} />
        </div>
      </div>

      {/* Verification Data Section */}
      <div className="mb-6">
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-3 h-3" />
          Verification Data
        </h4>
        <div className="bg-slate-800/30 rounded-lg p-3">
          <InfoRow label="Client Name" value={clientName} icon={User} />
          {job.clientType && (
            <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Client Type</span>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-xs font-medium border',
                'bg-amber-400/20 text-amber-200 border-amber-400/30'
              )}>
                {job.clientType.charAt(0).toUpperCase() + job.clientType.slice(1)}
              </span>
            </div>
          )}
          <InfoRow label="License Plate" value={page2Data.plate} icon={Car} />
          <InfoRow label="Driver License" value={page2Data.driverLicense} icon={CreditCard} />
          <InfoRow label="VIN" value={page2Data.vin} icon={Car} />
        </div>
      </div>

      {/* Completion Info Section */}
      <div className="mb-6">
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <History className="w-3 h-3" />
          Processing Info
        </h4>
        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Wrapper Runs</span>
            <span className="text-sm text-slate-200 font-medium">
              {job.wrapperRuns.length} attempt{job.wrapperRuns.length !== 1 ? 's' : ''}
            </span>
          </div>
          {job.lawFirmName && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Law Firm</span>
              <span className="text-sm text-slate-200 font-medium">{job.lawFirmName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Run Wrapper Button (Completed only) */}
      {isCompleted && onRunWrapper && (
        <button
          onClick={onRunWrapper}
          disabled={!canRunWrapper || isWrapperRunning}
          className={cn(
            'w-full h-12 md:h-10 rounded-lg font-medium',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
            'border border-slate-600/50',
            canRunWrapper && !isWrapperRunning
              ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-amber-400/30 active:scale-98'
              : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
          )}
        >
          {isWrapperRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Wrapper Again</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// ALL EVENTS CARD
// ============================================

function AllEventsCard({ jobId }: { jobId: string }) {
  const events = getJobEvents(jobId);

  const eventTypeColors: Record<string, string> = {
    job_created: 'text-slate-400',
    status_change: 'text-blue-400',
    page1_updated: 'text-amber-400',
    page2_updated: 'text-cyan-400',
    wrapper_triggered: 'text-purple-400',
    wrapper_completed: 'text-emerald-400',
    file_uploaded: 'text-green-400',
    check_requested: 'text-violet-400',
    escalated: 'text-amber-400',
    completed: 'text-emerald-400',
    message: 'text-slate-400',
  };

  return (
    <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No events recorded</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  event.isUserFacing ? 'bg-amber-400' : 'bg-slate-500'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      eventTypeColors[event.eventType] || 'text-slate-400'
                    )}
                  >
                    {event.eventType.replace(/_/g, ' ')}
                  </span>
                  {event.isUserFacing && (
                    <span className="text-xs text-amber-400/60">(visible to law firm)</span>
                  )}
                </div>
                <p className="text-sm text-slate-300">{event.message}</p>
                <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function StaffJobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const timelineRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get job data
  const job = getJobById(jobId);

  // Handle 404
  if (!job) {
    notFound();
  }

  // Tab state for mobile
  const [activeTab, setActiveTab] = useState<'lawFirmView' | 'staffControls'>('staffControls');

  // Local job state (for simulating updates)
  const [localJob, setLocalJob] = useState<Job>(job);

  // Page 1 Data state
  const [page1Data, setPage1Data] = useState({
    crashDate: job.crashDate || '',
    crashTime: job.crashTime || '',
    officerId: job.officerId || '',
    locationDescription: job.locationDescription || '',
  });

  // Page 2 Data state (auto-split name from clientName)
  const { firstName: autoFirstName, lastName: autoLastName } = splitClientName(job.clientName);
  const [page2Data, setPage2Data] = useState({
    firstName: job.firstName || autoFirstName,
    lastName: job.lastName || autoLastName,
    plate: job.plate || '',
    driverLicense: job.driverLicense || '',
    vin: job.vin || '',
  });

  // Wrapper state
  const [isWrapperRunning, setIsWrapperRunning] = useState(false);
  const [wrapperProgress, setWrapperProgress] = useState(0);
  const [lastWrapperResult, setLastWrapperResult] = useState<WrapperResult | null>(null);

  // Safety block state (rate limits, cooldowns, etc.)
  const [safetyBlockActive, setSafetyBlockActive] = useState(false);
  const [safetyBlockCode, setSafetyBlockCode] = useState<SafetyBlockCode | null>(null);
  const [safetyBlockCountdown, setSafetyBlockCountdown] = useState(0);
  const [lastRunId, setLastRunId] = useState<string | null>(null);

  // Auto-checker state
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [autoCheckResult, setAutoCheckResult] = useState<'found' | 'not_found' | null>(null);

  // Manual completion state
  const [uploadType, setUploadType] = useState<'face' | 'full'>('face');
  const [guaranteedName, setGuaranteedName] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Escalation state
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState('');

  // Pickup scheduler state (V1.6.0+)
  const [isClaimingPickup, setIsClaimingPickup] = useState(false);
  const [isSchedulingPickup, setIsSchedulingPickup] = useState(false);

  // Journey log collapse state
  const [isJourneyLogOpen, setIsJourneyLogOpen] = useState(false);

  // Preflight check state (DEV only)
  const [isRunningPreflight, setIsRunningPreflight] = useState(false);

  // Derived state
  const isPage1Complete = useMemo(() => {
    return !!(page1Data.crashDate && page1Data.crashTime);
  }, [page1Data]);

  const hasPage2Field = useMemo(() => {
    return !!(
      page2Data.firstName ||
      page2Data.lastName ||
      page2Data.plate ||
      page2Data.driverLicense ||
      page2Data.vin
    );
  }, [page2Data]);

  const canRunWrapper = isPage1Complete && hasPage2Field;

  const canRunAutoChecker = useMemo(() => {
    return !!(localJob.facePageToken && (page2Data.firstName || page2Data.lastName));
  }, [localJob.facePageToken, page2Data.firstName, page2Data.lastName]);

  // Closed job state (completed or cancelled)
  const isCompleted = isCompletedStatus(localJob.internalStatus);
  const isCancelled = localJob.internalStatus === 'CANCELLED';
  const isClosedJob = isCompleted || isCancelled;

  // Get user-facing events for timeline
  const userFacingEvents = getUserFacingEvents(jobId);

  // Auto-scroll to bottom of timeline
  useEffect(() => {
    if (timelineRef.current) {
      setTimeout(() => {
        timelineRef.current?.scrollTo({
          top: timelineRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 800);
    }
  }, [userFacingEvents.length]);

  // Safety block countdown timer
  useEffect(() => {
    if (safetyBlockCountdown <= 0) {
      setSafetyBlockActive(false);
      setSafetyBlockCode(null);
      return;
    }

    const interval = setInterval(() => {
      setSafetyBlockCountdown((prev) => {
        if (prev <= 1) {
          setSafetyBlockActive(false);
          setSafetyBlockCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [safetyBlockCountdown]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCallCHP = () => {
    // Update status to CALL_IN_PROGRESS
    setLocalJob((prev) => ({
      ...prev,
      internalStatus: 'CALL_IN_PROGRESS',
    }));
    toast.info('Initiating call to CHP...');
    // Open phone dialer (mock CHP number)
    window.open('tel:+18005551234', '_self');
  };

  const handleRunWrapper = async () => {
    if (!canRunWrapper || isWrapperRunning) return;

    setIsWrapperRunning(true);
    setWrapperProgress(0);
    setLastWrapperResult(null);

    const startTime = Date.now();
    let result: WrapperResult;
    let page1Passed = false;
    let errorMessage: string | undefined;
    let downloadToken: string | undefined;

    // Progress animation (indeterminate for real API, timed for mock)
    const progressInterval = setInterval(() => {
      setWrapperProgress((prev) => {
        // Slowly increment up to 90% while waiting
        if (prev < 90) return prev + (90 - prev) * 0.05;
        return prev;
      });
    }, 200);

    try {
      // Call the real wrapper API
      const response = await runWrapper({
        jobId: localJob._id,
        reportNumber: localJob.reportNumber,
        crashDate: page1Data.crashDate,
        crashTime: page1Data.crashTime,
        ncic: deriveNcic(localJob.reportNumber),
        officerId: page1Data.officerId || undefined,
        firstName: page2Data.firstName || undefined,
        lastName: page2Data.lastName || undefined,
        plate: page2Data.plate || undefined,
        driverLicense: page2Data.driverLicense || undefined,
        vin: page2Data.vin || undefined,
      });

      clearInterval(progressInterval);
      setWrapperProgress(100);

      if (response.success) {
        // Use the mappedResultType from the proxy response
        result = response.mappedResultType;
        downloadToken = response.downloadToken;
        page1Passed = result === 'FULL' || result === 'FACE_PAGE' || result === 'PAGE2_VERIFICATION_FAILED';
      } else {
        // Handle error response from wrapper
        console.error('[handleRunWrapper] Wrapper error:', response.error);

        // Check for safety blocks FIRST - these are NOT true errors
        if (isRetryableSafetyBlock(response as WrapperErrorResponse)) {
          const errorResp = response as WrapperErrorResponse;
          const retryAfter = extractRetryAfterSeconds(errorResp) || 30;

          // Set safety block state
          setSafetyBlockActive(true);
          setSafetyBlockCode(errorResp.code as SafetyBlockCode);
          setSafetyBlockCountdown(retryAfter);

          // Show friendly toast
          toast.warning(getSafetyBlockMessage(errorResp));

          // Early return - don't update job status or escalate
          clearInterval(progressInterval);
          setWrapperProgress(0);
          setIsWrapperRunning(false);
          return;
        }
        
        // Map error to a result type
        if (response.mappedResultType) {
          result = response.mappedResultType;
        } else if (response.code === 'WRAPPER_AUTH_FAILED') {
          // Auth failure - show debug info in console for troubleshooting
          console.warn('[handleRunWrapper] Auth failed debug:', (response as WrapperErrorResponse & { debug?: unknown }).debug);
          result = 'PORTAL_ERROR';
          errorMessage = 'Wrapper authentication failed. Contact administrator.';
        } else if (response.fieldErrors) {
          // Validation error from wrapper
          result = 'PORTAL_ERROR';
          errorMessage = response.error || 'Validation failed';
        } else {
          result = 'PORTAL_ERROR';
          errorMessage = response.error || 'Unknown error';
        }
      }
    } catch (error) {
      // Network/unexpected error - fall back to mock in DEV_MODE only
      clearInterval(progressInterval);
      console.error('[handleRunWrapper] Exception:', error);

      if (DEV_MODE) {
        // DEV FALLBACK: Use mock behavior when API unavailable
        console.warn('[handleRunWrapper] DEV MODE: Falling back to mock wrapper');
        await new Promise((resolve) => setTimeout(resolve, getDelay('wrapperRun')));
        setWrapperProgress(100);

        // Mock result distribution
        const rand = Math.random();
        if (rand < 0.30) {
          result = 'FULL';
          page1Passed = true;
        } else if (rand < 0.65) {
          result = 'FACE_PAGE';
          page1Passed = true;
        } else if (rand < 0.80) {
          result = 'PAGE1_NOT_FOUND';
          page1Passed = false;
        } else if (rand < 0.95) {
          result = 'PAGE2_VERIFICATION_FAILED';
          page1Passed = true;
        } else {
          result = 'PORTAL_ERROR';
          page1Passed = false;
        }
      } else {
        // PROD: Show error to user
        setWrapperProgress(0);
        result = 'PORTAL_ERROR';
        errorMessage = 'Failed to connect to wrapper service';
      }
    }

    const duration = Date.now() - startTime;

    // V1.6.0: Track which Page 2 fields were tried for auto-escalation
    const page2FieldsTried = {
      name: !!(page2Data.firstName || page2Data.lastName),
      plate: !!page2Data.plate,
      driverLicense: !!page2Data.driverLicense,
      vin: !!page2Data.vin,
    };

    // Determine field results based on wrapper result
    const page2FieldResults: WrapperRun['page2FieldResults'] = {};
    if (result === 'FULL' || result === 'FACE_PAGE') {
      // Success - at least one field worked
      Object.keys(page2FieldsTried).forEach((field) => {
        if (page2FieldsTried[field as keyof typeof page2FieldsTried]) {
          page2FieldResults[field as keyof typeof page2FieldResults] = 'success';
        }
      });
    } else if (result === 'PAGE2_VERIFICATION_FAILED') {
      // All tried fields failed
      Object.keys(page2FieldsTried).forEach((field) => {
        if (page2FieldsTried[field as keyof typeof page2FieldsTried]) {
          page2FieldResults[field as keyof typeof page2FieldResults] = 'failed';
        }
      });
    }

    const runId = `run_${generateId()}`;
    const newRun: WrapperRun = {
      runId,
      timestamp: Date.now(),
      result,
      duration,
      page1Passed,
      errorMessage: errorMessage || (result === 'PORTAL_ERROR' ? 'Portal timeout or error' : undefined),
      page2FieldsTried,
      page2FieldResults,
    };

    // Track last run ID for status display
    setLastRunId(runId);

    // Update local job state
    setLocalJob((prev) => {
      let newStatus = prev.internalStatus;
      let newFacePageToken = prev.facePageToken;
      let newFullReportToken = prev.fullReportToken;
      let escalationData = prev.escalationData;

      if (result === 'FULL') {
        newStatus = 'COMPLETED_FULL_REPORT';
        newFacePageToken = newFacePageToken || downloadToken || `fp_token_${generateId()}`;
        newFullReportToken = downloadToken || `fr_token_${generateId()}`;
      } else if (result === 'FACE_PAGE') {
        newStatus = 'FACE_PAGE_ONLY';
        newFacePageToken = downloadToken || `fp_token_${generateId()}`;
      } else if (result === 'PAGE1_NOT_FOUND') {
        newStatus = 'NEEDS_MORE_INFO';
      } else if (result === 'PAGE2_VERIFICATION_FAILED') {
        // V1.6.0: Check if all available fields have been exhausted for auto-escalation
        const allRuns = [...prev.wrapperRuns, newRun];

        // Get all fields that have ever failed across all runs
        const allFailedFields = new Set<string>();
        allRuns.forEach((run) => {
          if (run.page2FieldResults) {
            Object.entries(run.page2FieldResults).forEach(([field, fieldResult]) => {
              if (fieldResult === 'failed') {
                allFailedFields.add(field);
              }
            });
          }
        });

        // Check if all available (non-empty) fields have been tried and failed
        const availableFields = ['name', 'plate', 'driverLicense', 'vin'].filter((field) => {
          if (field === 'name') return !!(page2Data.firstName || page2Data.lastName);
          return !!page2Data[field as keyof typeof page2Data];
        });

        const allFieldsExhausted = availableFields.length > 0 &&
          availableFields.every((field) => allFailedFields.has(field));

        if (allFieldsExhausted) {
          // Auto-escalate: all Page 2 fields have been tried and failed
          newStatus = 'NEEDS_IN_PERSON_PICKUP';
          escalationData = {
            status: 'pending_authorization',
            escalatedAt: Date.now(),
            escalationReason: 'auto_exhausted',
            escalationNotes: 'Auto-escalated: All verification fields exhausted',
            authorizationRequested: true,
            authorizationRequestedAt: Date.now(),
          };

          // Emit notification: auto-escalation
          const escalatedJob = {
            ...prev,
            internalStatus: newStatus as InternalStatus,
            escalationData,
          };
          notificationManager.emitEscalationStarted(escalatedJob, 'auto_exhausted');

          toast.warning('Auto-escalated: All verification fields exhausted. Manual pickup required.');
        } else {
          newStatus = 'NEEDS_MORE_INFO';
        }
      } else if (result === 'PORTAL_ERROR') {
        newStatus = 'AUTOMATION_ERROR';
      }

      return {
        ...prev,
        internalStatus: newStatus,
        facePageToken: newFacePageToken,
        fullReportToken: newFullReportToken,
        wrapperRuns: [...prev.wrapperRuns, newRun],
        escalationData,
      };
    });

    setLastWrapperResult(result);
    setIsWrapperRunning(false);

    // Show toast based on result
    if (result === 'FULL') {
      toast.success('Full report retrieved successfully!');
    } else if (result === 'FACE_PAGE') {
      toast.success('Face page retrieved. Full report may be available later.');
    } else if (result === 'PAGE1_NOT_FOUND') {
      toast.warning('Report not found with provided Page 1 details.');
    } else if (result === 'PAGE2_VERIFICATION_FAILED') {
      toast.warning('Page 2 verification failed. Need more identifiers.');
    } else if (result === 'PORTAL_ERROR') {
      toast.error(errorMessage || 'Portal error. Please try again or escalate.');
    }
  };

  const handleAutoCheck = async () => {
    if (!canRunAutoChecker || isAutoChecking) return;

    setIsAutoChecking(true);
    setAutoCheckResult(null);

    // Auto-check delay (uses dev config for faster testing)
    await new Promise((resolve) => setTimeout(resolve, getDelay('autoCheck')));

    // 20% chance of finding full report
    const found = Math.random() < 0.2;

    if (found) {
      setLocalJob((prev) => ({
        ...prev,
        fullReportToken: `fr_token_${generateId()}`,
        internalStatus: 'COMPLETED_FULL_REPORT',
      }));
      setAutoCheckResult('found');
      toast.success('Full report is now available!');
    } else {
      setAutoCheckResult('not_found');
      toast.info('Full report not yet available. Try again later.');
    }

    setIsAutoChecking(false);
  };

  const handleEscalate = () => {
    const updatedJob = {
      ...localJob,
      internalStatus: 'NEEDS_IN_PERSON_PICKUP' as InternalStatus,
      escalationData: {
        ...localJob.escalationData,
        status: 'pending_authorization' as const,
        escalatedAt: Date.now(),
        escalationReason: 'manual' as const,
        escalationNotes: escalationNotes || undefined,
      },
    };

    setLocalJob(updatedJob);
    setShowEscalationDialog(false);
    setEscalationNotes('');

    // Emit notification: escalation started
    notificationManager.emitEscalationStarted(updatedJob, 'manual');

    toast.success('Job escalated for in-person pickup');
  };

  const handleUpload = async () => {
    if (uploadType === 'face' && !guaranteedName) {
      toast.error('Please enter the guaranteed name to unlock auto-checker.');
      return;
    }

    setIsUploading(true);

    // Simulate upload (uses dev config for faster testing)
    await new Promise((resolve) => setTimeout(resolve, getDelay('fileUpload')));

    const fileName = uploadType === 'face' ? 'face_page.pdf' : 'full_report.pdf';
    setUploadedFile(fileName);

    // Check if this is an escalated job receiving a face page (resume flow)
    const isEscalatedFacePageUpload = isEscalatedJob(localJob) && uploadType === 'face';

    // Generate tokens
    const facePageToken = `fp_token_${generateId()}`;
    const fullReportToken = uploadType === 'full' ? `fr_token_${generateId()}` : localJob.fullReportToken;

    const updatedJob = {
      ...localJob,
      facePageToken,
      fullReportToken,
      internalStatus: (uploadType === 'full' ? 'COMPLETED_MANUAL' : localJob.internalStatus) as InternalStatus,
      firstName: uploadType === 'face' ? guaranteedName.split(' ')[0] : localJob.firstName,
      lastName:
        uploadType === 'face' ? guaranteedName.split(' ').slice(1).join(' ') : localJob.lastName,
      // For escalated jobs, also save guaranteedName to escalationData
      escalationData: isEscalatedFacePageUpload && localJob.escalationData
        ? {
            ...localJob.escalationData,
            guaranteedName: guaranteedName,
          }
        : localJob.escalationData,
    };

    setLocalJob(updatedJob);
    setIsUploading(false);

    // Emit notification for full report upload (report ready)
    if (uploadType === 'full' && fullReportToken) {
      notificationManager.emitReportReady(updatedJob, 'full_report', fullReportToken);
    }

    if (uploadType === 'full') {
      toast.success('Full report uploaded. Job marked as complete.');
    } else if (isEscalatedFacePageUpload) {
      toast.success('Face page uploaded. Verification flow resumed - auto-checker now available.');
    } else {
      toast.success('Face page uploaded. Auto-checker now available.');
    }
  };

  const handleMarkComplete = () => {
    setLocalJob((prev) => ({
      ...prev,
      internalStatus: 'COMPLETED_MANUAL',
    }));
    toast.success('Job marked as manually complete');
  };

  /**
   * Handle claiming a pickup for escalated jobs (V1.6.0+)
   */
  const handleClaimPickup = async () => {
    setIsClaimingPickup(true);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, getDelay('formSubmit')));

    const updatedJob = {
      ...localJob,
      escalationData: {
        ...localJob.escalationData!,
        status: 'claimed' as EscalationStatus,
        claimedBy: 'Current Staff',
        claimedAt: Date.now(),
      },
    };

    setLocalJob(updatedJob);

    // Emit notification: pickup claimed
    notificationManager.emitPickupClaimed(updatedJob, 'Current Staff');

    setIsClaimingPickup(false);
    toast.success('Pickup claimed successfully');
  };

  /**
   * Handle scheduling a pickup time (V1.6.0+)
   */
  const handleSchedulePickup = async (time: PickupTimeSlot, date: string) => {
    setIsSchedulingPickup(true);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, getDelay('formSubmit')));

    const updatedJob = {
      ...localJob,
      escalationData: {
        ...localJob.escalationData!,
        status: 'pickup_scheduled' as EscalationStatus,
        scheduledPickupTime: time,
        scheduledPickupDate: date,
      },
    };

    setLocalJob(updatedJob);

    // Emit notification: pickup scheduled
    notificationManager.emitPickupScheduled(updatedJob, time, date);

    setIsSchedulingPickup(false);
    toast.success(`Pickup scheduled for ${time} on ${date}`);
  };

  /**
   * Handle downloading authorization document (V1.6.0+)
   */
  const handleDownloadAuth = () => {
    alert(
      `[V1 Mock] Download Authorization Document would happen here.\n\nIn V2, this will fetch from Convex Storage.`
    );
  };

  const handleDownload = (type: 'face' | 'full') => {
    alert(
      `[V1 Mock] Download ${type === 'face' ? 'Face Page' : 'Full Report'} would happen here.\n\nIn V2, this will fetch from Convex Storage.`
    );
  };

  // ============================================
  // RENDER
  // ============================================

  const statusMessage = getStatusMessage(localJob.internalStatus);
  const hasDownloads = localJob.facePageToken || localJob.fullReportToken;

  const TABS = [
    { id: 'lawFirmView', label: 'Law Firm View' },
    { id: 'staffControls', label: 'Staff Controls' },
  ];

  // Filled Page 2 fields count
  const filledPage2Count = [
    page2Data.firstName,
    page2Data.lastName,
    page2Data.plate,
    page2Data.driverLicense,
    page2Data.vin,
  ].filter(Boolean).length;

  return (
    <div className="h-full overflow-auto">
      {/* Mobile Tab Bar */}
      <div className="md:hidden sticky top-0 z-40 glass-header px-4 py-2">
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'lawFirmView' | 'staffControls')}
        />
      </div>

      {/* Desktop: Report number and status badge in page header */}
      <div className="hidden md:flex items-center justify-between px-4 py-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm font-mono">{localJob.reportNumber}</span>
          <DarkStatusBadge internalStatus={localJob.internalStatus} showInternal />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-page-entrance">
        <div className="md:grid md:grid-cols-[45fr_55fr] md:gap-8">
          {/* ============================================ */}
          {/* LEFT COLUMN: Law Firm View */}
          {/* ============================================ */}
          <div
            className={cn(
              'md:block md:sticky md:top-28 md:self-start',
              activeTab !== 'lawFirmView' && 'hidden'
            )}
          >
            <div className="glass-surface p-5 space-y-6">
              {/* Client Info Header */}
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-white font-serif mb-3 animate-text-reveal"
                  style={{ animationDelay: '100ms' }}
                >
                  {localJob.clientName}
                </h1>
                <p
                  className="text-slate-400 font-mono text-sm md:text-base mb-4 animate-text-reveal"
                  style={{ animationDelay: '200ms' }}
                >
                  {localJob.reportNumber}
                </p>
                <div
                  className="flex flex-wrap items-center gap-3 animate-text-reveal"
                  style={{ animationDelay: '300ms' }}
                >
                  <DarkStatusBadge internalStatus={localJob.internalStatus} />
                  {localJob.caseReference && (
                    <span className="text-sm text-slate-500">Case: {localJob.caseReference}</span>
                  )}
                  {localJob.lawFirmName && (
                    <span className="text-sm text-slate-500">{localJob.lawFirmName}</span>
                  )}
                </div>
              </div>

              {/* Current Status Card */}
              <div
                className="glass-card-dark rounded-2xl p-5 animate-text-reveal"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/10">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Current Status (Law Firm Sees)
                    </h2>
                    <p className="text-slate-200 leading-relaxed">{statusMessage}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div>
                <h2
                  className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 animate-text-reveal"
                  style={{ animationDelay: '500ms' }}
                >
                  Activity Timeline (Law Firm View)
                </h2>
                <div
                  ref={timelineRef}
                  className="relative max-h-[300px] overflow-y-auto pl-6 pr-2 pt-4 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                  {userFacingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {userFacingEvents.map((event, index) => (
                        <TimelineMessage
                          key={event._id}
                          eventType={event.eventType}
                          message={event.message}
                          timestamp={event.timestamp}
                          animationDelay={600 + index * 150}
                          isLatest={index === userFacingEvents.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Download Section */}
              {hasDownloads && (
                <div
                  className="space-y-3 animate-text-reveal"
                  style={{ animationDelay: `${600 + userFacingEvents.length * 150 + 200}ms` }}
                >
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Available Documents
                  </h2>
                  {localJob.fullReportToken && (
                    <DownloadButton
                      label="Download Full Report"
                      subLabel="Complete CHP crash report (PDF)"
                      icon={FileCheck}
                      onClick={() => handleDownload('full')}
                      variant="primary"
                    />
                  )}
                  {localJob.facePageToken && (
                    <DownloadButton
                      label="Download Face Page"
                      subLabel="Preliminary report summary (PDF)"
                      icon={FileText}
                      onClick={() => handleDownload('face')}
                      variant={localJob.fullReportToken ? 'secondary' : 'primary'}
                    />
                  )}
                </div>
              )}

              {/* All Events Card */}
              <StaffControlCard
                title="All Events (Internal Log)"
                icon={History}
                animationDelay={800}
              >
                <AllEventsCard jobId={jobId} />
              </StaffControlCard>
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT COLUMN: Staff Controls */}
          {/* ============================================ */}
          <div
            className={cn('md:block', activeTab !== 'staffControls' && 'hidden md:block')}
          >
            {/* Glass Surface Container for Staff Controls */}
            <div className="glass-surface p-4 md:p-5 scroll-container-smooth md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
              <div className="space-y-6 md:space-y-8">
                {/* Internal Status Banner (Mobile Only) */}
                <div className="md:hidden glass-subtle p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Internal Status</span>
                  <DarkStatusBadge internalStatus={localJob.internalStatus} showInternal />
                </div>

            {/* Conditional: Show Summary Card OR Form Cards */}
            {isClosedJob ? (
              <JobSummaryCard
                job={localJob}
                page1Data={page1Data}
                page2Data={page2Data}
                isCompleted={isCompleted}
                onRunWrapper={handleRunWrapper}
                canRunWrapper={canRunWrapper}
                isWrapperRunning={isWrapperRunning}
              />
            ) : (
              <>
            {/* ESCALATED JOBS: Show banner + pickup scheduler + manual completion at top */}
            {isEscalatedJob(localJob) && (
              <>
                {/* Escalation Status Banner */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-slide-up">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-amber-400">
                      ESCALATED - Manual Pickup Required
                    </span>
                  </div>
                  {!canResumeFromEscalated(localJob) && !isFatalJob(localJob) && (
                    <p className="text-xs text-amber-400/70 mt-2">
                      Upload face page with driver name to unlock verification tools.
                    </p>
                  )}
                </div>

                {/* Pickup Scheduler - Always at top for escalated */}
                {localJob.escalationData && (
                  <StaffControlCard title="Pickup Scheduler" icon={Calendar} animationDelay={50}>
                    <PickupScheduler
                      onClaim={handleClaimPickup}
                      onSchedule={handleSchedulePickup}
                      onDownloadAuth={handleDownloadAuth}
                      claimed={
                        localJob.escalationData.status !== 'pending_authorization' &&
                        localJob.escalationData.status !== 'authorization_received'
                      }
                      claimedBy={localJob.escalationData.claimedBy}
                      scheduledTime={localJob.escalationData.scheduledPickupTime}
                      scheduledDate={localJob.escalationData.scheduledPickupDate}
                      hasAuthDocument={!!localJob.escalationData.authorizationDocumentToken}
                      disabled={isClaimingPickup || isSchedulingPickup}
                    />

                    {/* Escalation Info */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Escalation Info
                      </p>
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>
                          Reason:{' '}
                          <span className="text-slate-300">
                            {localJob.escalationData.escalationReason || 'manual'}
                          </span>
                        </p>
                        <p>
                          Status:{' '}
                          <span className="text-slate-300">{localJob.escalationData.status}</span>
                        </p>
                        {localJob.escalationData.escalatedAt && (
                          <p>
                            Escalated:{' '}
                            <span className="text-slate-300">
                              {formatDateTime(localJob.escalationData.escalatedAt)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </StaffControlCard>
                )}

                {/* Manual Completion - Always at top for escalated */}
                {shouldShowManualCompletion(localJob) && (
                  <StaffControlCard title="Manual Completion" icon={Upload} animationDelay={100}>
                    {/* File Type Selection */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">File Type</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="uploadType"
                            checked={uploadType === 'face'}
                            onChange={() => setUploadType('face')}
                            className="w-4 h-4 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
                          />
                          <span className="text-sm text-slate-300">Face Page</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="uploadType"
                            checked={uploadType === 'full'}
                            onChange={() => setUploadType('full')}
                            className="w-4 h-4 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
                          />
                          <span className="text-sm text-slate-300">Full Report</span>
                        </label>
                      </div>
                    </div>

                    {/* Conditional Fields */}
                    {uploadType === 'face' && (
                      <div className="mb-4">
                        <DarkInput
                          label="First Name *"
                          value={guaranteedName}
                          onChange={setGuaranteedName}
                          placeholder="Enter driver's first name only"
                          icon={User}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          First name only - used to unlock auto-checker
                        </p>
                      </div>
                    )}

                    {uploadType === 'full' && (
                      <div className="mb-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <p className="text-xs text-slate-400">
                          Note: Job will auto-complete when uploaded.
                        </p>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || (uploadType === 'face' && !guaranteedName)}
                      className={cn(
                        'w-full h-12 md:h-10 rounded-lg font-medium mb-3',
                        'transition-all duration-200',
                        'flex items-center justify-center gap-2',
                        !isUploading && (uploadType === 'full' || guaranteedName)
                          ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-98'
                          : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      )}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>

                    {/* Uploaded File */}
                    {uploadedFile && (
                      <div className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">{uploadedFile}</span>
                      </div>
                    )}

                    {/* Completion Notes */}
                    <div className="space-y-1.5 mb-4">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Completion Notes
                      </label>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Optional notes..."
                        className={cn(
                          'w-full h-20 rounded-lg border bg-slate-800/50 text-slate-200',
                          'text-base md:text-sm p-3',
                          'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                          'placeholder:text-slate-500',
                          'resize-none'
                        )}
                      />
                    </div>

                    {/* Mark Complete Button */}
                    {uploadType === 'full' && uploadedFile && (
                      <button
                        onClick={handleMarkComplete}
                        className={cn(
                          'w-full h-12 md:h-10 rounded-lg font-medium',
                          'bg-emerald-600 text-white hover:bg-emerald-500',
                          'transition-all duration-200',
                          'flex items-center justify-center gap-2',
                          'active:scale-98'
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                    )}
                  </StaffControlCard>
                )}
              </>
            )}

            {/* Cards 1-4: Wrapper-related UI (hidden for fatal/terminal escalations AND for non-fatal escalations without resume capability) */}
            {shouldShowWrapperUI(localJob) && (
              <>
            {/* Section Divider: Data Collection */}
            <div className="section-divider">data collection</div>

            {/* Card 1: Page 1 Data */}
            <StaffControlCard title="Page 1 Data" icon={FileText} animationDelay={100}>
              {/* Call Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleCallCHP}
                  className={cn(
                    'flex items-center justify-center gap-2 h-12 md:h-10 rounded-lg',
                    'bg-amber-500 hover:bg-amber-400 text-white font-medium',
                    'transition-all duration-200',
                    'active:scale-95'
                  )}
                >
                  <Phone className="w-4 h-4" />
                  <span>Call CHP</span>
                </button>
                <button
                  disabled
                  className={cn(
                    'flex items-center justify-center gap-2 h-12 md:h-10 rounded-lg',
                    'bg-slate-700/50 text-slate-500 font-medium',
                    'cursor-not-allowed opacity-60'
                  )}
                  title="Coming in V3"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Caller</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <DarkInput
                  label="NCIC (Auto-derived)"
                  value={deriveNcic(localJob.reportNumber)}
                  onChange={() => {}}
                  readOnly
                  icon={Hash}
                />
                <DarkInput
                  label="Crash Date"
                  value={page1Data.crashDate}
                  onChange={(v) => setPage1Data((prev) => ({ ...prev, crashDate: v }))}
                  placeholder="MM/DD/YYYY"
                  icon={Calendar}
                />
                <DarkInput
                  label="Crash Time"
                  value={page1Data.crashTime}
                  onChange={(v) => setPage1Data((prev) => ({ ...prev, crashTime: v }))}
                  placeholder="HHMM (24-hour)"
                  icon={Clock}
                />
                <DarkInput
                  label="Officer ID"
                  value={page1Data.officerId}
                  onChange={(v) => setPage1Data((prev) => ({ ...prev, officerId: v }))}
                  placeholder="6 digits (optional)"
                  icon={User}
                />
              </div>

              {/* Page 1 Status */}
              <div className="mt-4 flex items-center gap-2">
                {isPage1Complete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Page 1 Complete</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      Fill crash date and time to complete
                    </span>
                  </>
                )}
              </div>
            </StaffControlCard>

            {/* Card 2: Page 2 Verification */}
            <StaffControlCard title="Page 2 Verification" icon={User} animationDelay={200}>
              {/* Passenger-Provided Data Quick-Fill Banner */}
              {localJob.passengerProvidedData && (
                <div className="mb-4 p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <p className="text-xs text-amber-400 mb-2 uppercase tracking-wider">
                    Passenger Provided:
                  </p>
                  <div className="space-y-2">
                    {localJob.passengerProvidedData.plate && (
                      <button
                        onClick={() =>
                          setPage2Data((prev) => ({
                            ...prev,
                            plate: localJob.passengerProvidedData!.plate!,
                          }))
                        }
                        className="flex items-center gap-2 w-full text-left p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                      >
                        <Car className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          Plate: {localJob.passengerProvidedData.plate}
                        </span>
                        <Copy className="w-4 h-4 text-amber-400" />
                      </button>
                    )}
                    {localJob.passengerProvidedData.driverLicense && (
                      <button
                        onClick={() =>
                          setPage2Data((prev) => ({
                            ...prev,
                            driverLicense: localJob.passengerProvidedData!.driverLicense!,
                          }))
                        }
                        className="flex items-center gap-2 w-full text-left p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          Driver License: {localJob.passengerProvidedData.driverLicense}
                        </span>
                        <Copy className="w-4 h-4 text-amber-400" />
                      </button>
                    )}
                    {localJob.passengerProvidedData.vin && (
                      <button
                        onClick={() =>
                          setPage2Data((prev) => ({
                            ...prev,
                            vin: localJob.passengerProvidedData!.vin!,
                          }))
                        }
                        className="flex items-center gap-2 w-full text-left p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                      >
                        <Car className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          VIN: {localJob.passengerProvidedData.vin}
                        </span>
                        <Copy className="w-4 h-4 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <DarkInput
                  label="First Name"
                  value={page2Data.firstName}
                  onChange={(v) => setPage2Data((prev) => ({ ...prev, firstName: v }))}
                  placeholder="Client first name"
                  icon={User}
                />
                <DarkInput
                  label="Last Name"
                  value={page2Data.lastName}
                  onChange={(v) => setPage2Data((prev) => ({ ...prev, lastName: v }))}
                  placeholder="Client last name"
                  icon={User}
                />
                <DarkInput
                  label="License Plate"
                  value={page2Data.plate}
                  onChange={(v) => setPage2Data((prev) => ({ ...prev, plate: v }))}
                  placeholder="e.g., 8ABC123"
                  icon={Car}
                />
                <DarkInput
                  label="Driver License"
                  value={page2Data.driverLicense}
                  onChange={(v) => setPage2Data((prev) => ({ ...prev, driverLicense: v }))}
                  placeholder="DL number"
                  icon={CreditCard}
                />
                <DarkInput
                  label="VIN"
                  value={page2Data.vin}
                  onChange={(v) => setPage2Data((prev) => ({ ...prev, vin: v }))}
                  placeholder="Vehicle identification"
                  icon={Car}
                />
              </div>

              {/* Helper Note */}
              <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <p className="text-xs text-slate-400">
                  Only one of these fields needs correct information for CHP verification. We just
                  need one field filled out.
                </p>
              </div>

              {/* Filled Count */}
              <div className="mt-3 flex items-center gap-2">
                {hasPage2Field ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{filledPage2Count} field(s) filled</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">At least 1 field needed</span>
                  </>
                )}
              </div>
            </StaffControlCard>

            {/* Section Divider: Automation */}
            <div className="section-divider">automation</div>

            {/* Card 3: CHP Wrapper */}
            <StaffControlCard title="CHP Wrapper" icon={Play} animationDelay={300}>
              {/* Prerequisites */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Prerequisites
                </p>
                <PrerequisiteItem label="Page 1 complete (date + time)" met={isPage1Complete} />
                <PrerequisiteItem label="Page 2 has at least one field" met={hasPage2Field} />
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunWrapper}
                disabled={!canRunWrapper || isWrapperRunning || safetyBlockActive}
                className={cn(
                  'w-full h-12 md:h-10 rounded-lg font-medium',
                  'transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  canRunWrapper && !isWrapperRunning && !safetyBlockActive
                    ? 'bg-gradient-to-r from-amber-500 to-cyan-600 text-white hover:from-amber-400 hover:to-cyan-500 active:scale-98'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                )}
              >
                {isWrapperRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running... ({Math.round(wrapperProgress)}%)</span>
                  </>
                ) : safetyBlockActive ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Retry in {safetyBlockCountdown}s</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run CHP Wrapper</span>
                  </>
                )}
              </button>

              {/* Safety Block Banner - Shared Component */}
              <WrapperSafetyBanner
                isActive={safetyBlockActive}
                safetyBlockCode={safetyBlockCode}
                countdown={safetyBlockCountdown}
                variant="inline"
              />

              {/* Progress Bar */}
              {isWrapperRunning && (
                <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-cyan-500 transition-all duration-100"
                    style={{ width: `${wrapperProgress}%` }}
                  />
                </div>
              )}

              {/* Wrapper Status Section */}
              {(lastRunId || safetyBlockActive || lastWrapperResult) && !isWrapperRunning && (
                <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Wrapper Status
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {lastRunId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Last Run ID</span>
                        <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded font-mono">
                          {lastRunId}
                        </code>
                      </div>
                    )}
                    {lastWrapperResult && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Last Result</span>
                        <WrapperResultBadge result={lastWrapperResult} />
                      </div>
                    )}
                    {safetyBlockActive && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Block Type</span>
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {safetyBlockCode?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    {safetyBlockActive && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Retry In</span>
                        <span className="text-sm text-amber-400 font-mono">
                          {safetyBlockCountdown}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Result */}
              {lastWrapperResult && !isWrapperRunning && (
                <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-500">Result:</span>
                    <WrapperResultBadge result={lastWrapperResult} />
                  </div>
                  <p className="text-sm text-slate-300">
                    {lastWrapperResult === 'FULL' && 'Full CHP crash report downloaded successfully.'}
                    {lastWrapperResult === 'FACE_PAGE' &&
                      'CHP report found (Face Page only). Full report may be available later.'}
                    {lastWrapperResult === 'PAGE1_NOT_FOUND' &&
                      'Report not found with provided Page 1 details (date/time/officer).'}
                    {lastWrapperResult === 'PAGE2_VERIFICATION_FAILED' &&
                      'Page 1 passed, but Page 2 verification failed. Need more identifiers.'}
                    {lastWrapperResult === 'PORTAL_ERROR' &&
                      'Portal error occurred. Please try again or escalate.'}
                  </p>
                </div>
              )}

              {/* Journey Log (Collapsible) */}
              <div className="mt-4">
                <button
                  onClick={() => setIsJourneyLogOpen(!isJourneyLogOpen)}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {isJourneyLogOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Technical Details (for debugging)</span>
                </button>
                {isJourneyLogOpen && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                    <p className="text-xs text-amber-400 mb-2">
                      Journey logs contain technical information for developers only.
                    </p>
                    <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap">
                      {`[V1 Mock] Journey log would appear here.\nPortal: CHP SWITRS\nSession: mock_session_${generateId()}\nStatus: ${lastWrapperResult || 'Not run'}`}
                    </pre>
                  </div>
                )}
              </div>

              {/* DEV-ONLY: Safety Block Testing Tools */}
              {DEV_MODE && (
                <div className="mt-4 border-t border-dashed border-slate-700/50 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                      DEV ONLY
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Safety Block Testing
                    </span>
                  </div>

                  {/* Preflight Check Button */}
                  <div className="mb-4">
                    <button
                      onClick={async () => {
                        setIsRunningPreflight(true);
                        try {
                          const result = await runSafetyPreflight();
                          if (result.canRun) {
                            toast.success(`Preflight passed: ${result.message}`);
                          } else if (result.blockCode) {
                            // Set safety block state from preflight
                            setSafetyBlockActive(true);
                            setSafetyBlockCode(result.blockCode);
                            setSafetyBlockCountdown(result.retryAfterSeconds || 15);
                            toast.warning(`Preflight blocked: ${result.message}`);
                          } else {
                            toast.info(result.message);
                          }
                        } catch (error) {
                          toast.error('Preflight failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                        }
                        setIsRunningPreflight(false);
                      }}
                      disabled={isRunningPreflight || safetyBlockActive}
                      className={cn(
                        'w-full h-10 rounded-lg text-sm font-medium transition-all',
                        'flex items-center justify-center gap-2',
                        isRunningPreflight || safetyBlockActive
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                      )}
                    >
                      {isRunningPreflight ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4" />
                          Run Preflight Check
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-600 mt-1">
                      Calls /api/safety-check mode=simulate to verify wrapper state
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Test the UI behavior when the wrapper blocks for safety. These buttons simulate
                    different safety block scenarios without hitting the real wrapper.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const result = simulateSafetyBlock('RATE_LIMIT_ACTIVE', 15);
                        setSafetyBlockActive(true);
                        setSafetyBlockCode('RATE_LIMIT_ACTIVE');
                        setSafetyBlockCountdown(result.retryAfterSeconds);
                        toast.warning(result.message);
                      }}
                      disabled={safetyBlockActive}
                      className={cn(
                        'h-10 rounded-lg text-xs font-medium transition-all',
                        'flex items-center justify-center gap-1',
                        safetyBlockActive
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                      )}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Rate Limit
                    </button>
                    <button
                      onClick={() => {
                        const result = simulateSafetyBlock('RUN_LOCK_ACTIVE', 10);
                        setSafetyBlockActive(true);
                        setSafetyBlockCode('RUN_LOCK_ACTIVE');
                        setSafetyBlockCountdown(result.retryAfterSeconds);
                        toast.warning(result.message);
                      }}
                      disabled={safetyBlockActive}
                      className={cn(
                        'h-10 rounded-lg text-xs font-medium transition-all',
                        'flex items-center justify-center gap-1',
                        safetyBlockActive
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                      )}
                    >
                      <Lock className="w-3 h-3" />
                      Run Lock
                    </button>
                    <button
                      onClick={() => {
                        const result = simulateSafetyBlock('COOLDOWN_ACTIVE', 8);
                        setSafetyBlockActive(true);
                        setSafetyBlockCode('COOLDOWN_ACTIVE');
                        setSafetyBlockCountdown(result.retryAfterSeconds);
                        toast.warning(result.message);
                      }}
                      disabled={safetyBlockActive}
                      className={cn(
                        'h-10 rounded-lg text-xs font-medium transition-all',
                        'flex items-center justify-center gap-1',
                        safetyBlockActive
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      Cooldown
                    </button>
                    <button
                      onClick={() => {
                        const result = simulateSafetyBlock('CIRCUIT_BREAKER_ACTIVE', 30);
                        setSafetyBlockActive(true);
                        setSafetyBlockCode('CIRCUIT_BREAKER_ACTIVE');
                        setSafetyBlockCountdown(result.retryAfterSeconds);
                        toast.warning(result.message);
                      }}
                      disabled={safetyBlockActive}
                      className={cn(
                        'h-10 rounded-lg text-xs font-medium transition-all',
                        'flex items-center justify-center gap-1',
                        safetyBlockActive
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                      )}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Circuit Breaker
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 italic">
                    Expected: Amber banner + countdown + disabled button. No escalation or error language.
                  </p>
                </div>
              )}
            </StaffControlCard>

            {/* Card 4: Wrapper History */}
            <StaffControlCard title="Wrapper History" icon={History} animationDelay={400}>
              {localJob.wrapperRuns.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No wrapper runs yet. Results will appear here after running the CHP wrapper.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {[...localJob.wrapperRuns].reverse().map((run) => {
                    const borderColor =
                      run.result === 'FULL'
                        ? 'border-l-emerald-500'
                        : run.result === 'FACE_PAGE'
                          ? 'border-l-yellow-500'
                          : run.result === 'PORTAL_ERROR'
                            ? 'border-l-red-500'
                            : run.result === 'PAGE2_VERIFICATION_FAILED'
                              ? 'border-l-amber-500'
                              : 'border-l-slate-500';

                    return (
                      <div
                        key={run.runId}
                        className={cn(
                          'p-3 rounded-lg bg-slate-800/30 border border-slate-700/30',
                          'border-l-4',
                          borderColor
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">
                            {formatDateTime(run.timestamp)} ({formatRelativeTime(run.timestamp)})
                          </span>
                          <WrapperResultBadge result={run.result} />
                        </div>
                        <p className="text-xs text-slate-400">
                          Duration: {(run.duration / 1000).toFixed(1)} seconds
                        </p>
                        {run.errorMessage && (
                          <p className="text-xs text-red-400 mt-1">{run.errorMessage}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {(run.result === 'FULL' || run.result === 'FACE_PAGE') && (
                            <button
                              onClick={() =>
                                handleDownload(run.result === 'FULL' ? 'full' : 'face')
                              }
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </StaffControlCard>
              </>
            )}
              </>
            )}

            {/* Section Divider: Actions */}
            <div className="section-divider">actions</div>

            {/* Card 5: Auto-Checker - Hide when full report exists OR when auto-checker not applicable */}
            {shouldShowAutoChecker(localJob) && (
            <StaffControlCard
              title="Auto-Checker"
              icon={canRunAutoChecker ? Unlock : Lock}
              animationDelay={500}
            >
              {/* Lock Status */}
              <div
                className={cn(
                  'flex items-center gap-2 mb-4 p-3 rounded-lg',
                  canRunAutoChecker
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-slate-800/30 border border-slate-700/30'
                )}
              >
                {canRunAutoChecker ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Unlocked - Ready to check</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">Locked - Missing requirements</span>
                  </>
                )}
              </div>

              {/* Conditions */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  {localJob.facePageToken ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      localJob.facePageToken ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    Has face page
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {page2Data.firstName || page2Data.lastName ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      page2Data.firstName || page2Data.lastName
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    )}
                  >
                    Has driver name
                  </span>
                </div>
              </div>

              {/* Check Button */}
              <button
                onClick={handleAutoCheck}
                disabled={!canRunAutoChecker || isAutoChecking}
                className={cn(
                  'w-full h-12 md:h-10 rounded-lg font-medium',
                  'transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  canRunAutoChecker && !isAutoChecking
                    ? 'bg-gradient-to-r from-amber-500 to-cyan-600 text-white hover:from-amber-400 hover:to-cyan-500 active:scale-98'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                )}
              >
                {isAutoChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Check if Full Report Ready</span>
                )}
              </button>

              {/* Result */}
              {autoCheckResult && !isAutoChecking && (
                <div
                  className={cn(
                    'mt-3 p-3 rounded-lg',
                    autoCheckResult === 'found'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-slate-800/30 border border-slate-700/30'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm',
                      autoCheckResult === 'found' ? 'text-emerald-400' : 'text-slate-400'
                    )}
                  >
                    {autoCheckResult === 'found'
                      ? 'Full report now available!'
                      : 'Still only face page available.'}
                  </p>
                </div>
              )}
            </StaffControlCard>
            )}

            {/* Section Divider: Manual Actions */}
            <div className="section-divider">manual actions</div>

            {/* Card 6: Escalation Button - Only show for NON-escalated jobs without reports */}
            {!isEscalatedJob(localJob) && !isFatalJob(localJob) && !localJob.facePageToken && !localJob.fullReportToken && (
              <StaffControlCard title="Escalation" icon={AlertTriangle} animationDelay={600}>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <p className="text-xs text-amber-400">
                    Use when automation fails multiple times and manual in-person pickup at CHP office
                    is required.
                  </p>
                </div>

                <button
                  onClick={() => setShowEscalationDialog(true)}
                  className={cn(
                    'w-full h-12 md:h-10 rounded-lg font-medium',
                    'transition-all duration-200',
                    'flex items-center justify-center gap-2',
                    'bg-amber-600 text-white hover:bg-amber-500 active:scale-98'
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Escalate to Manual Pickup</span>
                </button>

                <p className="text-xs text-slate-500 mt-3">
                  All staff can see escalated jobs globally.
                </p>
              </StaffControlCard>
            )}

            {/* Manual Completion for NON-escalated jobs */}
            {!isEscalatedJob(localJob) && shouldShowManualCompletion(localJob) && (
              <StaffControlCard title="Manual Completion" icon={Upload} animationDelay={700}>
              {/* File Type Selection */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">File Type</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadType"
                      checked={uploadType === 'face'}
                      onChange={() => setUploadType('face')}
                      className="w-4 h-4 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
                    />
                    <span className="text-sm text-slate-300">Face Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadType"
                      checked={uploadType === 'full'}
                      onChange={() => setUploadType('full')}
                      className="w-4 h-4 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
                    />
                    <span className="text-sm text-slate-300">Full Report</span>
                  </label>
                </div>
              </div>

              {/* Conditional Fields */}
              {uploadType === 'face' && (
                <div className="mb-4">
                  <DarkInput
                    label="First Name *"
                    value={guaranteedName}
                    onChange={setGuaranteedName}
                    placeholder="Enter driver's first name only"
                    icon={User}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    First name only - used to unlock auto-checker
                  </p>
                </div>
              )}

              {uploadType === 'full' && (
                <div className="mb-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <p className="text-xs text-slate-400">
                    Note: Job will auto-complete when uploaded.
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading || (uploadType === 'face' && !guaranteedName)}
                className={cn(
                  'w-full h-12 md:h-10 rounded-lg font-medium mb-3',
                  'transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  !isUploading && (uploadType === 'full' || guaranteedName)
                    ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-98'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </>
                )}
              </button>

              {/* Uploaded File */}
              {uploadedFile && (
                <div className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">{uploadedFile}</span>
                </div>
              )}

              {/* Completion Notes */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Completion Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className={cn(
                    'w-full h-20 rounded-lg border bg-slate-800/50 text-slate-200',
                    'text-base md:text-sm p-3',
                    'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
                    'placeholder:text-slate-500',
                    'resize-none'
                  )}
                />
              </div>

              {/* Mark Complete Button */}
              {uploadType === 'full' && uploadedFile && (
                <button
                  onClick={handleMarkComplete}
                  className={cn(
                    'w-full h-12 md:h-10 rounded-lg font-medium',
                    'bg-emerald-600 text-white hover:bg-emerald-500',
                    'transition-all duration-200',
                    'flex items-center justify-center gap-2',
                    'active:scale-98'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              )}
              </StaffControlCard>
            )}

            {/* Bottom Spacer */}
            <div className="h-8" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Escalation Dialog */}
      <EscalationDialog
        isOpen={showEscalationDialog}
        onClose={() => setShowEscalationDialog(false)}
        onConfirm={handleEscalate}
        notes={escalationNotes}
        onNotesChange={setEscalationNotes}
      />
    </div>
  );
}
