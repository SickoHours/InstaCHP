'use client';

/**
 * Law Firm Welcome Canvas - V2.0.0
 *
 * Welcome state shown when no job is selected.
 * Jobs are now listed in the sidebar, so this page serves as:
 * - Landing/welcome message
 * - Status overview summary
 * - Prominent "New Request" CTA
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus, FileText, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button, FloatingActionButton } from '@/components/ui';
import { mockJobs, DEFAULT_LAW_FIRM_ID } from '@/lib/mockData';
import {
  isActiveStatus,
  isCompletedStatus,
  needsAttention,
} from '@/lib/statusMapping';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export default function LawFirmWelcome() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get jobs for current law firm
  const jobs = useMemo(() => {
    return mockJobs.filter((job) => job.lawFirmId === DEFAULT_LAW_FIRM_ID);
  }, []);

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
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        {/* Welcome Section */}
        <div className="max-w-md text-center mb-8 animate-page-entrance">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/20 flex items-center justify-center">
            <FileText className="w-10 h-10 text-amber-400" />
          </div>

          {/* Welcome Text */}
          <h1 className={cn(
            'text-2xl md:text-3xl font-bold font-serif mb-3',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Welcome to InstaTCR
          </h1>
          <p className={cn(
            'mb-6',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Select a request from the sidebar or create a new one to get started.
          </p>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/law/jobs/new">
              <Button
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                iconPosition="left"
                className="shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-400/40"
              >
                New Request
              </Button>
            </Link>
            <Link href="/law/jobs/new-fatal">
              <Button
                variant="secondary"
                size="lg"
                icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                iconPosition="left"
                className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
              >
                Fatal Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Summary Cards */}
        {jobs.length > 0 && (
          <div
            className="w-full max-w-lg glass-surface p-card animate-page-entrance"
            style={{ animationDelay: '200ms' }}
          >
            <div className="section-divider mb-4">overview</div>
            <div className="grid grid-cols-3 gap-3">
              {/* In Progress */}
              <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                  {statusCounts.active}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-500')}>In Progress</p>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(59,130,246,0.15)] pointer-events-none" />
              </div>

              {/* Completed */}
              <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {statusCounts.completed}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Completed</p>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] pointer-events-none" />
              </div>

              {/* Need Info */}
              <div className="glass-subtle rounded-xl p-4 text-center group relative overflow-hidden hover-lift-subtle">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                  {statusCounts.needsAttention}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Need Info</p>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(251,191,36,0.15)] pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile FABs */}
      <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* Fatal Report (secondary) */}
        <Link href="/law/jobs/new-fatal">
          <button
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-md',
              'border border-red-500/30 text-red-400 text-sm font-medium',
              'shadow-lg shadow-red-900/20',
              'hover:border-red-500/50 active:scale-95 transition-all duration-200',
              isDark ? 'bg-slate-800/90 hover:bg-slate-700/90' : 'bg-white/90 hover:bg-slate-50/90'
            )}
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
