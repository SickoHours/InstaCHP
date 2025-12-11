'use client';

import { useEffect, useRef } from 'react';
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
import { getJobById, getUserFacingEvents } from '@/lib/mockData';
import {
  getPublicStatus,
  getStatusColor,
  getStatusMessage,
  formatPublicStatus,
  STATUS_COLORS,
} from '@/lib/statusMapping';
import TimelineMessage from '@/components/ui/TimelineMessage';

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

  // Get job data
  const job = getJobById(jobId);

  // Get user-facing events for timeline
  const events = job ? getUserFacingEvents(jobId) : [];

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
