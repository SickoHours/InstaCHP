'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Download,
  Sparkles,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData } from '@/context/MockDataContext';
import {
  getPublicStatus,
  getStatusColor,
  getStatusMessage,
  formatPublicStatus,
  STATUS_COLORS,
} from '@/lib/statusMapping';
import type { FlowStep, PassengerVerificationData, RescueFormData, WrapperResult, ReportTypeHint } from '@/lib/types';
import TimelineMessage from '@/components/ui/TimelineMessage';
import CHPNudge from '@/components/ui/CHPNudge';
import InlineFieldsCard from '@/components/ui/InlineFieldsCard';
import FlowWizard, { type FlowCompletionData } from '@/components/ui/FlowWizard';
import DriverInfoRescueForm from '@/components/ui/DriverInfoRescueForm';

/**
 * Dark Mode Status Badge with glow effect
 */
function DarkStatusBadge({
  internalStatus,
}: {
  internalStatus: string;
}) {
  const publicStatus = getPublicStatus(internalStatus as any);
  const color = getStatusColor(internalStatus as any);

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
      {formatPublicStatus(publicStatus)}
    </span>
  );
}

/**
 * Download Button with glow hover effect
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
          'hover:shadow-xl hover:shadow-teal-500/30',
        ],
        variant === 'secondary' && [
          'glass-card-dark',
          'border border-slate-600/30',
          'hover:border-teal-500/30',
        ]
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg',
          variant === 'primary'
            ? 'bg-white/10'
            : 'bg-teal-500/10'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6',
            variant === 'primary' ? 'text-white' : 'text-teal-400'
          )}
        />
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p
          className={cn(
            'font-semibold',
            variant === 'primary' ? 'text-white' : 'text-slate-200'
          )}
        >
          {label}
        </p>
        {subLabel && (
          <p
            className={cn(
              'text-sm',
              variant === 'primary' ? 'text-teal-100' : 'text-slate-400'
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
          variant === 'primary' ? 'text-white/70' : 'text-slate-500'
        )}
      />

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          variant === 'primary'
            ? 'shadow-[0_0_40px_rgba(20,184,166,0.3)]'
            : 'shadow-[0_0_30px_rgba(20,184,166,0.15)]'
        )}
      />
    </button>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const timelineRef = useRef<HTMLDivElement>(null);

  // Context data operations
  const {
    getJobById,
    getUserFacingEvents,
    updateJob,
    addEvent,
    completeInteraction,
  } = useMockData();

  // Get job data (will re-render when data changes via context)
  const job = getJobById(jobId);

  // Get user-facing events for timeline
  const events = job ? getUserFacingEvents(jobId) : [];

  // Loading state for interactive actions
  const [isInteracting, setIsInteracting] = useState(false);

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

  // Mock download handler
  const handleDownload = (type: 'face' | 'full') => {
    alert(
      `[V1 Mock] Download ${type === 'face' ? 'Face Page' : 'Full Report'} would happen here.\n\nIn V2, this will fetch from Convex Storage.`
    );
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
        flowCompletedAt: Date.now(),
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

    // Simulate 8-13s wrapper execution
    const startTime = Date.now();
    await new Promise((resolve) =>
      setTimeout(resolve, 8000 + Math.random() * 5000)
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
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'FACE_PAGE_ONLY', 'CANCELLED'].includes(job.internalStatus)
  );

  // Check if Page 1 correction is needed (PAGE1_NOT_FOUND)
  const needsPage1Correction = !!(
    job.wrapperRuns?.some((run) => run.result === 'PAGE1_NOT_FOUND') &&
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'FACE_PAGE_ONLY', 'CANCELLED'].includes(job.internalStatus)
  );

  // Show InlineFieldsCard only for Page 1 corrections (not by default after wizard)
  // Per requirements: hide Driver Info by default, only show for corrections
  const showInlineFieldsCard =
    !isWizardActive &&
    needsPage1Correction &&
    !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'CANCELLED'].includes(job.internalStatus);

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
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Link
              href="/law"
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
            <span className="ml-3 text-slate-400 text-sm font-medium">
              Back to requests
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-10 animate-page-entrance">
        {/* Client Info Header */}
        <div className="mb-8">
          {/* Client Name */}
          <h1
            className="text-3xl md:text-4xl font-bold text-white font-serif mb-3 animate-text-reveal"
            style={{ animationDelay: '100ms' }}
          >
            {job.clientName}
          </h1>

          {/* Report Number */}
          <p
            className="text-slate-400 font-mono text-sm md:text-base mb-4 animate-text-reveal"
            style={{ animationDelay: '200ms' }}
          >
            {job.reportNumber}
          </p>

          {/* Status Badge */}
          <div
            className="flex items-center gap-4 animate-text-reveal"
            style={{ animationDelay: '300ms' }}
          >
            <DarkStatusBadge internalStatus={job.internalStatus} />

            {job.caseReference && (
              <span className="text-sm text-slate-500">
                Case: {job.caseReference}
              </span>
            )}
          </div>
        </div>

        {/* Current Status Card */}
        <div
          className="glass-card-dark rounded-2xl p-5 mb-8 animate-text-reveal"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500/10">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Current Status
              </h2>
              <p className="text-slate-200 leading-relaxed">{statusMessage}</p>
            </div>
          </div>
        </div>

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
        {isWizardActive && !['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'CANCELLED', 'WAITING_FOR_FULL_REPORT', 'FACE_PAGE_ONLY'].includes(
          job.internalStatus
        ) && (
          <div
            className="mb-6 animate-text-reveal"
            style={{ animationDelay: '450ms' }}
          >
            <FlowWizard
              job={job}
              onStepChange={handleFlowStepChange}
              onComplete={handleFlowComplete}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Unified Inline Fields Card - Shown only for Page 1 corrections */}
        {showInlineFieldsCard && (
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

        {/* Driver Info Rescue Form - Shown when Page 2 verification fails */}
        {needsRescue && (
          <div className="mb-8 animate-text-reveal" style={{ animationDelay: '450ms' }}>
            <DriverInfoRescueForm
              initialData={job.interactiveState?.rescueFormData}
              onSubmit={handleRescueSubmit}
              disabled={isInteracting}
            />
          </div>
        )}

        {/* Timeline Section */}
        <div className="mb-8">
          <h2
            className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 animate-text-reveal"
            style={{ animationDelay: '500ms' }}
          >
            Activity Timeline
          </h2>

          <div
            ref={timelineRef}
            className="relative max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
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
                    animationDelay={600 + index * 150}
                    isLatest={index === events.length - 1}
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
            style={{ animationDelay: `${600 + events.length * 150 + 200}ms` }}
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
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
