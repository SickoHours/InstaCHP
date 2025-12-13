'use client';

/**
 * NotificationBell - V2.0.0
 *
 * Bell icon with unread count badge that opens a notification dropdown.
 * Shows notifications with quick actions that simulate magic link behavior.
 *
 * V2.0.0 Enhancements:
 * - Glass-elevated styling for dropdown panel
 * - Keyboard support (Escape to close)
 * - Focus return to bell button when closing
 * - Improved animations
 *
 * Dev mode shows ALL notifications regardless of recipient type.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationManager } from '@/lib/notificationManager';
import type { Notification } from '@/lib/notificationTypes';
import { NotificationItem } from './NotificationItem';
import { DEV_MODE } from '@/lib/devConfig';

interface NotificationBellProps {
  /** Which user type is viewing (law_firm or staff) */
  userType: 'law_firm' | 'staff';
}

export function NotificationBell({ userType }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load notifications and subscribe to changes
  useEffect(() => {
    function loadNotifications() {
      const notifs = notificationManager.getByRecipient(userType, DEV_MODE);
      setNotifications(notifs);
      setUnreadCount(notificationManager.getUnreadCount(userType, DEV_MODE));
    }

    // Initial load
    loadNotifications();

    // Subscribe to changes
    const unsubscribe = notificationManager.subscribe(loadNotifications);

    return () => {
      unsubscribe();
    };
  }, [userType]);

  // Close dropdown and return focus to button
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    // Return focus to the bell button
    buttonRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // Keyboard support: Escape to close
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDropdown]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    notificationManager.markAsRead(notification._id);

    // Navigate to job
    const basePath = userType === 'law_firm' ? '/law' : '/staff';
    router.push(`${basePath}/jobs/${notification.jobId}`);

    // Close dropdown
    closeDropdown();
  };

  // Handle quick action click
  const handleQuickAction = (notification: Notification, actionUrl: string) => {
    // Mark as read
    notificationManager.markAsRead(notification._id);

    // Navigate to action URL
    router.push(actionUrl);

    // Close dropdown
    closeDropdown();
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead(userType);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-xl',
          'bg-slate-800/50 hover:bg-slate-700/50',
          'border border-slate-700/50 hover:border-slate-600/50',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          isOpen && 'bg-slate-700/50 border-slate-600/50'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-slate-300" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-medium bg-amber-500 text-white rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-80 md:w-96 max-h-[70vh] overflow-hidden',
            'glass-elevated',
            'border border-slate-700/50 rounded-2xl',
            'shadow-2xl shadow-black/50',
            'z-50',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {DEV_MODE && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-mono">
                  DEV
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-teal-400"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={closeDropdown}
                className={cn(
                  'p-1.5 rounded-lg',
                  'text-slate-400 hover:text-white',
                  'hover:bg-white/5',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
                )}
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  You&apos;ll see updates about your reports here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    userType={userType}
                    onNotificationClick={handleNotificationClick}
                    onQuickAction={handleQuickAction}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/20">
              <p className="text-xs text-slate-500 text-center">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
