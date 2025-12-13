'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
  MapPin,
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
import type { Job, WrapperRun, WrapperResult, InternalStatus, JobEvent } from '@/lib/types';
import TimelineMessage from '@/components/ui/TimelineMessage';
import TabBar from '@/components/ui/TabBar';
import { formatRelativeTime } from '@/lib/utils';

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
      className="glass-card-dark rounded-xl p-5 animate-text-reveal"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10">
              <Icon className="w-4 h-4 text-teal-400" />
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
            'border-slate-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
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
          'bg-gradient-to-r from-teal-600/90 to-cyan-600/90',
          'border border-teal-500/30',
          'hover:from-teal-500/90 hover:to-cyan-500/90',
          'shadow-lg shadow-teal-500/20',
        ],
        variant === 'secondary' && [
          'glass-card-dark',
          'border border-slate-600/30',
          'hover:border-teal-500/30',
        ]
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg',
          variant === 'primary' ? 'bg-white/10' : 'bg-teal-500/10'
        )}
      >
        <Icon className={cn('w-6 h-6', variant === 'primary' ? 'text-white' : 'text-teal-400')} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn('font-semibold', variant === 'primary' ? 'text-white' : 'text-slate-200')}>
          {label}
        </p>
        {subLabel && (
          <p className={cn('text-sm', variant === 'primary' ? 'text-teal-100' : 'text-slate-400')}>
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
      <div className="relative glass-card-dark rounded-2xl p-6 max-w-md w-full animate-text-reveal">
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
              'border-slate-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
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
            <Copy className="w-3 h-3 text-slate-500 hover:text-teal-400" />
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
        'glass-card-dark rounded-xl p-5 animate-text-reveal',
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
                'bg-teal-500/20 text-teal-200 border-teal-500/30'
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
              ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-teal-500/30 active:scale-98'
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
    page1_updated: 'text-teal-400',
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
                  event.isUserFacing ? 'bg-teal-400' : 'bg-slate-500'
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
                    <span className="text-xs text-teal-400/60">(visible to law firm)</span>
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
  const [activeTab, setActiveTab] = useState<'lawFirmView' | 'staffControls'>('lawFirmView');

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

  // Journey log collapse state
  const [isJourneyLogOpen, setIsJourneyLogOpen] = useState(false);

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

  const isEscalated = localJob.internalStatus === 'NEEDS_IN_PERSON_PICKUP';

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

    // Random duration between 8-13 seconds
    const duration = 8000 + Math.random() * 5000;
    const startTime = Date.now();

    // Progress animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setWrapperProgress(progress);
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, duration));
    clearInterval(interval);
    setWrapperProgress(100);

    // New result distribution:
    // 30% → FULL (page1 passed, page2 passed)
    // 35% → FACE_PAGE (page1 passed, face page available)
    // 15% → PAGE1_NOT_FOUND (page1 failed)
    // 15% → PAGE2_VERIFICATION_FAILED (page1 passed, page2 failed)
    // 5% → PORTAL_ERROR (technical issue)
    const rand = Math.random();
    let result: WrapperResult;
    let page1Passed = false;

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

    const newRun: WrapperRun = {
      runId: `run_${generateId()}`,
      timestamp: Date.now(),
      result,
      duration,
      page1Passed,
      errorMessage: result === 'PORTAL_ERROR' ? 'Portal timeout after 45 seconds' : undefined,
    };

    // Update local job state
    setLocalJob((prev) => {
      let newStatus = prev.internalStatus;
      let newFacePageToken = prev.facePageToken;
      let newFullReportToken = prev.fullReportToken;

      if (result === 'FULL') {
        newStatus = 'COMPLETED_FULL_REPORT';
        newFacePageToken = newFacePageToken || `fp_token_${generateId()}`;
        newFullReportToken = `fr_token_${generateId()}`;
      } else if (result === 'FACE_PAGE') {
        newStatus = 'FACE_PAGE_ONLY';
        newFacePageToken = `fp_token_${generateId()}`;
      } else if (result === 'PAGE1_NOT_FOUND' || result === 'PAGE2_VERIFICATION_FAILED') {
        newStatus = 'NEEDS_MORE_INFO';
      } else if (result === 'PORTAL_ERROR') {
        newStatus = 'AUTOMATION_ERROR';
      }

      return {
        ...prev,
        internalStatus: newStatus,
        facePageToken: newFacePageToken,
        fullReportToken: newFullReportToken,
        wrapperRuns: [...prev.wrapperRuns, newRun],
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
      toast.error('Portal error. Please try again or escalate.');
    }
  };

  const handleAutoCheck = async () => {
    if (!canRunAutoChecker || isAutoChecking) return;

    setIsAutoChecking(true);
    setAutoCheckResult(null);

    // 3-5 second delay
    await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000));

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
    setLocalJob((prev) => ({
      ...prev,
      internalStatus: 'NEEDS_IN_PERSON_PICKUP',
    }));
    setShowEscalationDialog(false);
    setEscalationNotes('');
    toast.success('Job escalated for in-person pickup');
  };

  const handleUpload = async () => {
    if (uploadType === 'face' && !guaranteedName) {
      toast.error('Please enter the guaranteed name to unlock auto-checker.');
      return;
    }

    setIsUploading(true);

    // Simulate upload (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    const fileName = uploadType === 'face' ? 'face_page.pdf' : 'full_report.pdf';
    setUploadedFile(fileName);

    setLocalJob((prev) => ({
      ...prev,
      facePageToken: `fp_token_${generateId()}`,
      fullReportToken: uploadType === 'full' ? `fr_token_${generateId()}` : prev.fullReportToken,
      internalStatus: uploadType === 'full' ? 'COMPLETED_MANUAL' : prev.internalStatus,
      firstName: uploadType === 'face' ? guaranteedName.split(' ')[0] : prev.firstName,
      lastName:
        uploadType === 'face' ? guaranteedName.split(' ').slice(1).join(' ') : prev.lastName,
    }));

    setIsUploading(false);

    if (uploadType === 'full') {
      toast.success('Full report uploaded. Job marked as complete.');
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

  const handleDownload = (type: 'face' | 'full') => {
    alert(
      `[V1 Mock] Download ${type === 'face' ? 'Face Page' : 'Full Report'} would happen here.\n\nIn V2, this will fetch from Convex Storage.`
    );
  };

  // ============================================
  // RENDER
  // ============================================

  const publicStatus = getPublicStatus(localJob.internalStatus);
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb-dark w-[500px] h-[500px] bg-teal-600/20 top-[-10%] left-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="orb-dark w-[400px] h-[400px] bg-cyan-600/15 bottom-[20%] right-[-5%]"
          style={{ animationDelay: '5s' }}
        />
        <div
          className="orb-dark w-[600px] h-[600px] bg-slate-700/20 bottom-[-20%] left-[30%]"
          style={{ animationDelay: '10s' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 header-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/staff"
                className={cn(
                  'flex items-center justify-center w-10 h-10 -ml-2 rounded-full',
                  'text-slate-400 hover:text-white',
                  'hover:bg-slate-800/50',
                  'transition-all duration-200',
                  'active:scale-95'
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="ml-3 text-slate-400 text-sm font-medium">Back to queue</span>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-slate-500 text-sm font-mono">{localJob.reportNumber}</span>
              <DarkStatusBadge internalStatus={localJob.internalStatus} showInternal />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden sticky top-16 z-40 header-blur border-b border-slate-800/50 px-4 py-2">
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'lawFirmView' | 'staffControls')}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 animate-page-entrance">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          {/* ============================================ */}
          {/* LEFT COLUMN: Law Firm View */}
          {/* ============================================ */}
          <div
            className={cn(
              'md:block md:sticky md:top-28 md:self-start',
              activeTab !== 'lawFirmView' && 'hidden'
            )}
          >
            <div className="space-y-6">
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500/10">
                    <Sparkles className="w-5 h-5 text-teal-400" />
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
                  className="relative max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
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
            className={cn('md:block space-y-4', activeTab !== 'staffControls' && 'hidden md:block')}
          >
            {/* Internal Status Banner (Mobile Only) */}
            <div className="md:hidden glass-card-dark rounded-xl p-4 flex items-center justify-between">
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
            {/* Card 1: Page 1 Data */}
            <StaffControlCard title="Page 1 Data" icon={FileText} animationDelay={100}>
              {/* Call Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleCallCHP}
                  className={cn(
                    'flex items-center justify-center gap-2 h-12 md:h-10 rounded-lg',
                    'bg-teal-600 hover:bg-teal-500 text-white font-medium',
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
                <div className="mb-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <p className="text-xs text-teal-400 mb-2 uppercase tracking-wider">
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
                        <Car className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          Plate: {localJob.passengerProvidedData.plate}
                        </span>
                        <Copy className="w-4 h-4 text-teal-400" />
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
                        <CreditCard className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          Driver License: {localJob.passengerProvidedData.driverLicense}
                        </span>
                        <Copy className="w-4 h-4 text-teal-400" />
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
                        <Car className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-slate-300 flex-1">
                          VIN: {localJob.passengerProvidedData.vin}
                        </span>
                        <Copy className="w-4 h-4 text-teal-400" />
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
                disabled={!canRunWrapper || isWrapperRunning}
                className={cn(
                  'w-full h-12 md:h-10 rounded-lg font-medium',
                  'transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  canRunWrapper && !isWrapperRunning
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 active:scale-98'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                )}
              >
                {isWrapperRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running... ({Math.round(wrapperProgress)}%)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run CHP Wrapper</span>
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {isWrapperRunning && (
                <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-100"
                    style={{ width: `${wrapperProgress}%` }}
                  />
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
            </StaffControlCard>

            {/* Card 4: Wrapper History */}
            <StaffControlCard title="Wrapper History" icon={History} animationDelay={400}>
              {localJob.wrapperRuns.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No wrapper runs yet. Results will appear here after running the CHP wrapper.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {[...localJob.wrapperRuns].reverse().map((run, index) => {
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
                              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
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

            {/* Card 5: Auto-Checker - Hide when full report exists */}
            {!localJob.fullReportToken && (
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
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 active:scale-98'
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

            {/* Card 6: Escalation - Only show if NO reports obtained */}
            {!localJob.facePageToken && !localJob.fullReportToken && (
              <StaffControlCard title="Escalation" icon={AlertTriangle} animationDelay={600}>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <p className="text-xs text-amber-400">
                    Use when automation fails multiple times and manual in-person pickup at CHP office
                    is required.
                  </p>
                </div>

                <button
                  onClick={() => setShowEscalationDialog(true)}
                  disabled={isEscalated}
                  className={cn(
                    'w-full h-12 md:h-10 rounded-lg font-medium',
                    'transition-all duration-200',
                    'flex items-center justify-center gap-2',
                    isEscalated
                      ? 'bg-amber-600/30 text-amber-400 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-500 active:scale-98'
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isEscalated ? 'Already Escalated' : 'Escalate to Manual Pickup'}</span>
                </button>

                <p className="text-xs text-slate-500 mt-3">
                  All staff can see escalated jobs globally.
                </p>
              </StaffControlCard>
            )}

            {/* Card 7: Manual Completion - Only show if NO reports obtained */}
            {!localJob.facePageToken && !localJob.fullReportToken && (
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
                      className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 focus:ring-teal-500/20"
                    />
                    <span className="text-sm text-slate-300">Face Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadType"
                      checked={uploadType === 'full'}
                      onChange={() => setUploadType('full')}
                      className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 focus:ring-teal-500/20"
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
                    'border-slate-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
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
