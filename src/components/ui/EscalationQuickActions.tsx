'use client';

import { useState, useCallback } from 'react';
import {
  User,
  Calendar,
  Download,
  Upload,
  Search,
  Loader2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Job, EscalationStep, PickupTimeSlot } from '@/lib/types';
import {
  getEscalationStep,
  getAvailableEscalationSteps,
  isEscalationStepCompleted,
  isFatalJob,
  hasAuthorizationUploaded,
} from '@/lib/jobUIHelpers';
import { notificationManager } from '@/lib/notificationManager';
import StepProgress from './StepProgress';
import BottomSheet from './BottomSheet';
import PickupScheduler from './PickupScheduler';
import ManualCompletionSheet from './ManualCompletionSheet';

interface EscalationQuickActionsProps {
  /** The escalated job */
  job: Job;
  /** Callback when any action mutates the job */
  onJobUpdate: (updatedJob: Job) => void;
  /** Optional additional className */
  className?: string;
}

/**
 * Step configuration - labels, icons, and styles
 */
const STEP_CONFIG: Record<EscalationStep, {
  label: string;
  actionLabel: string;
  icon: typeof User;
  buttonStyle: string;
}> = {
  claim: {
    label: 'Claim Pickup',
    actionLabel: 'Claim This Pickup',
    icon: User,
    buttonStyle: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-500/20',
  },
  schedule: {
    label: 'Schedule Time',
    actionLabel: 'Schedule Pickup Time',
    icon: Calendar,
    buttonStyle: 'bg-gradient-to-r from-amber-500 to-cyan-600 hover:from-amber-400 hover:to-cyan-500 shadow-amber-400/20',
  },
  download_auth: {
    label: 'Download Auth',
    actionLabel: 'Download Authorization',
    icon: Download,
    buttonStyle: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
  },
  upload_report: {
    label: 'Upload Report',
    actionLabel: 'Upload Report',
    icon: Upload,
    buttonStyle: 'bg-slate-700 hover:bg-slate-600 border border-slate-600',
  },
  auto_check: {
    label: 'Check for Full',
    actionLabel: 'Check for Full Report',
    icon: Search,
    buttonStyle: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20',
  },
};

/**
 * EscalationQuickActions - Inline quick action buttons for escalated jobs
 *
 * Renders directly on the StaffJobCard to provide one-tap workflow progression.
 * Shows the current step's action button with a progress indicator.
 *
 * Flow: claim → schedule → download_auth → upload_report → (optional) auto_check
 */
export default function EscalationQuickActions({
  job,
  onJobUpdate,
  className,
}: EscalationQuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  // V1.9.0: Check if job has authorization uploaded (gate for all staff work)
  const hasAuth = hasAuthorizationUploaded(job);

  // Determine current step (computed regardless of hasAuth for hook consistency)
  const currentStep = getEscalationStep(job);
  const isFatal = isFatalJob(job);
  const config = STEP_CONFIG[currentStep];
  const Icon = config.icon;

  // Check if job is completed (all steps done)
  const availableSteps = getAvailableEscalationSteps(job);
  const allCompleted = availableSteps.every(step => isEscalationStepCompleted(job, step));

  // ============================================
  // ACTION HANDLERS (V1 Mock - Simulate delays)
  // All hooks must be defined before any conditional returns
  // ============================================

  // Handle claim action
  const handleClaim = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedJob: Job = {
      ...job,
      escalationData: {
        ...job.escalationData!,
        status: 'claimed',
        claimedBy: 'Staff Member',
        claimedAt: Date.now(),
      },
    };
    onJobUpdate(updatedJob);

    // Emit notification: pickup claimed
    notificationManager.emitPickupClaimed(updatedJob, 'Staff Member');

    setIsLoading(false);
  }, [job, onJobUpdate]);

  // Handle schedule action
  const handleSchedule = useCallback(async (time: PickupTimeSlot, date: string) => {
    const updatedJob: Job = {
      ...job,
      escalationData: {
        ...job.escalationData!,
        status: 'pickup_scheduled',
        scheduledPickupTime: time,
        scheduledPickupDate: date,
      },
    };
    onJobUpdate(updatedJob);

    // Emit notification: pickup scheduled
    notificationManager.emitPickupScheduled(updatedJob, time, date);

    setShowScheduleSheet(false);
  }, [job, onJobUpdate]);

  // Handle download auth acknowledgment
  const handleDownloadAuth = useCallback(() => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `authorization_${job._id}.pdf`;
    link.click();

    // Mark as acknowledged
    const updatedJob: Job = {
      ...job,
      escalationData: {
        ...job.escalationData!,
        authDocumentAcknowledged: true,
        authDocumentAcknowledgedAt: Date.now(),
      },
    };
    onJobUpdate(updatedJob);
  }, [job, onJobUpdate]);

  // Handle upload complete
  const handleUploadComplete = useCallback((type: 'face' | 'full', name?: string) => {
    const token = type === 'face'
      ? `fp_${job._id}_${Date.now()}`
      : `fr_${job._id}_${Date.now()}`;

    const updatedJob: Job = {
      ...job,
      ...(type === 'face' && {
        facePageToken: token,
        escalationData: {
          ...job.escalationData!,
          guaranteedName: name,
        },
      }),
      ...(type === 'full' && {
        fullReportToken: token,
        internalStatus: 'COMPLETED_MANUAL',
      }),
    };
    onJobUpdate(updatedJob);

    // Emit notification: report ready (only for full report, or face page if marked complete)
    if (type === 'full') {
      notificationManager.emitReportReady(updatedJob, 'full_report', token);
    }
  }, [job, onJobUpdate]);

  // Handle mark complete
  const handleMarkComplete = useCallback((notes: string) => {
    const updatedJob: Job = {
      ...job,
      internalStatus: 'COMPLETED_MANUAL',
      escalationData: {
        ...job.escalationData!,
        status: 'completed',
        completedAt: Date.now(),
        completedBy: 'Staff Member',
        pickupNotes: notes || undefined,
      },
    };
    onJobUpdate(updatedJob);

    // Emit notification: report ready (face page completion)
    const token = job.facePageToken || `fp_${job._id}_${Date.now()}`;
    notificationManager.emitReportReady(updatedJob, 'face_page', token);

    setShowUploadSheet(false);
  }, [job, onJobUpdate]);

  // Handle auto-check
  const handleAutoCheck = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 20% chance of finding full report (mock)
    const foundFull = Math.random() < 0.2;

    if (foundFull) {
      const updatedJob: Job = {
        ...job,
        fullReportToken: `fr_${job._id}_${Date.now()}`,
        internalStatus: 'COMPLETED_FULL_REPORT',
      };
      onJobUpdate(updatedJob);
    }

    setIsLoading(false);
  }, [job, onJobUpdate]);

  // Handle button click based on step
  const handleStepAction = useCallback(async () => {
    switch (currentStep) {
      case 'claim':
        await handleClaim();
        break;
      case 'schedule':
        setShowScheduleSheet(true);
        break;
      case 'download_auth':
        handleDownloadAuth();
        break;
      case 'upload_report':
        setShowUploadSheet(true);
        break;
      case 'auto_check':
        await handleAutoCheck();
        break;
    }
  }, [currentStep, handleClaim, handleDownloadAuth, handleAutoCheck]);

  // ============================================
  // CONDITIONAL RETURNS (after all hooks)
  // ============================================

  // If no authorization, show waiting message instead of actions
  if (!hasAuth) {
    return (
      <div className={cn('border-t border-slate-700/50 px-4 pb-4 pt-3', className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-amber-200 font-medium text-sm">
              Waiting for Authorization
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              The law firm needs to upload their authorization document before we can claim this pickup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if all steps completed
  if (allCompleted) {
    return (
      <div className={cn('border-t border-slate-700/50 px-4 pb-4 pt-3', className)}>
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Workflow Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border-t border-slate-700/50 px-4 pb-4 pt-3', className)}>
      {/* Progress indicator */}
      <StepProgress currentStep={currentStep} isFatal={isFatal} />

      {/* Primary action button */}
      <button
        onClick={handleStepAction}
        disabled={isLoading}
        className={cn(
          'w-full min-h-[48px] rounded-xl font-medium text-base',
          'flex items-center justify-between',
          'px-4 py-3',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'shadow-lg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          config.buttonStyle,
          'text-white'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="flex-1 text-center">Processing...</span>
            <div className="w-5" />
          </>
        ) : (
          <>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-center px-2">{config.actionLabel}</span>
            <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-70" />
          </>
        )}
      </button>

      {/* Schedule Pickup BottomSheet */}
      <BottomSheet
        isOpen={showScheduleSheet}
        onClose={() => setShowScheduleSheet(false)}
        title="Schedule Pickup"
        className="!bg-slate-900 [&]:backdrop-filter-none"
      >
        <PickupScheduler
          onClaim={handleClaim}
          onSchedule={handleSchedule}
          onDownloadAuth={handleDownloadAuth}
          claimed={!!job.escalationData?.claimedBy}
          claimedBy={job.escalationData?.claimedBy}
          scheduledTime={job.escalationData?.scheduledPickupTime}
          scheduledDate={job.escalationData?.scheduledPickupDate}
          hasAuthDocument={false}
        />
      </BottomSheet>

      {/* Upload Report BottomSheet */}
      <BottomSheet
        isOpen={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        title="Upload Report"
        className="!bg-slate-900 [&]:backdrop-filter-none"
      >
        <ManualCompletionSheet
          job={job}
          onUploadComplete={handleUploadComplete}
          onMarkComplete={handleMarkComplete}
          onClose={() => setShowUploadSheet(false)}
        />
      </BottomSheet>
    </div>
  );
}
