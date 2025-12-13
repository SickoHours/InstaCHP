'use client';

/**
 * NotificationBell - V1.8.0
 *
 * Bell icon with unread count badge that opens a notification dropdown.
 * Shows notifications with quick actions that simulate magic link behavior.
 *
 * Dev mode shows ALL notifications regardless of recipient type.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    notificationManager.markAsRead(notification._id);

    // Navigate to job
    const basePath = userType === 'law_firm' ? '/law' : '/staff';
    router.push(`${basePath}/jobs/${notification.jobId}`);

    // Close dropdown
    setIsOpen(false);
  };

  // Handle quick action click
  const handleQuickAction = (notification: Notification, actionUrl: string) => {
    // Mark as read
    notificationManager.markAsRead(notification._id);

    // Navigate to action URL
    router.push(actionUrl);

    // Close dropdown
    setIsOpen(false);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead(userType);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
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
        <div className="absolute right-0 mt-2 w-80 md:w-96 max-h-[70vh] overflow-hidden bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
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
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
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
