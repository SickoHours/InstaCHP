'use client';

/**
 * AppShellHeader - V2.0.0
 *
 * Top header for the app shell with:
 * - Mobile: Menu button | Logo | NotificationBell
 * - Desktop: Logo (if sidebar collapsed) | Spacer | NotificationBell
 *
 * Uses glass-header styling for sticky positioning.
 */

import { cn } from '@/lib/utils';
import { Logo, NotificationBell } from '@/components/ui';
import { Menu, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface AppShellHeaderProps {
  /** User type for notifications */
  userType: 'law_firm' | 'staff';
  /** Additional className */
  className?: string;
}

export function AppShellHeader({ userType, className }: AppShellHeaderProps) {
  const { openSidebar, isCollapsed, toggleCollapse } = useSidebar();

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'h-16 flex items-center px-4',
        'glass-header',
        'border-b border-slate-700/30',
        className
      )}
    >
      {/* Mobile: Menu Button */}
      <button
        onClick={openSidebar}
        className={cn(
          'md:hidden flex items-center justify-center',
          'w-10 h-10 -ml-2 rounded-lg',
          'text-slate-400 hover:text-white hover:bg-white/5',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
        )}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop: Collapse toggle when sidebar is collapsed */}
      <button
        onClick={toggleCollapse}
        className={cn(
          'hidden',
          isCollapsed && 'md:flex',
          'items-center justify-center',
          'w-10 h-10 -ml-2 rounded-lg',
          'text-slate-400 hover:text-white hover:bg-white/5',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
        )}
        title="Expand sidebar"
        aria-label="Expand sidebar"
      >
        <PanelLeft className="w-5 h-5" />
      </button>

      {/* Mobile: Centered Logo */}
      <div className="flex-1 flex justify-center md:hidden">
        <Logo size="sm" variant="light" />
      </div>

      {/* Desktop: Show logo only when sidebar collapsed */}
      {isCollapsed && (
        <div className="hidden md:flex ml-2">
          <Logo size="sm" variant="light" />
        </div>
      )}

      {/* Spacer (desktop) */}
      <div className="hidden md:flex flex-1" />

      {/* Right side: Notification Bell */}
      <div className="flex items-center gap-2">
        <NotificationBell userType={userType} />
      </div>
    </header>
  );
}

export default AppShellHeader;
