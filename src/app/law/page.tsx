'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Search, AlertTriangle } from 'lucide-react';
import {
  Container,
  Button,
  MobileJobCard,
  FloatingActionButton,
  JobCardSkeleton,
  SkeletonBase,
  NotificationBell,
} from '@/components/ui';
import { mockJobs, DEFAULT_LAW_FIRM_ID } from '@/lib/mockData';
import {
  isActiveStatus,
  isCompletedStatus,
  needsAttention,
} from '@/lib/statusMapping';

export default function LawFirmDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second simulated load time

    return () => clearTimeout(timer);
  }, []);

  // Filter jobs for current law firm, sorted by createdAt (newest first)
  const jobs = useMemo(() => {
    return mockJobs
      .filter((job) => job.lawFirmId === DEFAULT_LAW_FIRM_ID)
      .filter((job) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          job.clientName.toLowerCase().includes(query) ||
          job.reportNumber.toLowerCase().includes(query) ||
          (job.caseReference?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [searchQuery]);

  // Count jobs by status category for summary
  const statusCounts = useMemo(() => {
    const counts = { active: 0, completed: 0, needsAttention: 0 };
    jobs.forEach((job) => {
      if (isCompletedStatus(job.internalStatus)) {
        counts.completed++;
      } else if (needsAttention(job.internalStatus)) {
        counts.needsAttention++;
      } else if (isActiveStatus(job.internalStatus)) {
        counts.active++;
      }
    });
    return counts;
  }, [jobs]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb-dark w-[500px] h-[500px] bg-teal-600/25 top-[-10%] left-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="orb-dark w-[400px] h-[400px] bg-cyan-600/20 bottom-[20%] right-[-5%]"
          style={{ animationDelay: '5s' }}
        />
        <div
          className="orb-dark w-[600px] h-[600px] bg-slate-700/25 bottom-[-20%] left-[30%]"
          style={{ animationDelay: '10s' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Container>
          {/* Page Header */}
          <div className="py-6 md:py-10 animate-page-entrance">
            {/* Title Section - Elevated for prominence */}
            <div className="glass-elevated p-6 md:p-8 mb-6 md:mb-8">
            {/* Title row with desktop CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold text-white font-serif animate-text-reveal"
                    style={{ animationDelay: '100ms' }}
                  >
                    Your Requests
                  </h1>
                  <p
                    className="text-sm text-slate-400 mt-1 animate-text-reveal"
                    style={{ animationDelay: '200ms' }}
                  >
                    {jobs.length} total request{jobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Right side: Notification bell + Desktop CTA buttons */}
              <div className="flex items-center gap-3">
                {/* Notification Bell (visible on all screen sizes) */}
                <div className="animate-text-reveal" style={{ animationDelay: '200ms' }}>
                  <NotificationBell userType="law_firm" />
                </div>

                {/* Desktop CTA buttons */}
                <div
                  className="hidden md:flex items-center gap-3 animate-text-reveal"
                  style={{ animationDelay: '200ms' }}
                >
                  <Link href="/law/jobs/new">
                    <Button
                      variant="primary"
                      size="md"
                      icon={<Plus className="w-5 h-5" />}
                      iconPosition="left"
                      className="shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-500/40"
                    >
                      New Request
                    </Button>
                  </Link>
                  <Link href="/law/jobs/new-fatal">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                      iconPosition="left"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      Fatal Report
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            </div>

            {/* Status summary cards - V2.0: Wrapped in glass-surface */}
            <div
              className="glass-surface p-card mb-6 animate-text-reveal"
              style={{ animationDelay: '300ms' }}
            >
              <div className="section-divider mb-4">overview</div>
              <div className="grid grid-cols-3 gap-3">
                {isLoading ? (
                  // Skeleton state
                  <>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="glass-subtle rounded-xl p-4 text-center animate-card-entrance"
                        style={{ animationDelay: `${300 + i * 100}ms` }}
                      >
                        <SkeletonBase width={32} height={32} rounded="md" className="mx-auto" />
                        <SkeletonBase width={60} height={12} rounded="md" className="mx-auto mt-2" />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* In Progress Card */}
                    <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                      <p className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                        {statusCounts.active}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">In Progress</p>
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(59,130,246,0.15)] pointer-events-none" />
                    </div>

                    {/* Completed Card */}
                    <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                      <p className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        {statusCounts.completed}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Completed</p>
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] pointer-events-none" />
                    </div>

                    {/* Need Info Card */}
                    <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                      <p className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                        {statusCounts.needsAttention}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Need Info</p>
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(251,191,36,0.15)] pointer-events-none" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search - V2.0: Glass container */}
            <div
              className="glass-surface p-4 mb-8 animate-text-reveal"
              style={{ animationDelay: '400ms' }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by client name, report #, or case reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full h-12 md:h-10 pl-12 pr-4
                    text-base md:text-sm
                    bg-slate-900/50 border border-slate-700/50 rounded-lg
                    text-white placeholder:text-slate-500
                    focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30
                    transition-all duration-300
                  "
                />
              </div>
            </div>
          </div>

          {/* Job List */}
          <main id="main-content" className="pb-24 md:pb-8">
            {isLoading ? (
              // Skeleton loading state
              <>
                {/* Mobile: Single column skeletons */}
                <div className="md:hidden space-y-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <JobCardSkeleton key={i} variant="mobile" delay={600 + i * 80} />
                  ))}
                </div>

                {/* Desktop: Grid skeletons */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <JobCardSkeleton key={i} variant="mobile" delay={600 + i * 80} />
                  ))}
                </div>
              </>
            ) : jobs.length === 0 ? (
              <EmptyState hasSearch={!!searchQuery} />
            ) : (
              <>
                {/* Mobile: Single column */}
                <div className="md:hidden space-y-3">
                  {jobs.map((job, index) => (
                    <MobileJobCard
                      key={job._id}
                      job={job}
                      variant="dark"
                      animationDelay={500 + index * 80}
                    />
                  ))}
                </div>

                {/* Desktop: 2-3 columns grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job, index) => (
                    <MobileJobCard
                      key={job._id}
                      job={job}
                      variant="dark"
                      animationDelay={500 + index * 80}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </Container>
      </div>

      {/* Mobile FABs */}
      <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* Fatal Report (secondary) */}
        <Link href="/law/jobs/new-fatal">
          <button
            className="
              flex items-center gap-2 px-4 py-3 rounded-full
              bg-slate-800/90 border border-red-500/30 backdrop-blur-md
              text-red-300 text-sm font-medium
              shadow-lg shadow-red-900/20
              hover:bg-slate-700/90 hover:border-red-500/50
              active:scale-95 transition-all duration-200
            "
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Fatal Report</span>
          </button>
        </Link>

        {/* New Request (primary FAB) */}
        <Link href="/law/jobs/new">
          <FloatingActionButton
            icon={<Plus className="w-6 h-6" />}
            label="New Request"
            extended
            position="static"
          />
        </Link>
      </div>
    </div>
  );
}

// Empty state component - Dark mode
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-page-entrance">
      <div className="w-16 h-16 rounded-full empty-state-icon-dark flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {hasSearch ? 'No matching requests' : 'No requests yet'}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm">
        {hasSearch
          ? 'Try adjusting your search terms.'
          : 'Submit your first CHP crash report request to get started.'}
      </p>
      {!hasSearch && (
        <Link href="/law/jobs/new" className="mt-6">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-5 h-5" />}
            iconPosition="left"
            className="shadow-lg shadow-teal-600/30"
          >
            New Request
          </Button>
        </Link>
      )}
    </div>
  );
}
