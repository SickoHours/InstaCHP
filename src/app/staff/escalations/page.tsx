'use client';

/**
 * Staff Escalations Queue Page (V1.6.0)
 *
 * Shows all jobs with NEEDS_IN_PERSON_PICKUP status.
 * Allows staff to view, claim, and schedule manual pickups.
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockJobs } from '@/lib/mockData';
import type { Job } from '@/lib/types';

// Filter options for escalation status
type EscalationFilter = 'all' | 'awaiting_auth' | 'ready' | 'scheduled';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'awaiting_auth', label: 'Awaiting Auth' },
  { id: 'ready', label: 'Ready for Pickup' },
  { id: 'scheduled', label: 'Scheduled' },
];

/**
 * Get escalation status label and color
 */
function getEscalationStatusInfo(job: Job): { label: string; color: string } {
  const data = job.escalationData;

  if (!data) {
    return { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  }

  switch (data.status) {
    case 'pending_authorization':
      return { label: 'Awaiting Auth', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    case 'authorization_received':
      return { label: 'Ready', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'claimed':
      return { label: 'Claimed', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    case 'pickup_scheduled':
      return { label: 'Scheduled', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    case 'completed':
      return { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    default:
      return { label: 'Pending', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
  }
}

/**
 * Get escalation reason label
 */
function getEscalationReasonLabel(reason?: string): string {
  switch (reason) {
    case 'auto_exhausted':
      return 'Auto-escalated (fields exhausted)';
    case 'fatal_report':
      return 'Fatal report';
    case 'manual':
      return 'Manual escalation';
    default:
      return 'Escalated';
  }
}

export default function EscalationsPage() {
  const [activeFilter, setActiveFilter] = useState<EscalationFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter escalated jobs
  const escalatedJobs = useMemo(() => {
    return mockJobs
      .filter((job) => job.internalStatus === 'NEEDS_IN_PERSON_PICKUP')
      .filter((job) => {
        if (activeFilter === 'all') return true;
        const status = job.escalationData?.status;
        if (activeFilter === 'awaiting_auth') {
          return status === 'pending_authorization' || !status;
        }
        if (activeFilter === 'ready') {
          return status === 'authorization_received';
        }
        if (activeFilter === 'scheduled') {
          return status === 'claimed' || status === 'pickup_scheduled';
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by escalation time (newest first)
        const aTime = a.escalationData?.escalatedAt || a.createdAt;
        const bTime = b.escalationData?.escalatedAt || b.createdAt;
        return bTime - aTime;
      });
  }, [activeFilter]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Stats
  const stats = useMemo(() => {
    const all = mockJobs.filter((j) => j.internalStatus === 'NEEDS_IN_PERSON_PICKUP');
    return {
      total: all.length,
      awaitingAuth: all.filter(
        (j) => j.escalationData?.status === 'pending_authorization' || !j.escalationData?.status
      ).length,
      ready: all.filter((j) => j.escalationData?.status === 'authorization_received').length,
      scheduled: all.filter(
        (j) =>
          j.escalationData?.status === 'claimed' ||
          j.escalationData?.status === 'pickup_scheduled'
      ).length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px] animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/staff"
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-orange-400" />
                Escalations
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manual pickup required
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'p-2 rounded-lg bg-slate-800/50 border border-slate-700/50',
              'hover:bg-slate-700/50 transition-colors',
              'disabled:opacity-50'
            )}
          >
            <RefreshCw
              className={cn('w-5 h-5 text-slate-400', isRefreshing && 'animate-spin')}
            />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card-dark rounded-xl p-4 border border-slate-700/30">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card-dark rounded-xl p-4 border border-amber-500/20">
            <p className="text-sm text-amber-400/70">Awaiting Auth</p>
            <p className="text-2xl font-bold text-amber-400">{stats.awaitingAuth}</p>
          </div>
          <div className="glass-card-dark rounded-xl p-4 border border-emerald-500/20">
            <p className="text-sm text-emerald-400/70">Ready</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.ready}</p>
          </div>
          <div className="glass-card-dark rounded-xl p-4 border border-cyan-500/20">
            <p className="text-sm text-cyan-400/70">Scheduled</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.scheduled}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as EscalationFilter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
                'transition-all duration-200',
                activeFilter === tab.id
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="glass-card-dark rounded-xl p-4 border border-slate-700/30 animate-pulse"
              >
                <div className="h-5 w-32 bg-slate-700/50 rounded mb-2" />
                <div className="h-4 w-48 bg-slate-700/30 rounded mb-3" />
                <div className="h-3 w-24 bg-slate-700/20 rounded" />
              </div>
            ))
          ) : escalatedJobs.length === 0 ? (
            <div className="glass-card-dark rounded-xl p-12 border border-slate-700/30 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">No escalations</p>
              <p className="text-slate-500 text-sm mt-1">
                All reports are being processed normally
              </p>
            </div>
          ) : (
            escalatedJobs.map((job, index) => {
              const statusInfo = getEscalationStatusInfo(job);
              return (
                <Link
                  key={job._id}
                  href={`/staff/jobs/${job._id}`}
                  className={cn(
                    'block glass-card-dark rounded-xl p-4 border border-slate-700/30',
                    'hover:border-orange-500/30 hover:bg-slate-800/30',
                    'transition-all duration-200',
                    'animate-text-reveal'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Client name & report */}
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                        <h3 className="text-white font-medium truncate">
                          {job.clientName}
                        </h3>
                      </div>

                      {/* Report number & law firm */}
                      <p className="text-sm text-slate-400 mb-2">
                        {job.reportNumber} • {job.lawFirmName}
                      </p>

                      {/* Escalation info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full border',
                            statusInfo.color
                          )}
                        >
                          {statusInfo.label}
                        </span>

                        {job.escalationData?.escalationReason && (
                          <span className="text-slate-500">
                            {getEscalationReasonLabel(job.escalationData.escalationReason)}
                          </span>
                        )}

                        {job.escalationData?.claimedBy && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <User className="w-3 h-3" />
                            {job.escalationData.claimedBy}
                          </span>
                        )}

                        {job.escalationData?.scheduledPickupDate && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(job.escalationData.scheduledPickupDate).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time & Arrow */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(
                          job.escalationData?.escalatedAt || job.createdAt
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Fatal badge if applicable */}
                  {job.isFatal && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Fatal Report
                      </span>
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
