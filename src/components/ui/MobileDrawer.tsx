'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useTheme } from '@/context/ThemeContext';

interface MobileDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer should close */
  onClose: () => void;
  /** Content to display in the drawer */
  children: React.ReactNode;
  /** Position of the drawer */
  position?: 'left' | 'right';
  /** Width of the drawer (Tailwind class or custom) */
  width?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * MobileDrawer - A slide-out navigation drawer for mobile
 *
 * Features:
 * - Slides in from left or right
 * - Dark overlay backdrop
 * - Keyboard accessible (Escape to close)
 * - Focus trapping
 * - Mobile-optimized (can show on desktop too)
 * - Glass-morphism styling
 *
 * @example
 * ```tsx
 * <MobileDrawer
 *   isOpen={isMenuOpen}
 *   onClose={() => setIsMenuOpen(false)}
 *   position="left"
 * >
 *   <nav className="space-y-2">
 *     <a href="/dashboard">Dashboard</a>
 *     <a href="/settings">Settings</a>
 *   </nav>
 * </MobileDrawer>
 * ```
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  width = 'w-72',
  showCloseButton = true,
  className,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Lock body scroll and add event listeners when open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Focus the drawer
      drawerRef.current?.focus();

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  const isLeft = position === 'left';

  return (
    <FocusTrap
      focusTrapOptions={{
        returnFocusOnDeactivate: true,
        escapeDeactivates: false, // We handle escape manually
        allowOutsideClick: true,
        fallbackFocus: () => drawerRef.current || document.body,
      }}
    >
      <div
        className={cn(
          'fixed inset-0 z-50',
          // Overlay styles
          'bg-black/60 backdrop-blur-sm',
          // Animation
          !prefersReducedMotion && 'animate-in fade-in duration-200'
        )}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Content */}
        <div
          ref={drawerRef}
          tabIndex={-1}
          className={cn(
            // Base styles
            'fixed top-0 bottom-0 outline-none',
            'h-full',
            width,
            // Position
            isLeft ? 'left-0' : 'right-0',
            // Glass-morphism styling - use theme-aware class
            'glass-card-dark',
            isLeft
              ? cn('border-r', isDark ? 'border-slate-700/50' : 'border-slate-200')
              : cn('border-l', isDark ? 'border-slate-700/50' : 'border-slate-200'),
            isDark ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-slate-300/50',
            // Animation
            !prefersReducedMotion && [
              'animate-in',
              isLeft ? 'slide-in-from-left' : 'slide-in-from-right',
              'duration-300 ease-out',
            ],
            className
          )}
        >
          {/* Header with close button */}
          {showCloseButton && (
            <div
              className={cn(
                'flex items-center h-16 px-4',
                'border-b',
                isDark ? 'border-slate-700/50' : 'border-slate-200',
                isLeft ? 'justify-end' : 'justify-start'
              )}
            >
              <button
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
                )}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
        </div>
      </div>
    </FocusTrap>
  );
}

// ============================================
// NAVIGATION DRAWER PRESET
// ============================================

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  activeItem?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * NavigationDrawer - A pre-built navigation drawer with menu items
 *
 * @example
 * ```tsx
 * <NavigationDrawer
 *   isOpen={isMenuOpen}
 *   onClose={() => setIsMenuOpen(false)}
 *   items={[
 *     { id: 'home', label: 'Home', href: '/', icon: <Home /> },
 *     { id: 'jobs', label: 'Jobs', href: '/jobs', icon: <FileText />, badge: 3 },
 *   ]}
 *   activeItem="home"
 *   header={<Logo />}
 * />
 * ```
 */
export function NavigationDrawer({
  isOpen,
  onClose,
  items,
  activeItem,
  header,
  footer,
}: NavigationDrawerProps) {
  return (
    <MobileDrawer isOpen={isOpen} onClose={onClose} position="left">
      <div className="flex flex-col h-full">
        {/* Header */}
        {header && (
          <div className="px-4 py-4 border-b border-slate-700/50">{header}</div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'text-base font-medium',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                {item.icon && (
                  <span
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      isActive
                        ? 'bg-amber-400/30 text-amber-300'
                        : 'bg-slate-700 text-slate-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-4 border-t border-slate-700/50">{footer}</div>
        )}
      </div>
    </MobileDrawer>
  );
}
