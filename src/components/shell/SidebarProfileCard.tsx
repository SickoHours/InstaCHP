'use client';

/**
 * SidebarProfileCard - V2.0.0
 *
 * Profile card shown at the bottom of the app shell sidebar.
 * Displays the law firm or staff name with an initials avatar.
 * ChatGPT-style bottom-left positioning.
 */

import { cn } from '@/lib/utils';
import { ChevronUp, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SidebarProfileCardProps {
  /** Display name (law firm name or staff name) */
  name: string;
  /** Optional subtitle (e.g., role) */
  subtitle?: string;
  /** User type for styling */
  userType: 'law_firm' | 'staff';
  /** Whether sidebar is collapsed (icon-only mode) */
  isCollapsed?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Generate initials from a name
 * "Martinez & Associates" -> "MA"
 * "John Smith" -> "JS"
 */
function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  // Take first letter of first and last significant words
  const firstLetter = words[0].charAt(0);
  const lastLetter = words[words.length - 1].charAt(0);
  return (firstLetter + lastLetter).toUpperCase();
}

export function SidebarProfileCard({
  name,
  subtitle,
  userType,
  isCollapsed = false,
  className,
}: SidebarProfileCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(name);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg',
          'glass-subtle',
          'hover:bg-white/5 active:bg-white/10',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset',
          isCollapsed && 'justify-center'
        )}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        {/* Avatar */}
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex-shrink-0',
            'flex items-center justify-center',
            'text-sm font-semibold',
            userType === 'law_firm'
              ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white'
              : 'bg-gradient-to-br from-violet-500 to-violet-700 text-white'
          )}
        >
          {initials}
        </div>

        {/* Name and subtitle (hidden when collapsed) */}
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              {subtitle && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>

            {/* Chevron */}
            <ChevronUp
              className={cn(
                'w-4 h-4 text-slate-500 transition-transform duration-200',
                isMenuOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 mb-2',
            'glass-elevated rounded-lg overflow-hidden',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
            'shadow-xl shadow-black/30',
            'border border-slate-700/50'
          )}
          role="menu"
        >
          {/* Settings option */}
          <button
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3',
              'text-sm text-slate-300',
              'hover:bg-white/5 hover:text-white',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:bg-white/5'
            )}
            role="menuitem"
            onClick={() => {
              // Future: Open settings
              setIsMenuOpen(false);
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-700/50" />

          {/* Sign out option */}
          <button
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3',
              'text-sm text-slate-300',
              'hover:bg-white/5 hover:text-white',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:bg-white/5'
            )}
            role="menuitem"
            onClick={() => {
              // Future: Sign out
              setIsMenuOpen(false);
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SidebarProfileCard;
