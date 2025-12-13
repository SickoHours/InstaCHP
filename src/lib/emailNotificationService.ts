/**
 * Email Notification Service - V1 Stub
 * Prepares for V2 backend integration with email service.
 *
 * V1: Console logging only (no actual emails sent)
 * V2: Real email integration via Resend/SendGrid/etc.
 *
 * @version V1.9.0
 */

import type { Job } from './types';

/**
 * Send email notification when authorization document is uploaded
 *
 * V1: Logs to console only
 * V2: Will send actual email to staff/team
 *
 * @param job - The job for which authorization was uploaded
 */
export async function sendAuthorizationUploadedEmail(job: Job): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[EmailService] Authorization Uploaded Email', {
      jobId: job._id,
      reportNumber: job.reportNumber,
      clientName: job.clientName,
      lawFirm: job.lawFirmName,
      uploadedAt: job.escalationData?.authorizationUploadedAt,
      timestamp: new Date().toISOString(),
    });
  }

  // V2 TODO: Implement actual email sending
  // Example:
  // await emailProvider.send({
  //   to: STAFF_EMAIL,
  //   subject: `Authorization Ready: ${job.reportNumber}`,
  //   body: `Authorization document uploaded for ${job.clientName}...`,
  // });
}
