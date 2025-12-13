'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockJobs } from '@/lib/mockData';
import type { Job, InternalStatus, PublicStatus } from '@/lib/types';
import { getPublicStatus, formatPublicStatus } from '@/lib/statusMapping';
import { hasAuthorizationUploaded, isReadyToClaim } from '@/lib/jobUIHelpers';
import StatCard from '@/components/ui/StatCard';
import TabBar from '@/components/ui/TabBar';
import StaffJobCard from '@/components/ui/StaffJobCard';
import { StatCardSkeleton, JobCardSkeleton, NotificationBell } from '@/components/ui';

/**
 * Filter configuration for job statuses
 * V1.7.0: Added 'escalated' as first filter (default view)
 */
type FilterId = 'escalated' | 'all' | 'needsAction' | 'inProgress' | 'completed' | 'cancelled';

const FILTER_STATUSES: Record<FilterId, InternalStatus[] | null> = {
  escalated: ['NEEDS_IN_PERSON_PICKUP'], // NEW: Escalated jobs first
  all: null,
  needsAction: ['NEW', 'NEEDS_MORE_INFO', 'NEEDS_CALL', 'READY_FOR_AUTOMATION'],
  inProgress: [
    'CALL_IN_PROGRESS',
    'AUTOMATION_RUNNING',
    'FACE_PAGE_ONLY',
    'WAITING_FOR_FULL_REPORT',
    // REMOVED: 'NEEDS_IN_PERSON_PICKUP' - now has its own filter
    'AUTOMATION_ERROR',
  ],
  completed: ['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL', 'COMPLETED_FACE_PAGE_ONLY'],
  cancelled: ['CANCELLED'],
};

const FILTER_TABS = [
  { id: 'escalated', label: 'Escalated' }, // NEW: First tab (default)
  { id: 'all', label: 'All' },
  { id: 'needsAction', label: 'Needs Action' },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

/**
 * Format internal status for display
 */
function formatInternalStatus(status: InternalStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Dark mode badge colors for internal status
 */
const INTERNAL_STATUS_COLORS: Record<InternalStatus, string> = {
  NEW: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
  NEEDS_CALL: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  CALL_IN_PROGRESS: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  READY_FOR_AUTOMATION: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  AUTOMATION_RUNNING: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  FACE_PAGE_ONLY: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  WAITING_FOR_FULL_REPORT: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  COMPLETED_FULL_REPORT: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  COMPLETED_MANUAL: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  COMPLETED_FACE_PAGE_ONLY: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  NEEDS_MORE_INFO: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  NEEDS_IN_PERSON_PICKUP: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
  AUTOMATION_ERROR: 'bg-red-500/20 text-red-200 border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-200 border-red-500/30',
};

/**
 * Dark mode badge colors for public status
 */
const PUBLIC_STATUS_COLORS: Record<PublicStatus, string> = {
  SUBMITTED: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  CONTACTING_CHP: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  FACE_PAGE_READY: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  WAITING_FOR_REPORT: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  REPORT_READY: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  NEEDS_INFO: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  CANCELLED: 'bg-red-500/20 text-red-200 border-red-500/30',
};

export default function StaffQueuePage() {
  // V1.7.0: Default to 'escalated' filter - human intervention needed first
  const [activeFilter, setActiveFilter] = useState<FilterId>('escalated');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // V1.7.0: Local job state for quick action updates
  const [jobs, setJobs] = useState<Job[]>([]);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      // Initialize with mock data, sorted by createdAt (newest first)
      setJobs([...mockJobs].sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    }, 1200); // 1.2 second simulated load time

    return () => clearTimeout(timer);
  }, []);

  // V1.7.0: Handle job updates from quick actions
  const handleJobUpdate = useCallback((updatedJob: Job) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job._id === updatedJob._id ? { ...updatedJob, updatedAt: Date.now() } : job
      )
    );
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const needsActionStatuses = FILTER_STATUSES.needsAction!;
    const inProgressStatuses = FILTER_STATUSES.inProgress!;
    const completedStatuses = FILTER_STATUSES.completed!;

    return {
      total: jobs.length,
      escalations: jobs.filter((job) =>
        job.internalStatus === 'NEEDS_IN_PERSON_PICKUP'
      ).length,
      needsAction: jobs.filter((job) =>
        needsActionStatuses.includes(job.internalStatus)
      ).length,
      inProgress: jobs.filter((job) =>
        inProgressStatuses.includes(job.internalStatus)
      ).length,
      completed: jobs.filter((job) =>
        completedStatuses.includes(job.internalStatus)
      ).length,
    };
  }, [jobs]);

  // Filter jobs based on active filter
  const filteredJobs = useMemo(() => {
    const statuses = FILTER_STATUSES[activeFilter];
    let filtered = statuses
      ? jobs.filter((job) => statuses.includes(job.internalStatus))
      : jobs;

    // V1.9.0: Special sorting for escalated filter - prioritize ready-to-claim jobs
    if (activeFilter === 'escalated') {
      filtered = filtered.sort((a, b) => {
        const aReady = isReadyToClaim(a);
        const bReady = isReadyToClaim(b);
        const aHasAuth = hasAuthorizationUploaded(a);
        const bHasAuth = hasAuthorizationUploaded(b);

        // Tier 1: Ready to claim (highest priority)
        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;

        // Tier 2: Has auth but claimed (in progress)
        if (aHasAuth && !bHasAuth) return -1;
        if (!aHasAuth && bHasAuth) return 1;

        // Within tier, sort by createdAt (newest first)
        return b.createdAt - a.createdAt;
      });
    }

    return filtered;
  }, [jobs, activeFilter]);

  // Add count to filter tabs
  const tabsWithCounts = useMemo(() => {
    return FILTER_TABS.map((tab) => {
      const statuses = FILTER_STATUSES[tab.id as FilterId];
      const count = statuses
        ? jobs.filter((job) => statuses.includes(job.internalStatus)).length
        : jobs.length;
      return { ...tab, count };
    });
  }, [jobs]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Re-sort jobs and refresh
    setJobs(prev => [...prev].sort((a, b) => b.createdAt - a.createdAt));
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Check if we're on escalated filter (show quick actions)
  const isEscalatedFilter = activeFilter === 'escalated';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 header-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white font-serif">
                Job Queue
              </h1>
              {/* Escalation count badge (always visible in header) */}
              {stats.escalations > 0 && (
                <span className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium',
                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                )}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.escalations} escalated
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationBell userType="staff" />

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'text-sm text-slate-400 hover:text-white',
                  'bg-slate-800/50 hover:bg-slate-700/50',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RefreshCw
                  className={cn('w-4 h-4', isRefreshing && 'animate-icon-spin')}
                />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-page-entrance">
        {/* Stats Cards - V1.7.0: Reordered with Escalations first */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {isLoading ? (
            // Skeleton state
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} delay={100 + i * 100} />
              ))}
            </>
          ) : (
            <>
              {/* Escalated stat card - first and highlighted */}
              <StatCard
                value={stats.escalations}
                label="Escalated"
                color="orange"
                isActive={activeFilter === 'escalated'}
                onClick={() => setActiveFilter('escalated')}
                animationDelay={100}
              />
              <StatCard
                value={stats.total}
                label="Total Jobs"
                color="slate"
                isActive={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                animationDelay={200}
              />
              <StatCard
                value={stats.needsAction}
                label="Needs Action"
                color="amber"
                isActive={activeFilter === 'needsAction'}
                onClick={() => setActiveFilter('needsAction')}
                animationDelay={300}
              />
              <StatCard
                value={stats.inProgress}
                label="In Progress"
                color="blue"
                isActive={activeFilter === 'inProgress'}
                onClick={() => setActiveFilter('inProgress')}
                animationDelay={400}
              />
              <StatCard
                value={stats.completed}
                label="Completed"
                color="green"
                isActive={activeFilter === 'completed'}
                onClick={() => setActiveFilter('completed')}
                animationDelay={500}
              />
            </>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          className="mb-6 animate-text-reveal"
          style={{ animationDelay: '500ms' }}
        >
          <TabBar
            tabs={tabsWithCounts}
            activeTab={activeFilter}
            onTabChange={(id) => setActiveFilter(id as FilterId)}
          />
        </div>

        {/* Job List - Mobile (V1.7.0: With quick actions for escalated filter) */}
        <div id="main-content" className="md:hidden space-y-3">
          {isLoading ? (
            // Skeleton state
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <JobCardSkeleton key={i} variant="mobile" delay={600 + i * 60} />
              ))}
            </>
          ) : filteredJobs.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filteredJobs.map((job, index) => (
              <StaffJobCard
                key={job._id}
                job={job}
                animationDelay={600 + index * 50}
                showQuickActions={isEscalatedFilter}
                onJobUpdate={handleJobUpdate}
              />
            ))
          )}
        </div>

        {/* Job Table - Desktop */}
        <div
          className="hidden md:block animate-text-reveal"
          style={{ animationDelay: '600ms' }}
        >
          {isLoading ? (
            // Table skeleton state
            <div className="glass-card-dark rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    {['Client', 'Report #', 'Law Firm', 'Internal', 'Public', 'Created', 'Actions'].map((header) => (
                      <th key={header} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <JobCardSkeleton key={i} variant="table-row" delay={700 + i * 60} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <div className="glass-card-dark rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Report #
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Law Firm
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Internal
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Public
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Created
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, index) => {
                    const publicStatus = getPublicStatus(job.internalStatus);

                    return (
                      <tr
                        key={job._id}
                        className={cn(
                          'border-b border-slate-800/30 last:border-0',
                          'hover:bg-slate-800/30 transition-colors duration-200',
                          'opacity-0 animate-message-cascade'
                        )}
                        style={{ animationDelay: `${700 + index * 50}ms` }}
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-slate-200">
                            {job.clientName}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-400 font-mono">
                            {job.reportNumber}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-400">
                            {job.lawFirmName}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                              INTERNAL_STATUS_COLORS[job.internalStatus]
                            )}
                          >
                            {formatInternalStatus(job.internalStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                              PUBLIC_STATUS_COLORS[publicStatus]
                            )}
                          >
                            {formatPublicStatus(publicStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-500">
                            {formatRelativeTime(job.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/staff/jobs/${job._id}`}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                              'text-sm font-medium text-teal-400',
                              'bg-teal-500/10 hover:bg-teal-500/20',
                              'transition-colors duration-200'
                            )}
                          >
                            View
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Empty state component
 * V1.7.0: Added escalated message
 */
function EmptyState({ filter }: { filter: FilterId }) {
  const messages: Record<FilterId, string> = {
    escalated: 'No escalated jobs - great job!',
    all: 'No jobs found',
    needsAction: 'No jobs need action right now',
    inProgress: 'No jobs currently in progress',
    completed: 'No completed jobs yet',
    cancelled: 'No cancelled jobs',
  };

  return (
    <div className="glass-card-dark rounded-xl p-12 text-center">
      <p className="text-slate-500">{messages[filter]}</p>
    </div>
  );
}
