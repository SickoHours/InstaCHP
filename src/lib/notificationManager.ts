/**
 * NotificationManager - V1.8.0 Internal Notification System
 *
 * Singleton managing notifications for escalation workflow events.
 * Prepares for future email integration while providing in-app
 * notification feed with magic link simulation.
 *
 * All data stays in browser memory - resets on page refresh.
 */

import type { Job, EscalationReason, PickupTimeSlot } from './types';
import {
  type Notification,
  type NotificationType,
  type NotificationRecipient,
  type MagicLink,
  type NotificationMetadata,
  type NotificationTrigger,
  NOTIFICATION_TEMPLATES,
} from './notificationTypes';
import { generateId } from './utils';
import { generateMagicLink, generateThreadId } from './magicLinks';
import { sendAuthorizationUploadedEmail } from './emailNotificationService';

// ============================================================================
// Notification Manager Class
// ============================================================================

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize empty - notifications are created during runtime
    this.notifications = [];
  }

  // ==========================================================================
  // Core CRUD Operations
  // ==========================================================================

  /**
   * Get all notifications, optionally filtered.
   */
  getAll(): Notification[] {
    return [...this.notifications].sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get notifications for a specific job.
   */
  getByJobId(jobId: string): Notification[] {
    return this.notifications
      .filter((n) => n.jobId === jobId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get notifications for a specific recipient type.
   * In dev mode, returns all notifications.
   */
  getByRecipient(
    recipientType: 'law_firm' | 'staff',
    devMode: boolean = false
  ): Notification[] {
    if (devMode) {
      return this.getAll();
    }
    return this.notifications
      .filter((n) => n.recipients.some((r) => r.type === recipientType))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get unread count for a recipient type.
   */
  getUnreadCount(recipientType: 'law_firm' | 'staff', devMode: boolean = false): number {
    const notifications = this.getByRecipient(recipientType, devMode);
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Mark a notification as read.
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n._id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read for a recipient type.
   */
  markAllAsRead(recipientType: 'law_firm' | 'staff'): void {
    this.notifications
      .filter((n) => n.recipients.some((r) => r.type === recipientType))
      .forEach((n) => {
        n.read = true;
      });
    this.notifyListeners();
  }

  /**
   * Get or create a thread ID for a job.
   * All notifications for the same job share the same thread ID.
   */
  getThreadIdForJob(jobId: string): string {
    const existingNotification = this.notifications.find((n) => n.jobId === jobId);
    if (existingNotification) {
      return existingNotification.threadId;
    }
    return generateThreadId(jobId);
  }

  // ==========================================================================
  // Notification Emission
  // ==========================================================================

  /**
   * Emit a notification.
   * This is the main method for creating notifications.
   */
  emit(params: {
    type: NotificationType;
    job: Job;
    triggeredBy: NotificationTrigger;
    metadata?: Partial<NotificationMetadata>;
  }): Notification {
    const { type, job, triggeredBy, metadata = {} } = params;
    const template = NOTIFICATION_TEMPLATES[type];

    // Get or create thread ID
    const threadId = this.getThreadIdForJob(job._id);

    // Build recipients
    const recipients: NotificationRecipient[] = template.defaultRecipients.map(
      (recipientType) => ({
        type: recipientType,
        name: recipientType === 'law_firm' ? job.lawFirmName : 'Staff',
      })
    );

    // Build subject with placeholders replaced
    const subject = this.replacePlaceholders(template.subjectTemplate, job, metadata);

    // Build body with placeholders replaced
    const body = this.replacePlaceholders(template.bodyTemplate, job, metadata);

    // Build magic links
    const magicLinks: MagicLink[] = template.magicLinkActions.map((action) =>
      generateMagicLink(action, job._id, metadata.downloadToken)
    );

    // Create notification
    const notification: Notification = {
      _id: `notif_${generateId()}`,
      jobId: job._id,
      threadId,
      type,
      recipients,
      subject,
      body,
      magicLinks,
      createdAt: Date.now(),
      read: false,
      metadata: {
        triggeredBy,
        ...metadata,
      },
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Log in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationManager] Emitted:', {
        type,
        jobId: job._id,
        recipients: recipients.map((r) => r.type),
        subject,
      });
    }

    return notification;
  }

  /**
   * Replace placeholders in template strings.
   */
  private replacePlaceholders(
    template: string,
    job: Job,
    metadata: Partial<NotificationMetadata>
  ): string {
    return template
      .replace('{reportNumber}', job.reportNumber)
      .replace('{clientName}', job.clientName)
      .replace('{scheduledDate}', metadata.scheduledPickupDate || '')
      .replace('{scheduledTime}', this.formatPickupTime(metadata.scheduledPickupTime));
  }

  /**
   * Format pickup time for display.
   */
  private formatPickupTime(time?: PickupTimeSlot): string {
    if (!time) return '';
    const times: Record<PickupTimeSlot, string> = {
      '9am': '9:00 AM',
      afternoon: '12:00 PM',
      '4pm': '4:00 PM',
    };
    return times[time] || time;
  }

  // ==========================================================================
  // Convenience Methods for Specific Events
  // ==========================================================================

  /**
   * Emit escalation started notification.
   * Called when a job is escalated (manual, auto, or fatal).
   */
  emitEscalationStarted(job: Job, reason: EscalationReason): Notification {
    return this.emit({
      type: 'ESCALATION_STARTED',
      job,
      triggeredBy: reason === 'fatal_report' ? 'law_firm' : 'system',
      metadata: {
        escalationReason: reason,
      },
    });
  }

  /**
   * Emit authorization requested notification.
   * Called automatically after escalation (usually combined with ESCALATION_STARTED).
   */
  emitAuthorizationRequested(job: Job): Notification {
    return this.emit({
      type: 'AUTHORIZATION_REQUESTED',
      job,
      triggeredBy: 'system',
    });
  }

  /**
   * Emit authorization uploaded notification.
   * Called when law firm uploads authorization document.
   *
   * V1.9.0: Triggers email notification (stub in V1, real in V2)
   */
  emitAuthorizationUploaded(job: Job): Notification {
    const notification = this.emit({
      type: 'AUTHORIZATION_UPLOADED',
      job,
      triggeredBy: 'law_firm',
    });

    // V1.9.0: Trigger email notification (stub in V1, real in V2)
    sendAuthorizationUploadedEmail(job).catch((err) => {
      console.error('[NotificationManager] Email send failed:', err);
    });

    return notification;
  }

  /**
   * Emit pickup claimed notification.
   * Called when staff claims the pickup.
   */
  emitPickupClaimed(job: Job, staffMemberName: string): Notification {
    return this.emit({
      type: 'PICKUP_CLAIMED',
      job,
      triggeredBy: 'staff',
      metadata: {
        staffMemberName,
      },
    });
  }

  /**
   * Emit pickup scheduled notification.
   * Called when staff schedules pickup time.
   */
  emitPickupScheduled(
    job: Job,
    scheduledPickupTime: PickupTimeSlot,
    scheduledPickupDate: string
  ): Notification {
    return this.emit({
      type: 'PICKUP_SCHEDULED',
      job,
      triggeredBy: 'staff',
      metadata: {
        scheduledPickupTime,
        scheduledPickupDate,
      },
    });
  }

  /**
   * Emit report ready notification.
   * Called when staff uploads report (face page or full).
   */
  emitReportReady(
    job: Job,
    reportType: 'face_page' | 'full_report',
    downloadToken: string
  ): Notification {
    return this.emit({
      type: 'REPORT_READY',
      job,
      triggeredBy: 'staff',
      metadata: {
        reportType,
        downloadToken,
      },
    });
  }

  // ==========================================================================
  // Subscription / Listener Pattern
  // ==========================================================================

  /**
   * Subscribe to notification changes.
   * Returns unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes.
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // ==========================================================================
  // Dev/Testing Methods
  // ==========================================================================

  /**
   * Clear all notifications (for testing).
   */
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get notification by ID.
   */
  getById(notificationId: string): Notification | undefined {
    return this.notifications.find((n) => n._id === notificationId);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

// Create singleton instance
let instance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (!instance) {
    instance = new NotificationManager();
  }
  return instance;
}

// Export default instance for convenience
export const notificationManager = getNotificationManager();

// Export class for testing
export { NotificationManager };
