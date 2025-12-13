'use client';

/**
 * AppShellSidebar - V2.0.0
 *
 * Left sidebar for the app shell containing:
 * - Job list with search
 * - Profile card at bottom
 *
 * Supports expanded/collapsed states on desktop.
 * On mobile, this is rendered inside MobileDrawer.
 */

import { cn } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { SidebarJobList } from './SidebarJobList';
import { SidebarProfileCard } from './SidebarProfileCard';
import { Logo } from '@/components/ui';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface AppShellSidebarProps {
  /** Jobs to display in the list */
  jobs: Job[];
  /** User type for routing and display */
  userType: 'law_firm' | 'staff';
  /** Display name for profile card */
  profileName: string;
  /** Callback when job is selected (for mobile drawer close) */
  onJobSelect?: () => void;
  /** Additional className */
  className?: string;
  /** Whether to show the header (true for mobile drawer, false for desktop) */
  showHeader?: boolean;
}

export function AppShellSidebar({
  jobs,
  userType,
  profileName,
  onJobSelect,
  className,
  showHeader = true,
}: AppShellSidebarProps) {
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'glass-surface',
        'border-r border-slate-700/30',
        className
      )}
    >
      {/* Sidebar Header */}
      {showHeader && (
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-slate-800/50',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {/* Logo */}
          {!isCollapsed && (
            <Logo size="sm" variant="light" />
          )}

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={toggleCollapse}
            className={cn(
              'hidden md:flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'text-slate-400 hover:text-white hover:bg-white/5',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Job List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SidebarJobList
          jobs={jobs}
          userType={userType}
          onJobSelect={onJobSelect}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Profile Card */}
      <div className={cn('p-3 border-t border-slate-800/50')}>
        <SidebarProfileCard
          name={profileName}
          subtitle={userType === 'law_firm' ? 'Law Firm' : 'Staff'}
          userType={userType}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}

export default AppShellSidebar;
