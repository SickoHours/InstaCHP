'use client';

/**
 * AppShell - V2.0.0
 *
 * Main layout wrapper for the authenticated app experience.
 * ChatGPT-style layout with:
 * - Collapsible left sidebar (desktop)
 * - Mobile drawer (mobile)
 * - Top header with notifications
 * - Main content canvas
 *
 * Used by both Law Firm and Staff layouts.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { BackgroundOrbs } from './BackgroundOrbs';
import { AppShellHeader } from './AppShellHeader';
import { AppShellSidebar } from './AppShellSidebar';
import MobileDrawer from '@/components/ui/MobileDrawer';
import { mockJobs, DEFAULT_LAW_FIRM_ID, DEFAULT_LAW_FIRM_NAME } from '@/lib/mockData';

interface AppShellProps {
  /** User type determines data filtering and routing */
  userType: 'law_firm' | 'staff';
  /** Main content */
  children: React.ReactNode;
  /** Additional className for main content area */
  className?: string;
}

/**
 * Inner shell component that uses sidebar context
 */
function AppShellInner({ userType, children, className }: AppShellProps) {
  const { isOpen, closeSidebar, isCollapsed } = useSidebar();

  // Get jobs for the current user
  const jobs = useMemo(() => {
    if (userType === 'law_firm') {
      // Filter by current law firm (V1: hardcoded)
      return mockJobs
        .filter((job) => job.lawFirmId === DEFAULT_LAW_FIRM_ID)
        .sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // Staff sees all jobs, sorted by most recent
      return [...mockJobs].sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [userType]);

  // Profile name based on user type
  const profileName = useMemo(() => {
    if (userType === 'law_firm') {
      return DEFAULT_LAW_FIRM_NAME;
    } else {
      // V1: Hardcoded staff name
      return 'Staff Member';
    }
  }, [userType]);

  return (
    <div className="flex h-dvh bg-slate-950 overflow-hidden">
      {/* Background Orbs (single instance) */}
      <BackgroundOrbs />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-shrink-0',
          'transition-[width] duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-80'
        )}
      >
        <AppShellSidebar
          jobs={jobs}
          userType={userType}
          profileName={profileName}
          showHeader={true}
        />
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isOpen}
        onClose={closeSidebar}
        position="left"
        width="w-80"
        showCloseButton={true}
      >
        <AppShellSidebar
          jobs={jobs}
          userType={userType}
          profileName={profileName}
          onJobSelect={closeSidebar}
          showHeader={true}
        />
      </MobileDrawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <AppShellHeader userType={userType} />

        {/* Main Canvas */}
        <main
          className={cn(
            'flex-1 overflow-auto',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * App Shell with sidebar context provider
 */
export function AppShell({ userType, children, className }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner userType={userType} className={className}>
        {children}
      </AppShellInner>
    </SidebarProvider>
  );
}

export default AppShell;
