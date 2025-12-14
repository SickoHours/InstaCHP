'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import {
  FileText,
  Download,
  Sparkles,
  FileCheck,
  RefreshCw,
  Clock,
  Settings,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData } from '@/context/MockDataContext';
import { useTheme } from '@/context/ThemeContext';
import {
  getPublicStatus,
  getStatusColor,
  getStatusMessage,
  formatPublicStatus,
  isCompletedStatus,
} from '@/lib/statusMapping';
import type { FlowStep, PassengerVerificationData, RescueFormData, WrapperResult, ReportTypeHint, Job, EventType, AutoCheckSettings, InternalStatus } from '@/lib/types';
import { DEFAULT_AUTO_CHECK_SETTINGS } from '@/lib/types';
import TimelineMessage from '@/components/ui/TimelineMessage';
import CHPNudge from '@/components/ui/CHPNudge';
import InlineFieldsCard from '@/components/ui/InlineFieldsCard';
import FlowWizard, { type FlowCompletionData } from '@/components/ui/FlowWizard';
import DriverInfoRescueForm from '@/components/ui/DriverInfoRescueForm';
import ContactingCHPBanner from '@/components/ui/ContactingCHPBanner';
import FacePageCompletionChoice from '@/components/ui/FacePageCompletionChoice';
import AutoCheckSetupFlow from '@/components/ui/AutoCheckSetupFlow';
import FacePageReopenBanner from '@/components/ui/FacePageReopenBanner';
import AuthorizationUploadCard from '@/components/ui/AuthorizationUploadCard';
import { DEV_CONFIG, getDelay } from '@/lib/devConfig';
import {
  shouldShowDriverPassengerQuestions,
  shouldShowPage2Verification,
  shouldShowWrapperUI,
  shouldShowAutoChecker,
} from '@/lib/jobUIHelpers';
import { notificationManager } from '@/lib/notificationManager';

/**
 * Status Badge with glow effect - Theme-aware
 */
function StatusBadge({
  internalStatus,
}: {
  internalStatus: InternalStatus;
}) {
  const publicStatus = getPublicStatus(internalStatus);
  const color = getStatusColor(internalStatus);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const glowColors: Record<string, string> = {
    gray: 'shadow-slate-500/20',
    blue: 'shadow-blue-500/30',
    yellow: 'shadow-yellow-500/30',
    green: 'shadow-emerald-500/30',
    amber: 'shadow-amber-500/30',
    red: 'shadow-red-500/30',
  };

  const bgColorsDark: Record<string, string> = {
    gray: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
    blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    green: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    red: 'bg-red-500/20 text-red-200 border-red-500/30',
  };

  const bgColorsLight: Record<string, string> = {
    gray: 'bg-slate-100 text-slate-700 border-slate-300',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  const bgColors = isDark ? bgColorsDark : bgColorsLight;
  const isActive = ['blue', 'yellow'].includes(color);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'text-sm font-medium border',
        'transition-all duration-300',
        bgColors[color],
        isDark && glowColors[color],
        isDark && isActive && 'animate-glow-pulse'
      )}
    >
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {formatPublicStatus(publicStatus)}
    </span>
  );
}

/**
 * Download Button with glow hover effect - Theme-aware
 */
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full flex items-center gap-4 p-4 rounded-xl',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        variant === 'primary' && [
          'bg-gradient-to-r from-amber-500/90 to-amber-600/90',
          'border border-amber-400/30',
          'hover:from-amber-400/90 hover:to-amber-500/90',
          'shadow-lg shadow-amber-400/20',
          'hover:shadow-xl hover:shadow-amber-400/30',
        ],
        variant === 'secondary' && [
          'glass-subtle',
          isDark ? 'border-slate-600/30' : 'border-slate-300',
          'border',
          'hover:border-amber-400/30',
        ]
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg',
          variant === 'primary'
            ? 'bg-white/10'
            : 'bg-amber-400/10'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6',
            variant === 'primary' ? 'text-white' : 'text-amber-500'
          )}
        />
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p
          className={cn(
            'font-semibold',
            variant === 'primary'
              ? 'text-white'
              : isDark ? 'text-slate-200' : 'text-slate-800'
          )}
        >
          {label}
        </p>
        {subLabel && (
          <p
            className={cn(
              'text-sm',
              variant === 'primary'
                ? 'text-amber-100'
                : isDark ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {subLabel}
          </p>
        )}
      </div>

      {/* Arrow */}
      <Download
        className={cn(
          'w-5 h-5 transition-transform duration-300',
          'group-hover:translate-y-0.5',
          variant === 'primary'
            ? 'text-white/70'
            : isDark ? 'text-slate-500' : 'text-slate-400'
        )}
      />

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          variant === 'primary'
            ? 'shadow-[0_0_40px_rgba(251,191,36,0.3)]'
            : 'shadow-[0_0_30px_rgba(251,191,36,0.15)]'
        )}
      />
    </button>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const timelineRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Context data operations
  const {
    getJobById,
    getUserFacingEvents,
    updateJob,
    addEvent,
  } = useMockData();

  // Get job data (will re-render when data changes via context)
  const job = getJobById(jobId);

  // Get user-facing events for timeline
  const events = job ? getUserFacingEvents(jobId) : [];

  // Loading state for interactive actions
  const [isInteracting, setIsInteracting] = useState(false);

  // Auto-checker state (V1.4.0+)
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [autoCheckResult, setAutoCheckResult] = useState<'found' | 'not_found' | null>(null);
  const [showAutoCheckSetup, setShowAutoCheckSetup] = useState(false);

  // Timeline visibility for closed jobs (V1.5.0+)
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  // Auto-scroll to bottom of timeline on load
  useEffect(() => {
    if (timelineRef.current) {
      setTimeout(() => {
        timelineRef.current?.scrollTo({
          top: timelineRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 800);
    }
  }, [events.length]);

  // Auto-hide CHP nudge when status changes from NEW
  useEffect(() => {
    if (!job) return;

    if (job.internalStatus !== 'NEW' && job.interactiveState && !job.interactiveState.chpNudgeDismissed) {
      updateJob(jobId, {
        interactiveState: {
          ...job.interactiveState,
          chpNudgeDismissed: true,
        },
      });
    }
  }, [job, jobId, updateJob]);

  // Handle 404
  if (!job) {
    notFound();
  }

  const publicStatus = getPublicStatus(job.internalStatus);
  const statusMessage = getStatusMessage(job.internalStatus);
  const hasDownloads = job.facePageToken || job.fullReportToken;

  // Show face page choice when: face page exists, no full report, FACE_PAGE_ONLY status, choice not yet made (V1.6.0+)
  const shouldShowFacePageChoice = !!(
    job.facePageToken &&
    !job.fullReportToken &&
    job.internalStatus === 'FACE_PAGE_ONLY' &&
    !job.facePageChoiceMade
  );

  // Show check button when: face page exists, no full report, waiting status, choice was 'wait' (V1.4.0+, updated V1.6.0)
  const shouldShowCheckButton = !!(
    job.facePageToken &&
    !job.fullReportToken &&
    ['WAITING_FOR_FULL_REPORT'].includes(job.internalStatus) &&
    job.facePageChoiceMade === 'wait'
  );

  // Show reopen banner when: completed with face page only (V1.6.0+)
  const shouldShowReopenBanner = job.internalStatus === 'COMPLETED_FACE_PAGE_ONLY';

  // Show authorization upload when: escalated to manual pickup and auth not yet uploaded (V1.6.0+)
  const shouldShowAuthorizationUpload = !!(
    job.internalStatus === 'NEEDS_IN_PERSON_PICKUP' &&
    job.escalationData?.status === 'pending_authorization'
  );

  // Get auto-check settings (default if not set)
  const autoCheckSettings = job.autoCheckSettings || DEFAULT_AUTO_CHECK_SETTINGS;

  // Closed job state (completed or cancelled) (V1.5.0+)
  const isCompleted = isCompletedStatus(job.internalStatus);
  const isCancelled = job.internalStatus === 'CANCELLED';
  const isClosedJob = isCompleted || isCancelled;

  // Mock download handler
  const handleDownload = (type: 'face' | 'full') => {
    alert(
      `[V1 Mock] Download ${type === 'face' ? 'Face Page' : 'Full Report'} would happen here.\n\nIn V2, this will fetch from Convex Storage.`
    );
  };

  /**
   * Handle law firm manual auto-check (V1.4.0+)
   * Unlimited manual clicks per requirements
   */
  const handleAutoCheck = async () => {
    if (isAutoChecking) return;

    setIsAutoChecking(true);
    setAutoCheckResult(null);

    // Add event to timeline
    addEvent(jobId, {
      eventType: 'auto_check_started',
      message: "Checking if your full report is ready...",
      isUserFacing: true,
    });

    // Auto-check delay (uses dev config for faster testing)
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay('autoCheck'))
    );

    // 20% chance of finding full report (matching staff side)
    const found = Math.random() < 0.2;

    if (found) {
      // Update job with full report
      updateJob(jobId, {
        fullReportToken: `fr_token_${Date.now()}`,
        internalStatus: 'COMPLETED_FULL_REPORT',
        autoCheckSettings: {
          ...autoCheckSettings,
          lastManualCheck: Date.now(),
        },
      });

      addEvent(jobId, {
        eventType: 'auto_check_found',
        message: "Great news! Your full report is now available for download.",
        isUserFacing: true,
      });

      setAutoCheckResult('found');
    } else {
      // Update last check time only
      updateJob(jobId, {
        autoCheckSettings: {
          ...autoCheckSettings,
          lastManualCheck: Date.now(),
        },
      });

      // Dynamic message based on frequency settings
      const notFoundMessage = autoCheckSettings.frequency === 'daily'
        ? "The full report isn't ready yet. We'll check again at 4:30 PM PT."
        : "The full report isn't ready yet. Next check at 9:00 AM or 4:30 PM PT.";

      addEvent(jobId, {
        eventType: 'auto_check_not_found',
        message: notFoundMessage,
        isUserFacing: true,
      });

      setAutoCheckResult('not_found');
    }

    setIsAutoChecking(false);
  };

  /**
   * Handle auto-check settings update (V1.4.0+)
   */
  const handleUpdateAutoCheckSettings = (newSettings: Partial<AutoCheckSettings>) => {
    updateJob(jobId, {
      autoCheckSettings: {
        ...autoCheckSettings,
        ...newSettings,
      },
    });
  };

  /**
   * Handle face page completion choice (V1.6.0+)
   * Law firm chooses to complete with face page or set up auto-checker
   */
  const handleFacePageChoice = (choice: 'complete' | 'wait') => {
    const now = Date.now();

    if (choice === 'complete') {
      // Complete the request with just the face page
      updateJob(jobId, {
        internalStatus: 'COMPLETED_FACE_PAGE_ONLY',
        facePageChoiceMade: 'complete',
        facePageChoiceTimestamp: now,
      });

      addEvent(jobId, {
        eventType: 'face_page_complete_chosen',
        message: "You've completed your request with the face page.",
        isUserFacing: true,
      });
    } else {
      // Show auto-checker setup flow instead of immediately enabling
      setShowAutoCheckSetup(true);
    }
  };

  /**
   * Handle auto-checker setup save (V1.6.0+)
   * Called when user saves their frequency selection from AutoCheckSetupFlow
   */
  const handleAutoCheckSetupSave = (frequency: 'daily' | 'twice_daily') => {
    const now = Date.now();
    const scheduledTimes = frequency === 'daily'
      ? [{ hour: 16, minute: 30 }]
      : [{ hour: 9, minute: 0 }, { hour: 16, minute: 30 }];

    // Save settings and update status
    updateJob(jobId, {
      internalStatus: 'WAITING_FOR_FULL_REPORT',
      facePageChoiceMade: 'wait',
      facePageChoiceTimestamp: now,
      autoCheckSettings: {
        enabled: true,
        frequency,
        scheduledTimes,
        scheduledChecksToday: 0,
      },
    });

    // Add activity feed message reflecting actual settings
    const message = frequency === 'daily'
      ? "Auto-checker enabled. We'll check daily at 4:30 PM PT."
      : "Auto-checker enabled. We'll check twice daily at 9:00 AM and 4:30 PM PT.";

    addEvent(jobId, {
      eventType: 'auto_check_settings_updated',
      message,
      isUserFacing: true,
    });

    // Hide setup flow
    setShowAutoCheckSetup(false);
  };

  /**
   * Handle auto-checker setup cancel
   */
  const handleAutoCheckSetupCancel = () => {
    setShowAutoCheckSetup(false);
  };

  /**
   * Handle reopening a face-page-completed job (V1.6.0+)
   * Runs auto-check and potentially changes status back to waiting
   */
  const handleReopenFacePageJob = async () => {
    setIsAutoChecking(true);
    setAutoCheckResult(null);

    // Add event to timeline
    addEvent(jobId, {
      eventType: 'face_page_reopened',
      message: "Checking if your full report is ready...",
      isUserFacing: true,
    });

    // Auto-check delay (uses dev config for faster testing)
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay('autoCheck'))
    );

    // 20% chance of finding full report (matching staff side)
    const found = Math.random() < 0.2;

    if (found) {
      // Found! Update to full report complete
      updateJob(jobId, {
        fullReportToken: `fr_token_${Date.now()}`,
        internalStatus: 'COMPLETED_FULL_REPORT',
        reopenedFromFacePageComplete: true,
        autoCheckSettings: {
          ...autoCheckSettings,
          lastManualCheck: Date.now(),
        },
      });

      addEvent(jobId, {
        eventType: 'auto_check_found',
        message: "Great news! Your full report is now available for download.",
        isUserFacing: true,
      });

      setAutoCheckResult('found');
    } else {
      // Not found - move to waiting status with auto-checker enabled
      updateJob(jobId, {
        internalStatus: 'WAITING_FOR_FULL_REPORT',
        facePageChoiceMade: 'wait',
        reopenedFromFacePageComplete: true,
        autoCheckSettings: {
          ...DEFAULT_AUTO_CHECK_SETTINGS,
          enabled: true,
          lastManualCheck: Date.now(),
        },
      });

      addEvent(jobId, {
        eventType: 'auto_check_not_found',
        message: "The full report isn't ready yet. We'll check again at 4:30 PM PT.",
        isUserFacing: true,
      });

      setAutoCheckResult('not_found');
    }

    setIsAutoChecking(false);
  };

  /**
   * Handle authorization document upload for escalated jobs (V1.6.0+)
   * Called when law firm uploads auth document for manual pickup
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAuthorizationUpload = async (_file: File) => {
    // Mock upload delay (file not used in V1 mock - will be uploaded to storage in V2)
    await new Promise((resolve) => setTimeout(resolve, getDelay('fileUpload')));

    // Update job with authorization received
    const updatedEscalationData = {
      ...job.escalationData!,
      status: 'authorization_received' as const,
      authorizationDocumentToken: `auth_${Date.now()}`,
      authorizationUploadedAt: Date.now(),
    };

    updateJob(jobId, {
      escalationData: updatedEscalationData,
    });

    // Create updated job for notification
    const updatedJob = {
      ...job,
      escalationData: updatedEscalationData,
    };

    // Emit notification: authorization uploaded
    notificationManager.emitAuthorizationUploaded(updatedJob);

    // Add user-facing event
    addEvent(jobId, {
      eventType: 'authorization_uploaded',
      message: 'Thank you! We received your authorization document and will begin processing your request.',
      isUserFacing: true,
    });
  };

  // Handle flow wizard step changes
  const handleFlowStepChange = (step: FlowStep, data?: Record<string, unknown>) => {
    setIsInteracting(true);

    // Update job with new step and any collected data
    const updateData: Record<string, unknown> = {
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: job.interactiveState?.driverPassengerAsked || false,
        chpNudgeDismissed: job.interactiveState?.chpNudgeDismissed || false,
        flowStep: step,
      },
    };

    // If client type was selected (moving from selection step)
    if (data?.clientType) {
      updateData.clientType = data.clientType;
      (updateData.interactiveState as Record<string, unknown>).driverPassengerAsked = true;

      // Add selection event
      addEvent(jobId, {
        eventType: data.clientType === 'driver' ? 'driver_selected' : 'passenger_selected',
        message: `You selected: ${data.clientType === 'driver' ? 'Driver' : 'Passenger'}`,
        isUserFacing: true,
      });
    }

    // If passenger verification was submitted
    if (data?.passengerVerification) {
      const verification = data.passengerVerification as PassengerVerificationData;
      (updateData.interactiveState as Record<string, unknown>).passengerVerification = verification;

      // Build summary of provided info
      const parts: string[] = [];
      if (verification.additionalNames?.length) {
        parts.push(`${verification.additionalNames.length} additional name(s)`);
      }
      if (verification.plate) parts.push('License Plate');
      if (verification.driverLicense) parts.push('Driver License');
      if (verification.vin) parts.push('VIN');

      if (parts.length > 0) {
        addEvent(jobId, {
          eventType: 'flow_verification_saved',
          message: `Thank you! We received: ${parts.join(', ')}`,
          isUserFacing: true,
        });
      } else {
        addEvent(jobId, {
          eventType: 'flow_verification_saved',
          message: 'Moving forward with the information we have.',
          isUserFacing: true,
        });
      }
    }

    // If speed up choice was made
    if (data?.speedUpAccepted !== undefined) {
      (updateData.interactiveState as Record<string, unknown>).speedUpOffered = true;
      (updateData.interactiveState as Record<string, unknown>).speedUpAccepted = data.speedUpAccepted;

      if (data.speedUpAccepted) {
        addEvent(jobId, {
          eventType: 'flow_speedup_yes',
          message: "Great! Let's get those details.",
          isUserFacing: true,
        });
      }
    }

    updateJob(jobId, updateData);
    setIsInteracting(false);
  };

  // Handle flow wizard completion
  const handleFlowComplete = async (data: FlowCompletionData) => {
    setIsInteracting(true);

    // Capture timestamp at handler invocation (not during render)
    const completedAt = Date.now(); // eslint-disable-line react-hooks/purity

    // Build update object
    const updateData: Record<string, unknown> = {
      clientType: data.clientType,
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: true,
        chpNudgeDismissed: false,
        flowStep: 'done' as FlowStep,
        speedUpOffered: true,
        speedUpAccepted: data.speedUpAccepted,
        passengerVerification: data.passengerVerification,
        crashDetailsProvided: !!data.crashDetails,
        flowCompletedAt: completedAt,
      },
    };

    // If crash details were provided
    if (data.crashDetails) {
      updateData.crashDate = data.crashDetails.crashDate || undefined;
      updateData.crashTime = data.crashDetails.crashTime || undefined;
      updateData.officerId = data.crashDetails.officerId || undefined;

      // Build summary
      const parts: string[] = [];
      if (data.crashDetails.crashDate) parts.push('Date');
      if (data.crashDetails.crashTime) parts.push('Time');
      if (data.crashDetails.officerId) parts.push('Officer ID');

      if (parts.length > 0) {
        addEvent(jobId, {
          eventType: 'flow_crash_details_saved',
          message: `Crash details saved: ${parts.join(', ')}`,
          isUserFacing: true,
        });
      }
    } else if (!data.speedUpAccepted) {
      // User skipped crash details
      addEvent(jobId, {
        eventType: 'flow_speedup_no',
        message: "No problem! We'll handle it from here.",
        isUserFacing: true,
      });
    }

    // Add flow completed event
    addEvent(jobId, {
      eventType: 'flow_completed',
      message: "All set! We're working on your request.",
      isUserFacing: true,
    });

    updateJob(jobId, updateData);

    // Check if we can trigger auto-wrapper
    const hasPage1Complete = !!(
      (data.crashDetails?.crashDate || job.crashDate) &&
      (data.crashDetails?.crashTime || job.crashTime)
    );
    const hasPage2Field = !!(
      job.firstName ||
      job.lastName ||
      job.plate ||
      job.driverLicense ||
      job.vin ||
      data.passengerVerification?.plate ||
      data.passengerVerification?.driverLicense ||
      data.passengerVerification?.vin ||
      (data.passengerVerification?.additionalNames?.length ?? 0) > 0
    );

    if (hasPage1Complete && hasPage2Field) {
      await runAutoWrapper(jobId);
    }

    setIsInteracting(false);
  };

  // Handle CHP nudge dismissal
  const handleDismissNudge = () => {
    updateJob(jobId, {
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: job.interactiveState?.driverPassengerAsked || false,
        chpNudgeDismissed: true,
      },
    });
  };

  // Helper to check if passenger verification info is missing
  const isPassengerInfoMissing = (targetJob: Job): boolean => {
    const pv = targetJob.interactiveState?.passengerVerification;
    return !pv || (
      !pv.plate &&
      !pv.driverLicense &&
      !pv.vin &&
      (!pv.additionalNames || pv.additionalNames.length === 0)
    );
  };

  // Handle helper collapse (soft dismiss "No thanks")
  const handleHelperCollapse = (variant: 'driver' | 'passenger') => {
    const eventType: EventType = variant === 'driver' ? 'driver_speedup_declined' : 'passenger_helper_declined';
    const message = variant === 'driver'
      ? "No problem! We'll handle it from here."
      : "Got it! We'll work with what we have.";

    addEvent(jobId, { eventType, message, isUserFacing: true });

    const collapsedField = variant === 'driver' ? 'driverHelperCollapsed' : 'passengerHelperCollapsed';
    const countField = variant === 'driver' ? 'driverDeclineCount' : 'passengerDeclineCount';

    updateJob(jobId, {
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: job.interactiveState?.driverPassengerAsked || false,
        chpNudgeDismissed: job.interactiveState?.chpNudgeDismissed || false,
        [collapsedField]: true,
        [countField]: (job.interactiveState?.[countField] || 0) + 1,
      },
    });
  };

  // Handle helper expand (re-open collapsed CTA)
  const handleHelperExpand = (variant: 'driver' | 'passenger') => {
    const eventType: EventType = variant === 'driver' ? 'driver_speedup_reopened' : 'passenger_helper_reopened';
    const message = variant === 'driver'
      ? "Let's add those crash details."
      : "Let's add that information.";

    addEvent(jobId, { eventType, message, isUserFacing: true });

    const collapsedField = variant === 'driver' ? 'driverHelperCollapsed' : 'passengerHelperCollapsed';

    updateJob(jobId, {
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: job.interactiveState?.driverPassengerAsked || false,
        chpNudgeDismissed: job.interactiveState?.chpNudgeDismissed || false,
        [collapsedField]: false,
      },
    });
  };

  // Run auto-wrapper (V1 mock) with new result types
  const runAutoWrapper = async (targetJobId: string) => {
    // Add "checking CHP" event
    addEvent(targetJobId, {
      eventType: 'auto_wrapper_triggered',
      message: "We're checking CHP for your report...",
      isUserFacing: true,
    });

    // Update status to show we're running
    updateJob(targetJobId, {
      internalStatus: 'AUTOMATION_RUNNING',
    });

    // Wrapper execution delay (uses dev config for faster testing)
    const startTime = Date.now();
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay('wrapperRun'))
    );
    const duration = Date.now() - startTime;

    // New result distribution:
    // 30% → FULL (page1 passed, page2 passed)
    // 35% → FACE_PAGE (page1 passed, face page available)
    // 15% → PAGE1_NOT_FOUND (page1 failed)
    // 15% → PAGE2_VERIFICATION_FAILED (page1 passed, page2 failed)
    // 5% → PORTAL_ERROR (technical issue)
    const random = Math.random();
    let result: WrapperResult;
    let page1Passed = false;
    let reportTypeHint: ReportTypeHint = 'UNKNOWN';

    if (random < 0.30) {
      result = 'FULL';
      page1Passed = true;
      reportTypeHint = 'FULL';
    } else if (random < 0.65) {
      result = 'FACE_PAGE';
      page1Passed = true;
      reportTypeHint = 'FACE_PAGE';
    } else if (random < 0.80) {
      result = 'PAGE1_NOT_FOUND';
      page1Passed = false;
      reportTypeHint = 'UNKNOWN'; // Page 1 failed, no report type known
    } else if (random < 0.95) {
      result = 'PAGE2_VERIFICATION_FAILED';
      page1Passed = true;
      // When Page 2 verification fails, we still know the report type
      // Randomly assign face page or full (60% face page, 40% full)
      reportTypeHint = Math.random() < 0.6 ? 'FACE_PAGE' : 'FULL';
    } else {
      result = 'PORTAL_ERROR';
      page1Passed = false;
      reportTypeHint = 'UNKNOWN';
    }

    // Create wrapper run record
    const wrapperRun = {
      runId: `run_${Date.now()}`,
      timestamp: Date.now(),
      result,
      duration,
      page1Passed,
      reportTypeHint,
      errorMessage: result === 'PORTAL_ERROR' ? 'Portal timeout after 45 seconds' : undefined,
    };

    // Get current job to append wrapper run
    const currentJob = getJobById(targetJobId);
    const wrapperRuns = [...(currentJob?.wrapperRuns || []), wrapperRun];

    // Update job and add result event based on result type
    if (result === 'FULL') {
      updateJob(targetJobId, {
        internalStatus: 'COMPLETED_FULL_REPORT',
        fullReportToken: `MOCK_FULL_${Date.now()}`,
        wrapperRuns,
      });
      addEvent(targetJobId, {
        eventType: 'auto_wrapper_success',
        message: 'Great news! Your full report is ready to download.',
        isUserFacing: true,
      });
    } else if (result === 'FACE_PAGE') {
      updateJob(targetJobId, {
        internalStatus: 'FACE_PAGE_ONLY',
        facePageToken: `MOCK_FACE_${Date.now()}`,
        wrapperRuns,
      });
      addEvent(targetJobId, {
        eventType: 'auto_wrapper_success',
        message: "We've received a preliminary copy (face page). The full report may take a few more days.",
        isUserFacing: true,
      });
    } else if (result === 'PAGE1_NOT_FOUND') {
      updateJob(targetJobId, {
        internalStatus: 'NEEDS_MORE_INFO',
        wrapperRuns,
      });
      addEvent(targetJobId, {
        eventType: 'page1_not_found',
        message: "We couldn't find a report with those details. Please check the crash date, time, and officer ID.",
        isUserFacing: true,
      });
    } else if (result === 'PAGE2_VERIFICATION_FAILED') {
      // Build message with report type hint
      const reportTypeText = reportTypeHint === 'FULL'
        ? 'The full report is available'
        : reportTypeHint === 'FACE_PAGE'
          ? 'A preliminary copy (face page) is available'
          : 'Your report is available';

      updateJob(targetJobId, {
        internalStatus: 'NEEDS_MORE_INFO',
        wrapperRuns,
      });
      addEvent(targetJobId, {
        eventType: 'page2_verification_needed',
        message: `We found your report! ${reportTypeText}, but we need additional identifiers to verify and retrieve it.`,
        isUserFacing: true,
      });
    } else {
      // PORTAL_ERROR
      updateJob(targetJobId, {
        internalStatus: 'AUTOMATION_ERROR',
        wrapperRuns,
      });
      addEvent(targetJobId, {
        eventType: 'auto_wrapper_failed',
        message: "We encountered a technical issue. We'll try again automatically.",
        isUserFacing: true,
      });
    }
  };

  // Handle unified save for all Page 1 + Page 2 fields
  const handleSaveAllFields = async (allData: {
    page1: { crashDate: string; crashTime: string; officerId: string };
    page2: { firstName: string; lastName: string; plate: string; driverLicense: string; vin: string };
  }) => {
    // Update job with all data
    updateJob(jobId, {
      crashDate: allData.page1.crashDate,
      crashTime: allData.page1.crashTime,
      officerId: allData.page1.officerId,
      firstName: allData.page2.firstName,
      lastName: allData.page2.lastName,
      plate: allData.page2.plate,
      driverLicense: allData.page2.driverLicense,
      vin: allData.page2.vin,
    });

    // Add timeline events for updates
    const hasPage1Data = !!(allData.page1.crashDate || allData.page1.crashTime || allData.page1.officerId);
    const hasPage2Data = !!(
      allData.page2.firstName ||
      allData.page2.lastName ||
      allData.page2.plate ||
      allData.page2.driverLicense ||
      allData.page2.vin
    );

    if (hasPage1Data) {
      addEvent(jobId, {
        eventType: 'page1_updated',
        message: 'Crash details updated',
        isUserFacing: true,
      });
    }
    if (hasPage2Data) {
      addEvent(jobId, {
        eventType: 'page2_updated',
        message: 'Driver information updated',
        isUserFacing: true,
      });
    }

    // Check auto-wrapper prerequisites
    const hasPage1Complete = !!(allData.page1.crashDate && allData.page1.crashTime);
    const hasPage2Field = !!(
      allData.page2.firstName ||
      allData.page2.lastName ||
      allData.page2.plate ||
      allData.page2.driverLicense ||
      allData.page2.vin
    );

    // IMPORTANT: Only trigger if BOTH prerequisites met (prevents wrapper failure)
    if (hasPage1Complete && hasPage2Field) {
      await runAutoWrapper(jobId);
    }
  };

  // Handle rescue form submission (for PAGE2_VERIFICATION_FAILED)
  const handleRescueSubmit = async (rescueData: RescueFormData) => {
    setIsInteracting(true);

    // Update job with rescue data
    updateJob(jobId, {
      plate: rescueData.plate || job.plate,
      driverLicense: rescueData.driverLicense || job.driverLicense,
      vin: rescueData.vin || job.vin,
      interactiveState: {
        ...job.interactiveState,
        driverPassengerAsked: job.interactiveState?.driverPassengerAsked || false,
        chpNudgeDismissed: job.interactiveState?.chpNudgeDismissed || false,
        rescueInfoProvided: true,
        rescueInfoTimestamp: Date.now(),
        rescueFormData: rescueData,
      },
    });

    // Build summary of provided rescue info
    const parts: string[] = [];
    if (rescueData.plate) parts.push('License Plate');
    if (rescueData.driverLicense) parts.push("Driver's License");
    if (rescueData.vin) parts.push('VIN');
    if (rescueData.additionalNames.length > 0) {
      parts.push(`${rescueData.additionalNames.length} name(s)`);
    }

    // Add event for rescue info saved
    addEvent(jobId, {
      eventType: 'rescue_info_saved',
      message: `Additional information saved: ${parts.join(', ')}`,
      isUserFacing: true,
    });

    // Re-run the wrapper with rescue data
    await runAutoWrapper(jobId);

    setIsInteracting(false);
  };

  // Determine if CHP nudge should be shown
  const shouldShowNudge =
    job.internalStatus === 'NEW' &&
    job.clientType !== null &&
    !job.interactiveState?.chpNudgeDismissed &&
    job.interactiveState?.flowStep === 'done'; // Only show after wizard completes

  // Determine if flow wizard is active (not completed)
  const isWizardActive =
    !job.interactiveState?.flowStep ||
    job.interactiveState.flowStep !== 'done';

  // Check if rescue form should be shown (PAGE2_VERIFICATION_FAILED and not yet resolved)
  const needsRescue = !!(
    job.wrapperRuns?.some((run) => run.result === 'PAGE2_VERIFICATION_FAILED') &&
    !job.interactiveState?.rescueInfoProvided &&
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'COMPLETED_FACE_PAGE_ONLY', 'FACE_PAGE_ONLY', 'CANCELLED'].includes(job.internalStatus)
  );

  // Check if Page 1 correction is needed (PAGE1_NOT_FOUND)
  const needsPage1Correction = !!(
    job.wrapperRuns?.some((run) => run.result === 'PAGE1_NOT_FOUND') &&
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'COMPLETED_FACE_PAGE_ONLY', 'FACE_PAGE_ONLY', 'CANCELLED'].includes(job.internalStatus)
  );

  // Show InlineFieldsCard only for Page 1 corrections (not by default after wizard)
  // Per requirements: hide Driver Info by default, only show for corrections
  const showInlineFieldsCard =
    !isWizardActive &&
    needsPage1Correction &&
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'COMPLETED_FACE_PAGE_ONLY', 'CANCELLED'].includes(job.internalStatus);

  return (
    <div className="h-full overflow-auto">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-10 animate-page-entrance">
        {/* Client Info Header - Elevated Hero Section */}
        <div className="glass-elevated p-6 md:p-8 mb-6 md:mb-8">
          {/* Client Name */}
          <h1
            className={cn(
              'text-3xl md:text-4xl font-bold font-serif mb-3 animate-text-reveal',
              isDark ? 'text-white' : 'text-slate-900'
            )}
            style={{ animationDelay: '100ms' }}
          >
            {job.clientName}
          </h1>

          {/* Report Number */}
          <p
            className={cn(
              'font-mono text-sm md:text-base mb-4 animate-text-reveal',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}
            style={{ animationDelay: '200ms' }}
          >
            {job.reportNumber}
          </p>

          {/* Status Badge */}
          <div
            className="flex items-center gap-4 animate-text-reveal"
            style={{ animationDelay: '300ms' }}
          >
            <StatusBadge internalStatus={job.internalStatus} />

            {job.caseReference && (
              <span className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
                Case: {job.caseReference}
              </span>
            )}
          </div>
        </div>

        {/* Current Status Card - Hide when job is closed - V2.0: glass-surface */}
        {!isClosedJob && (
          <div
            className="glass-surface rounded-2xl p-5 mb-8 animate-text-reveal"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/10">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className={cn(
                  'text-sm font-semibold uppercase tracking-wider mb-1',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  Current Status
                </h2>
                <p className={cn(
                  'leading-relaxed',
                  isDark ? 'text-slate-200' : 'text-slate-700'
                )}>{statusMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Completed State: Downloads Section (Promoted to top) - V2.0: glass-elevated */}
        {isCompleted && hasDownloads && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: '400ms' }}
          >
            <div className="glass-elevated rounded-2xl p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Your Reports Are Ready</h2>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>Download your CHP crash report documents below.</p>
                </div>
              </div>

              <div className="space-y-3">
                {job.fullReportToken && (
                  <DownloadButton
                    label="Download Full Report"
                    subLabel="Complete CHP crash report (PDF)"
                    icon={FileCheck}
                    onClick={() => handleDownload('full')}
                    variant="primary"
                  />
                )}

                {job.facePageToken && (
                  <DownloadButton
                    label="Download Face Page"
                    subLabel="Preliminary report summary (PDF)"
                    icon={FileText}
                    onClick={() => handleDownload('face')}
                    variant={job.fullReportToken ? 'secondary' : 'primary'}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled State: Notice Card - V2.0: glass-surface */}
        {isCancelled && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: '400ms' }}
          >
            <div className="glass-surface rounded-2xl p-5 border-l-4 border-l-slate-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-500/10">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Request Cancelled</h2>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    This report request has been cancelled. If you believe this was in error, please contact us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHP Nudge (Optional - NEW status only) */}
        {shouldShowNudge && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: '450ms' }}
          >
            <CHPNudge
              reportNumber={job.reportNumber}
              onDismiss={handleDismissNudge}
            />
          </div>
        )}

        {/* Flow Wizard (active until completed) */}
        {/* Driver: hide when CONTACTING_CHP (CALL_IN_PROGRESS or AUTOMATION_RUNNING) */}
        {/* Passenger: show even during CONTACTING_CHP if info is missing */}
        {/* Fatal/Escalated: NEVER show questions (handled by shouldShowDriverPassengerQuestions) */}
        {shouldShowDriverPassengerQuestions(job) && isWizardActive && !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'COMPLETED_FACE_PAGE_ONLY', 'CANCELLED', 'WAITING_FOR_FULL_REPORT', 'FACE_PAGE_ONLY'].includes(
          job.internalStatus
        ) && !(
          // Hide driver wizard completely during CONTACTING_CHP
          job.clientType === 'driver' &&
          ['CALL_IN_PROGRESS', 'AUTOMATION_RUNNING'].includes(job.internalStatus)
        ) && (
          <div
            className="mb-6 animate-text-reveal"
            style={{ animationDelay: '450ms' }}
          >
            <FlowWizard
              job={job}
              onStepChange={handleFlowStepChange}
              onComplete={handleFlowComplete}
              onCollapse={handleHelperCollapse}
              onExpand={handleHelperExpand}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Contacting CHP Banner (Passenger only, when info missing, NOT fatal/escalated) */}
        {shouldShowDriverPassengerQuestions(job) &&
          publicStatus === 'CONTACTING_CHP' &&
          job.clientType === 'passenger' &&
          isPassengerInfoMissing(job) && (
          <div
            className="mb-6 animate-text-reveal"
            style={{ animationDelay: '450ms' }}
          >
            <ContactingCHPBanner
              onProvideInfo={() => handleHelperExpand('passenger')}
              onDismiss={() => handleHelperCollapse('passenger')}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Unified Inline Fields Card - Shown only for Page 1 corrections (NOT fatal/escalated) */}
        {shouldShowWrapperUI(job) && showInlineFieldsCard && (
          <div className="mb-8">
            <InlineFieldsCard
              page1Data={{
                crashDate: job.crashDate || '',
                crashTime: job.crashTime || '',
                officerId: job.officerId || '',
              }}
              page2Data={{
                firstName: job.firstName || '',
                lastName: job.lastName || '',
                plate: job.plate || '',
                driverLicense: job.driverLicense || '',
                vin: job.vin || '',
              }}
              onSave={handleSaveAllFields}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Driver Info Rescue Form - Shown when Page 2 verification fails (NOT fatal/escalated) */}
        {shouldShowPage2Verification(job) && needsRescue && (
          <div className="mb-8 animate-text-reveal" style={{ animationDelay: '450ms' }}>
            <DriverInfoRescueForm
              initialData={job.interactiveState?.rescueFormData}
              onSubmit={handleRescueSubmit}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Timeline Section - Collapsible for closed jobs */}
        <div className="mb-8">
          {isClosedJob ? (
            // Closed job: Show toggle link
            <>
              <button
                onClick={() => setTimelineExpanded(!timelineExpanded)}
                className={cn(
                  'flex items-center gap-2 text-sm transition-colors mb-4 animate-text-reveal',
                  isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'
                )}
                style={{ animationDelay: '500ms' }}
              >
                {timelineExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span className="font-semibold uppercase tracking-wider">
                  {timelineExpanded ? 'Hide Activity Timeline' : `Show Activity Timeline (${events.length} events)`}
                </span>
              </button>

              {timelineExpanded && (
                <div
                  ref={timelineRef}
                  className="relative max-h-[400px] md:max-h-[500px] overflow-y-auto pl-6 pr-2 pt-4 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent animate-text-reveal"
                >
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {events.map((event, index) => (
                        <TimelineMessage
                          key={event._id}
                          eventType={event.eventType}
                          message={event.message}
                          timestamp={event.timestamp}
                          animationDelay={100 + index * 100}
                          isLatest={index === events.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Active job: Show full timeline - V2.0: Glass container with connector
            <>
              <h2
                className={cn(
                  'text-sm font-semibold uppercase tracking-wider mb-4 animate-text-reveal',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
                style={{ animationDelay: '500ms' }}
              >
                Activity Timeline
              </h2>

              <div className="glass-surface rounded-xl p-4">
                <div
                  ref={timelineRef}
                  className="relative max-h-[400px] md:max-h-[500px] overflow-y-auto pl-6 pr-2 pt-4 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                  {/* Timeline connector line */}
                  {events.length > 1 && (
                    <div className="absolute left-[44px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-400/40 via-slate-600/30 to-transparent pointer-events-none" />
                  )}

                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-0 relative">
                      {events.map((event, index) => (
                        <TimelineMessage
                          key={event._id}
                          eventType={event.eventType}
                          message={event.message}
                          timestamp={event.timestamp}
                          animationDelay={600 + index * 150}
                          isLatest={index === events.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Face Page Completion Choice - When face page received but choice not made (V1.6.0+) */}
        {shouldShowFacePageChoice && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: `${600 + events.length * 150 + 100}ms` }}
          >
            <div className="glass-surface rounded-xl p-5 border border-emerald-500/20">
              {showAutoCheckSetup ? (
                <AutoCheckSetupFlow
                  onSave={handleAutoCheckSetupSave}
                  onCancel={handleAutoCheckSetupCancel}
                  disabled={isInteracting}
                />
              ) : (
                <FacePageCompletionChoice
                  onSelect={handleFacePageChoice}
                  clientName={job.clientName}
                  disabled={isInteracting}
                />
              )}
            </div>
          </div>
        )}

        {/* Reopen Banner - For face page completed jobs (V1.6.0+) */}
        {shouldShowReopenBanner && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: `${600 + events.length * 150 + 100}ms` }}
          >
            <FacePageReopenBanner
              onCheckNow={handleReopenFacePageJob}
              lastChecked={autoCheckSettings.lastManualCheck}
              disabled={isAutoChecking}
            />
          </div>
        )}

        {/* Authorization Upload - For escalated jobs pending auth (V1.6.0+) */}
        {shouldShowAuthorizationUpload && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: `${600 + events.length * 150 + 100}ms` }}
          >
            <AuthorizationUploadCard
              onUpload={handleAuthorizationUpload}
              uploaded={!!job.escalationData?.authorizationDocumentToken}
              uploadedAt={job.escalationData?.authorizationUploadedAt}
            />

            {/* DEV MODE: Skip upload button */}
            {DEV_CONFIG.skipFileUploads && !job.escalationData?.authorizationDocumentToken && (
              <button
                type="button"
                onClick={() => handleAuthorizationUpload(new File(['mock'], 'mock-auth.pdf', { type: 'application/pdf' }))}
                className="mt-3 px-3 py-1.5 text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
              >
                [DEV] Skip Upload
              </button>
            )}
          </div>
        )}

        {/* Auto-Check Section - For face page jobs without full report (V1.4.0+) */}
        {/* Also gated by shouldShowAutoChecker to hide for fatal/terminal escalations */}
        {shouldShowAutoChecker(job) && shouldShowCheckButton && (
          <div
            className="mb-8 animate-text-reveal"
            style={{ animationDelay: `${600 + events.length * 150 + 100}ms` }}
          >
            <h2 className={cn(
              'text-sm font-semibold uppercase tracking-wider mb-4',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Check for Full Report
            </h2>

            <div className="glass-surface rounded-xl p-5 border border-amber-400/20">
              {/* Main Check Button */}
              <button
                onClick={handleAutoCheck}
                disabled={isAutoChecking}
                className={cn(
                  'w-full flex items-center justify-center gap-3 p-4 rounded-xl',
                  'bg-gradient-to-r from-amber-500/90 to-cyan-600/90',
                  'border border-amber-400/30',
                  'text-white font-medium',
                  'transition-all duration-300',
                  'hover:from-amber-400/90 hover:to-cyan-500/90',
                  'hover:scale-[1.02]',
                  'hover:shadow-lg hover:shadow-amber-400/20',
                  'active:scale-[0.98]',
                  'disabled:opacity-70 disabled:cursor-wait',
                  'h-14 md:h-12'
                )}
              >
                {isAutoChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Check if Full Report Ready</span>
                  </>
                )}
              </button>

              {/* Result Message */}
              {autoCheckResult && !isAutoChecking && (
                <div
                  className={cn(
                    'mt-4 p-3 rounded-lg',
                    autoCheckResult === 'found'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-slate-800/30 border border-slate-700/30'
                  )}
                >
                  <p className={cn(
                    'text-sm',
                    autoCheckResult === 'found' ? 'text-emerald-400' : 'text-slate-400'
                  )}>
                    {autoCheckResult === 'found'
                      ? 'Full report is now available! Check downloads below.'
                      : autoCheckSettings.frequency === 'daily'
                        ? "Not ready yet. We'll check again at 4:30 PM PT."
                        : "Not ready yet. Next check at 9:00 AM or 4:30 PM PT."}
                  </p>
                </div>
              )}

              {/* Last Check Info */}
              {autoCheckSettings.lastManualCheck && (
                <div className={cn(
                  "mt-3 flex items-center gap-2 text-xs",
                  isDark ? 'text-slate-500' : 'text-slate-600'
                )}>
                  <Clock className="w-3 h-3" />
                  <span>
                    Last checked: {new Date(autoCheckSettings.lastManualCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Auto-Check Settings (Always Visible) */}
              <div className={cn(
                "mt-4 pt-4 border-t",
                isDark ? 'border-slate-700/50' : 'border-slate-200'
              )}>
                <h4 className={cn(
                  "text-sm font-semibold mb-3 flex items-center gap-2",
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}>
                  <Settings className="w-4 h-4 text-amber-400" />
                  Auto-Check Settings
                </h4>

                {/* Frequency Selection - Side by Side */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleUpdateAutoCheckSettings({
                      frequency: 'daily',
                      scheduledTimes: [{ hour: 16, minute: 30 }]
                    })}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg',
                      'border transition-all duration-200',
                      'hover:scale-[1.01] active:scale-[0.99]',
                      autoCheckSettings.frequency === 'daily'
                        ? 'bg-amber-400/15 border-amber-400/40'
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      autoCheckSettings.frequency === 'daily'
                        ? 'border-amber-400 bg-amber-400'
                        : 'border-slate-500'
                    )}>
                      {autoCheckSettings.frequency === 'daily' && (
                        <Check className="w-2.5 h-2.5 text-slate-900" />
                      )}
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      autoCheckSettings.frequency === 'daily' ? 'text-amber-300' : 'text-slate-400'
                    )}>
                      Daily
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      autoCheckSettings.frequency === 'daily'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-slate-700/50 text-slate-500'
                    )}>
                      4:30 PM PT
                    </span>
                  </button>

                  <button
                    onClick={() => handleUpdateAutoCheckSettings({
                      frequency: 'twice_daily',
                      scheduledTimes: [{ hour: 9, minute: 0 }, { hour: 16, minute: 30 }]
                    })}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg',
                      'border transition-all duration-200',
                      'hover:scale-[1.01] active:scale-[0.99]',
                      autoCheckSettings.frequency === 'twice_daily'
                        ? 'bg-amber-400/15 border-amber-400/40'
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      autoCheckSettings.frequency === 'twice_daily'
                        ? 'border-amber-400 bg-amber-400'
                        : 'border-slate-500'
                    )}>
                      {autoCheckSettings.frequency === 'twice_daily' && (
                        <Check className="w-2.5 h-2.5 text-slate-900" />
                      )}
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      autoCheckSettings.frequency === 'twice_daily' ? 'text-amber-300' : 'text-slate-400'
                    )}>
                      Twice Daily
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        autoCheckSettings.frequency === 'twice_daily'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-700/50 text-slate-500'
                      )}>
                        9:00 AM PT
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        autoCheckSettings.frequency === 'twice_daily'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-700/50 text-slate-500'
                      )}>
                        4:30 PM PT
                      </span>
                    </div>
                  </button>
                </div>

                {/* V1 Mock Notice */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-400">
                    <strong>V1 Demo:</strong> Schedule settings are saved but actual automated
                    checks will be enabled in V2 with the Convex backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Section - Only show for non-completed jobs (completed shows downloads at top) */}
        {hasDownloads && !isCompleted && (
          <div
            className="space-y-3 animate-text-reveal"
            style={{ animationDelay: `${600 + events.length * 150 + 200}ms` }}
          >
            <h2 className={cn(
              'text-sm font-semibold uppercase tracking-wider mb-4',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Available Documents
            </h2>

            {job.fullReportToken && (
              <DownloadButton
                label="Download Full Report"
                subLabel="Complete CHP crash report (PDF)"
                icon={FileCheck}
                onClick={() => handleDownload('full')}
                variant="primary"
              />
            )}

            {job.facePageToken && (
              <DownloadButton
                label="Download Face Page"
                subLabel="Preliminary report summary (PDF)"
                icon={FileText}
                onClick={() => handleDownload('face')}
                variant={job.fullReportToken ? 'secondary' : 'primary'}
              />
            )}
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-8" />
      </main>
    </div>
  );
}
