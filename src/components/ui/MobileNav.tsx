'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation URL */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional badge count */
  badge?: number;
}

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of navigation items */
  items: NavItem[];
  /** Override active detection with specific item ID */
  activeItem?: string;
  /** Show labels below icons */
  showLabels?: boolean;
}

/**
 * MobileNav - A bottom navigation bar for mobile devices
 *
 * Features:
 * - Fixed to bottom of screen
 * - 3-5 navigation items
 * - Active state with teal indicator
 * - Badge support for notifications
 * - Hidden on desktop (md:hidden)
 * - Safe area padding for notched phones
 * - Auto-detects active route from pathname
 *
 * @example
 * ```tsx
 * <MobileNav
 *   items={[
 *     { id: 'home', label: 'Home', href: '/', icon: Home },
 *     { id: 'jobs', label: 'Jobs', href: '/jobs', icon: FileText, badge: 3 },
 *     { id: 'new', label: 'New', href: '/jobs/new', icon: Plus },
 *     { id: 'profile', label: 'Profile', href: '/profile', icon: User },
 *   ]}
 * />
 * ```
 */
const MobileNav = forwardRef<HTMLElement, MobileNavProps>(
  ({ className, items, activeItem, showLabels = true, ...props }, ref) => {
    const pathname = usePathname();

    // Determine if an item is active
    const isItemActive = (item: NavItem) => {
      if (activeItem) {
        return activeItem === item.id;
      }
      // Check if current pathname matches or starts with the item's href
      if (item.href === '/') {
        return pathname === '/';
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    };

    return (
      <nav
        ref={ref}
        className={cn(
          // Fixed bottom positioning
          'fixed bottom-0 left-0 right-0 z-40',
          // Hidden on desktop
          'md:hidden',
          // Glass-morphism styling
          'glass-card-dark',
          'border-t border-slate-700/50',
          // Safe area padding
          'pb-safe-area-inset-bottom',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-around h-16">
          {items.map((item) => {
            const isActive = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  // Base styles
                  'relative flex flex-col items-center justify-center',
                  'flex-1 h-full',
                  'transition-colors duration-200',
                  // Active state
                  isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className={cn(
                      'absolute top-0 left-1/2 -translate-x-1/2',
                      'w-12 h-0.5 rounded-full',
                      'bg-gradient-to-r from-teal-500 to-cyan-500',
                      'shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                    )}
                  />
                )}

                {/* Icon with badge */}
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-6 h-6',
                      'transition-transform duration-200',
                      isActive && 'scale-110'
                    )}
                  />
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'absolute -top-1 -right-1',
                        'flex items-center justify-center',
                        'min-w-[18px] h-[18px] px-1',
                        'rounded-full text-[10px] font-bold',
                        'bg-red-500 text-white',
                        'border-2 border-slate-950'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                {showLabels && (
                  <span
                    className={cn(
                      'mt-1 text-[10px] font-medium',
                      'transition-colors duration-200',
                      isActive ? 'text-teal-300' : 'text-slate-500'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
);

MobileNav.displayName = 'MobileNav';

export default MobileNav;

// ============================================
// PRESET CONFIGURATIONS
// ============================================

import { Home, FileText, Plus, User, Settings, Bell, Search, Menu } from 'lucide-react';

/**
 * Common navigation item presets
 */
export const NAV_PRESETS = {
  home: { id: 'home', label: 'Home', href: '/', icon: Home },
  jobs: { id: 'jobs', label: 'Jobs', href: '/law', icon: FileText },
  newRequest: { id: 'new', label: 'New', href: '/law/jobs/new', icon: Plus },
  profile: { id: 'profile', label: 'Profile', href: '/profile', icon: User },
  settings: { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
  notifications: { id: 'notifications', label: 'Alerts', href: '/notifications', icon: Bell },
  search: { id: 'search', label: 'Search', href: '/search', icon: Search },
  menu: { id: 'menu', label: 'Menu', href: '#', icon: Menu },
} as const;

/**
 * Pre-configured nav for Law Firm users
 */
export const LAW_FIRM_NAV_ITEMS: NavItem[] = [
  NAV_PRESETS.home,
  NAV_PRESETS.jobs,
  NAV_PRESETS.newRequest,
  NAV_PRESETS.settings,
];

/**
 * Pre-configured nav for Staff users
 */
export const STAFF_NAV_ITEMS: NavItem[] = [
  { id: 'queue', label: 'Queue', href: '/staff', icon: FileText },
  NAV_PRESETS.search,
  NAV_PRESETS.notifications,
  NAV_PRESETS.settings,
];
