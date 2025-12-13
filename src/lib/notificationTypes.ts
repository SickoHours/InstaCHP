/**
 * Notification System Types
 *
 * Internal notification system for escalation workflow events.
 * Prepares for future email integration while providing
 * in-app notification feed with magic link simulation.
 *
 * @version V1.8.0
 */

import type { EscalationReason, PickupTimeSlot } from './types';

// ============================================================================
// Notification Types
// ============================================================================

/**
 * Types of notifications that can be emitted.
 * Each maps to a future email template.
 */
export type NotificationType =
  | 'ESCALATION_STARTED' // Job escalated (any reason) - creates new thread
  | 'AUTHORIZATION_REQUESTED' // System requests auth doc from law firm
  | 'AUTHORIZATION_UPLOADED' // Law firm uploaded auth doc
  | 'PICKUP_CLAIMED' // Staff claimed the pickup
  | 'PICKUP_SCHEDULED' // Staff scheduled pickup time
  | 'REPORT_READY'; // Report uploaded and ready for download

/**
 * Who should receive the notification.
 */
export type RecipientType = 'law_firm' | 'staff';

/**
 * Who triggered the notification.
 */
export type NotificationTrigger = 'system' | 'staff' | 'law_firm';

// ============================================================================
// Magic Link Types
// ============================================================================

/**
 * Actions that magic links can perform.
 */
export type MagicLinkAction = 'upload_auth' | 'view_job' | 'download_report';

/**
 * A magic link that can be included in notifications.
 * In V1, these simulate deep links. In V2+, they'll be actual email links.
 */
export interface MagicLink {
  /** The action this link performs */
  action: MagicLinkAction;
  /** Encoded token for the link */
  token: string;
  /** Full URL path (relative) */
  url: string;
  /** When this link expires (Unix timestamp ms) */
  expiresAt: number;
  /** Human-readable label for the button */
  label: string;
}

// ============================================================================
// Recipient Types
// ============================================================================

/**
 * A notification recipient.
 */
export interface NotificationRecipient {
  /** Type of recipient */
  type: RecipientType;
  /** Display name (e.g., "Smith & Associates" or "Staff") */
  name: string;
  /** Email address (for future email integration) */
  email?: string;
}

// ============================================================================
// Notification Interface
// ============================================================================

/**
 * Metadata specific to each notification type.
 */
export interface NotificationMetadata {
  /** Who triggered this notification */
  triggeredBy: NotificationTrigger;
  /** Links to the JobEvent that caused this notification */
  triggerEventId?: string;
  /** For escalation notifications: why was it escalated? */
  escalationReason?: EscalationReason;
  /** For pickup scheduled notifications */
  scheduledPickupTime?: PickupTimeSlot;
  scheduledPickupDate?: string;
  /** For report ready notifications */
  downloadToken?: string;
  reportType?: 'face_page' | 'full_report';
  /** Staff member name (for claimed/scheduled notifications) */
  staffMemberName?: string;
}

/**
 * A notification record.
 */
export interface Notification {
  /** Unique notification ID */
  _id: string;
  /** Job this notification belongs to */
  jobId: string;
  /** Thread ID for email grouping (all notifications for same job share this) */
  threadId: string;
  /** Type of notification */
  type: NotificationType;
  /** Who should receive this notification */
  recipients: NotificationRecipient[];
  /** Email subject line (for future email) */
  subject: string;
  /** Notification body/message */
  body: string;
  /** Magic links included in this notification */
  magicLinks: MagicLink[];
  /** When this notification was created */
  createdAt: number;
  /** Whether this notification has been read */
  read: boolean;
  /** Additional metadata */
  metadata: NotificationMetadata;
}

// ============================================================================
// Notification Templates
// ============================================================================

/**
 * Template for generating notification content.
 * Used by NotificationManager to create notifications.
 */
export interface NotificationTemplate {
  type: NotificationType;
  /** Subject line template (supports {reportNumber}, {clientName} placeholders) */
  subjectTemplate: string;
  /** Body template */
  bodyTemplate: string;
  /** Default recipients for this notification type */
  defaultRecipients: RecipientType[];
  /** Magic link actions to include */
  magicLinkActions: MagicLinkAction[];
}

/**
 * Notification templates for each type.
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  ESCALATION_STARTED: {
    type: 'ESCALATION_STARTED',
    subjectTemplate: 'Action Required: Report #{reportNumber}',
    bodyTemplate:
      'Your report request requires additional steps. We need your Authorization to Obtain Governmental Agency Records and Reports to proceed with manual pickup from CHP.',
    defaultRecipients: ['law_firm', 'staff'],
    magicLinkActions: ['upload_auth', 'view_job'],
  },
  AUTHORIZATION_REQUESTED: {
    type: 'AUTHORIZATION_REQUESTED',
    subjectTemplate: 'RE: Action Required: Report #{reportNumber}',
    bodyTemplate:
      'Please upload your Authorization to Obtain Governmental Agency Records and Reports so we can proceed with picking up your report from CHP.',
    defaultRecipients: ['law_firm'],
    magicLinkActions: ['upload_auth'],
  },
  AUTHORIZATION_UPLOADED: {
    type: 'AUTHORIZATION_UPLOADED',
    subjectTemplate: 'RE: Action Required: Report #{reportNumber}',
    bodyTemplate:
      'The law firm has uploaded the authorization document. This job is ready for pickup assignment.',
    defaultRecipients: ['staff'],
    magicLinkActions: ['view_job'],
  },
  PICKUP_CLAIMED: {
    type: 'PICKUP_CLAIMED',
    subjectTemplate: 'RE: Action Required: Report #{reportNumber}',
    bodyTemplate:
      'A team member is now actively working on your request. We will notify you once the pickup is scheduled.',
    defaultRecipients: ['law_firm'],
    magicLinkActions: ['view_job'],
  },
  PICKUP_SCHEDULED: {
    type: 'PICKUP_SCHEDULED',
    subjectTemplate: 'RE: Action Required: Report #{reportNumber}',
    bodyTemplate:
      'Your report pickup has been scheduled for {scheduledDate} at {scheduledTime}. We will notify you once the report is ready.',
    defaultRecipients: ['law_firm'],
    magicLinkActions: ['view_job'],
  },
  REPORT_READY: {
    type: 'REPORT_READY',
    subjectTemplate: 'RE: Action Required: Report #{reportNumber}',
    bodyTemplate: 'Your report is now ready to download.',
    defaultRecipients: ['law_firm'],
    magicLinkActions: ['download_report', 'view_job'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get human-readable label for notification type.
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    ESCALATION_STARTED: 'Escalated - needs pickup',
    AUTHORIZATION_REQUESTED: 'Authorization requested',
    AUTHORIZATION_UPLOADED: 'Authorization uploaded',
    PICKUP_CLAIMED: 'Pickup claimed',
    PICKUP_SCHEDULED: 'Pickup scheduled',
    REPORT_READY: 'Report ready',
  };
  return labels[type];
}

/**
 * Get icon name for notification type (lucide-react icon name).
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    ESCALATION_STARTED: 'AlertTriangle',
    AUTHORIZATION_REQUESTED: 'Upload',
    AUTHORIZATION_UPLOADED: 'CheckCircle',
    PICKUP_CLAIMED: 'UserCheck',
    PICKUP_SCHEDULED: 'Calendar',
    REPORT_READY: 'FileCheck',
  };
  return icons[type];
}

/**
 * Get color class for notification type.
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    ESCALATION_STARTED: 'text-amber-400',
    AUTHORIZATION_REQUESTED: 'text-blue-400',
    AUTHORIZATION_UPLOADED: 'text-emerald-400',
    PICKUP_CLAIMED: 'text-blue-400',
    PICKUP_SCHEDULED: 'text-blue-400',
    REPORT_READY: 'text-emerald-400',
  };
  return colors[type];
}

/**
 * Format recipients for display.
 */
export function formatRecipients(recipients: NotificationRecipient[]): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) {
    return recipients[0].type === 'law_firm' ? 'Law Firm' : 'Staff';
  }
  // Both recipients
  return 'Law Firm + Staff';
}

/**
 * Check if a recipient type is in the recipients list.
 */
export function hasRecipient(
  recipients: NotificationRecipient[],
  type: RecipientType
): boolean {
  return recipients.some((r) => r.type === type);
}
