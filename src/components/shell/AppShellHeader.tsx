'use client';

/**
 * AppShellHeader - V2.0.0
 *
 * Top header for the app shell with:
 * - Mobile: Menu button | Logo | NotificationBell
 * - Desktop: Spacer | NotificationBell (logo is in sidebar)
 *
 * Uses glass-header styling for sticky positioning.
 */

import { cn } from '@/lib/utils';
import { Logo, NotificationBell } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

interface AppShellHeaderProps {
  /** User type for notifications */
  userType: 'law_firm' | 'staff';
  /** Additional className */
  className?: string;
}

export function AppShellHeader({ userType, className }: AppShellHeaderProps) {
  const { openSidebar, isCollapsed } = useSidebar();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-20',
        'h-16 flex items-center px-4',
        'glass-header',
        'border-b-0',
        className
      )}
    >
      {/* Mobile: Menu Button */}
      <button
        onClick={openSidebar}
        className={cn(
          'md:hidden flex items-center justify-center',
          'w-10 h-10 -ml-2 rounded-lg',
          isDark
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
        )}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile: Centered Logo */}
      <div className="flex-1 flex justify-center md:hidden">
        <Logo size="sm" variant={isDark ? 'light' : 'dark'} />
      </div>

      {/* Spacer (desktop) */}
      <div className="hidden md:flex flex-1" />

      {/* Right side: Theme Toggle + Notification Bell */}
      <div className="flex items-center gap-1">
        <ThemeToggle size="md" />
        <NotificationBell userType={userType} />
      </div>
    </header>
  );
}

export default AppShellHeader;
