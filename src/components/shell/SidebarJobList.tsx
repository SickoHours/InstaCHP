'use client';

/**
 * SidebarJobList - V2.0.0
 *
 * Scrollable list of jobs with search functionality.
 * Used inside the AppShellSidebar to display all jobs for the current user.
 * Highlights the currently selected job based on URL params.
 */

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Search, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { SidebarJobCard } from '@/components/ui/SidebarJobCard';

interface SidebarJobListProps {
  /** All jobs to display (pre-filtered by user/firm) */
  jobs: Job[];
  /** User type for routing */
  userType: 'law_firm' | 'staff';
  /** Callback when a job is selected (for closing mobile drawer) */
  onJobSelect?: () => void;
  /** Whether sidebar is collapsed (hides list) */
  isCollapsed?: boolean;
  /** Additional className */
  className?: string;
}

export function SidebarJobList({
  jobs,
  userType,
  onJobSelect,
  isCollapsed = false,
  className,
}: SidebarJobListProps) {
  const params = useParams();
  const selectedJobId = params.jobId as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter jobs by search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    const query = searchQuery.toLowerCase().trim();
    return jobs.filter(
      (job) =>
        job.clientName.toLowerCase().includes(query) ||
        job.reportNumber.toLowerCase().includes(query) ||
        (job.caseReference?.toLowerCase().includes(query) ?? false)
    );
  }, [jobs, searchQuery]);

  // Sort by createdAt (newest first)
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredJobs]);

  // If collapsed, show minimal version
  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col items-center py-2 gap-1', className)}>
        {/* Collapsed search icon */}
        <button
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Show count indicator */}
        <div className="text-[10px] text-slate-500 font-medium">
          {jobs.length}
        </div>
      </div>
    );
  }

  const basePath = userType === 'law_firm' ? '/law' : '/staff';

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search Input */}
      <div className="px-3 py-3 border-b border-slate-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full h-10 pl-9 pr-3 rounded-lg',
              'text-sm text-white placeholder:text-slate-500',
              'bg-slate-900/50 border border-slate-700/50',
              'focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* New Request Button (Law Firm only) */}
        {userType === 'law_firm' && (
          <Link
            href={`${basePath}/jobs/new`}
            onClick={onJobSelect}
            className={cn(
              'mt-3 flex items-center justify-center gap-2 w-full h-10 rounded-lg',
              'bg-teal-600 hover:bg-teal-500 active:bg-teal-700',
              'text-white text-sm font-medium',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        )}
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {sortedJobs.length === 0 ? (
          <EmptyState hasSearch={!!searchQuery.trim()} userType={userType} />
        ) : (
          sortedJobs.map((job, index) => (
            <SidebarJobCard
              key={job._id}
              job={job}
              isSelected={job._id === selectedJobId}
              userType={userType}
              onSelect={onJobSelect}
              animationDelay={index < 10 ? 100 + index * 50 : 0}
            />
          ))
        )}
      </div>

      {/* Job count footer */}
      <div className="px-3 py-2 border-t border-slate-800/50">
        <p className="text-xs text-slate-600 text-center">
          {searchQuery.trim()
            ? `${sortedJobs.length} of ${jobs.length} requests`
            : `${jobs.length} request${jobs.length !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({
  hasSearch,
  userType,
}: {
  hasSearch: boolean;
  userType: 'law_firm' | 'staff';
}) {
  const basePath = userType === 'law_firm' ? '/law' : '/staff';

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
        <FileText className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm text-slate-400">
        {hasSearch ? 'No matching requests' : 'No requests yet'}
      </p>
      {!hasSearch && userType === 'law_firm' && (
        <Link
          href={`${basePath}/jobs/new`}
          className="mt-3 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Create your first request
        </Link>
      )}
    </div>
  );
}

export default SidebarJobList;
