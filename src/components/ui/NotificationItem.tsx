'use client';

/**
 * NotificationItem - V1.8.0
 *
 * Individual notification card with quick action buttons.
 * Displays notification details and action buttons that simulate magic link behavior.
 */

import {
  AlertTriangle,
  Upload,
  CheckCircle,
  UserCheck,
  Calendar,
  FileCheck,
  ChevronRight,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { Notification, NotificationType, MagicLink } from '@/lib/notificationTypes';
import { formatRecipients } from '@/lib/notificationTypes';
import { getMagicLinkDestination } from '@/lib/magicLinks';
import { formatRelativeTime } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  userType: 'law_firm' | 'staff';
  onNotificationClick: (notification: Notification) => void;
  onQuickAction: (notification: Notification, actionUrl: string) => void;
}

// Icon mapping for notification types
const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  ESCALATION_STARTED: AlertTriangle,
  AUTHORIZATION_REQUESTED: Upload,
  AUTHORIZATION_UPLOADED: CheckCircle,
  PICKUP_CLAIMED: UserCheck,
  PICKUP_SCHEDULED: Calendar,
  REPORT_READY: FileCheck,
};

// Color mapping for notification types
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  ESCALATION_STARTED: 'text-amber-400 bg-amber-400/10',
  AUTHORIZATION_REQUESTED: 'text-blue-400 bg-blue-400/10',
  AUTHORIZATION_UPLOADED: 'text-emerald-400 bg-emerald-400/10',
  PICKUP_CLAIMED: 'text-blue-400 bg-blue-400/10',
  PICKUP_SCHEDULED: 'text-blue-400 bg-blue-400/10',
  REPORT_READY: 'text-emerald-400 bg-emerald-400/10',
};

// Border color mapping for unread notifications
const NOTIFICATION_BORDER_COLORS: Record<NotificationType, string> = {
  ESCALATION_STARTED: 'border-l-amber-400',
  AUTHORIZATION_REQUESTED: 'border-l-blue-400',
  AUTHORIZATION_UPLOADED: 'border-l-emerald-400',
  PICKUP_CLAIMED: 'border-l-blue-400',
  PICKUP_SCHEDULED: 'border-l-blue-400',
  REPORT_READY: 'border-l-emerald-400',
};

// Human-readable notification type labels
const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  ESCALATION_STARTED: 'Escalated - needs pickup',
  AUTHORIZATION_REQUESTED: 'Authorization requested',
  AUTHORIZATION_UPLOADED: 'Authorization uploaded',
  PICKUP_CLAIMED: 'Pickup claimed',
  PICKUP_SCHEDULED: 'Pickup scheduled',
  REPORT_READY: 'Report ready',
};

export function NotificationItem({
  notification,
  userType,
  onNotificationClick,
  onQuickAction,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const colorClass = NOTIFICATION_COLORS[notification.type];
  const borderClass = NOTIFICATION_BORDER_COLORS[notification.type];
  const label = NOTIFICATION_LABELS[notification.type];

  // Extract report number from subject (format: "Action Required: Report #XXXX-XXXX-XXXXX")
  const reportNumberMatch = notification.subject.match(/#(\d{4}-\d{4}-\d{5})/);
  const reportNumber = reportNumberMatch ? reportNumberMatch[1] : notification.jobId;

  // Get quick action buttons based on magic links
  const quickActions = notification.magicLinks.map((link) => ({
    ...link,
    destinationUrl: getMagicLinkDestination(
      link.action,
      notification.jobId,
      userType,
      notification.metadata.downloadToken
    ),
  }));

  return (
    <div
      className={`relative px-4 py-3 hover:bg-slate-800/50 transition-colors cursor-pointer border-l-2 ${
        notification.read ? 'border-l-transparent bg-transparent' : `${borderClass} bg-slate-800/20`
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      {/* Main Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Report Number + Type */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-white truncate">
              Report #{reportNumber}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            )}
          </div>

          {/* Notification Label */}
          <p className="text-sm text-slate-300 mb-1">{label}</p>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>To: {formatRecipients(notification.recipients)}</span>
            <span>•</span>
            <span>{formatRelativeTime(notification.createdAt)}</span>
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  action={action}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction(notification, action.destinationUrl);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

// Quick action button component
interface QuickActionButtonProps {
  action: MagicLink & { destinationUrl: string };
  onClick: (e: React.MouseEvent) => void;
}

function QuickActionButton({ action, onClick }: QuickActionButtonProps) {
  // Determine icon based on action type
  let ActionIcon = ExternalLink;
  if (action.action === 'upload_auth') {
    ActionIcon = Upload;
  } else if (action.action === 'download_report') {
    ActionIcon = Download;
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors"
    >
      <ActionIcon className="w-3 h-3" />
      {action.label}
    </button>
  );
}

export default NotificationItem;
