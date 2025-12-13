# Notification System (V1.8.0+)

Internal notification system for tracking escalation workflow events. Prepares for future email integration while providing in-app notification feed with magic link simulation.

**V1.9.0 Update:** Email notification service stub added (`emailNotificationService.ts`). Wired into `notificationManager.emitAuthorizationUploaded()` for immediate V2 integration readiness.

## Overview

The notification system tracks key events in the escalation workflow:
1. **Escalation Started** - When a job is escalated (manual, auto, or fatal)
2. **Authorization Requested** - System prompts law firm to upload auth doc
3. **Authorization Uploaded** - Law firm uploads authorization document
4. **Pickup Claimed** - Staff claims the pickup assignment
5. **Pickup Scheduled** - Staff schedules pickup time
6. **Report Ready** - Staff uploads report (face page or full)

## Architecture

```
NotificationManager (singleton)
    ↓
NotificationBell (UI component)
    ↓
NotificationItem (individual notifications)
    ↓
Magic Links (simulated deep links)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/notificationTypes.ts` | Type definitions and templates |
| `src/lib/notificationManager.ts` | Singleton manager for notifications |
| `src/lib/magicLinks.ts` | Token generation and decoding |
| `src/app/m/[token]/page.tsx` | Magic link route handler |
| `src/components/ui/NotificationBell.tsx` | Bell icon + dropdown panel |
| `src/components/ui/NotificationItem.tsx` | Individual notification cards |

## Notification Types

### `ESCALATION_STARTED`
- **Trigger:** Job escalated (any reason)
- **Recipients:** Law Firm + Staff
- **Thread:** Creates new thread
- **Magic Links:** Upload Auth, View Job

### `AUTHORIZATION_REQUESTED`
- **Trigger:** After escalation (auto-sent)
- **Recipients:** Law Firm
- **Thread:** Reply
- **Magic Links:** Upload Auth

### `AUTHORIZATION_UPLOADED`
- **Trigger:** Law firm uploads auth doc
- **Recipients:** Staff
- **Thread:** Reply
- **Magic Links:** View Job

### `PICKUP_CLAIMED`
- **Trigger:** Staff claims pickup
- **Recipients:** Law Firm
- **Thread:** Reply
- **Magic Links:** View Job

### `PICKUP_SCHEDULED`
- **Trigger:** Staff schedules pickup time
- **Recipients:** Law Firm
- **Thread:** Reply
- **Magic Links:** View Job

### `REPORT_READY`
- **Trigger:** Staff uploads report
- **Recipients:** Law Firm
- **Thread:** Reply
- **Magic Links:** Download Report, View Job

## Usage

### Emitting Notifications

```typescript
import { notificationManager } from '@/lib/notificationManager';

// Escalation started
notificationManager.emitEscalationStarted(job, 'manual');
notificationManager.emitEscalationStarted(job, 'auto_exhausted');
notificationManager.emitEscalationStarted(job, 'fatal_report');

// Authorization uploaded
notificationManager.emitAuthorizationUploaded(job);

// Pickup claimed
notificationManager.emitPickupClaimed(job, 'Staff Member Name');

// Pickup scheduled
notificationManager.emitPickupScheduled(job, '9am', '2025-12-15');

// Report ready
notificationManager.emitReportReady(job, 'full_report', 'fr_token_123');
notificationManager.emitReportReady(job, 'face_page', 'fp_token_123');
```

### Querying Notifications

```typescript
// Get all notifications
const all = notificationManager.getAll();

// Get notifications for a job
const jobNotifs = notificationManager.getByJobId('job_001');

// Get notifications for a recipient type
const lawFirmNotifs = notificationManager.getByRecipient('law_firm');
const staffNotifs = notificationManager.getByRecipient('staff');

// Dev mode: get all notifications regardless of recipient
const devNotifs = notificationManager.getByRecipient('law_firm', true);

// Unread count
const unreadCount = notificationManager.getUnreadCount('law_firm');
```

### UI Components

```tsx
import { NotificationBell } from '@/components/ui';

// In law firm dashboard
<NotificationBell userType="law_firm" />

// In staff dashboard
<NotificationBell userType="staff" />
```

## Magic Links

### Token Format

```
{action}_{jobId}_{expiry}
```

Examples:
- `ma_job_001_1735689600000` - Upload authorization
- `mv_job_001_1735689600000` - View job
- `md_job_001_fr_token_123_1735689600000` - Download report

### Actions

| Action | Prefix | Redirects To |
|--------|--------|--------------|
| `upload_auth` | `ma` | `/law/jobs/{jobId}?action=upload_auth` |
| `view_job` | `mv` | `/law/jobs/{jobId}` |
| `download_report` | `md` | `/law/jobs/{jobId}?action=download` |

## Dev Mode

In development mode (`NODE_ENV === 'development'`):
- All notifications are visible regardless of recipient type
- DEV badge shown in notification dropdown
- Enables full workflow testing from either law firm or staff view

## Thread Management

All notifications for a job share the same `threadId`:
- Generated when first notification is created for job
- Stored in notification records
- Used for future email thread grouping

---

## Email Implementation Plan (Future)

### Thread Behavior

All emails for the same job will be on the same thread:
1. Use `In-Reply-To` and `References` email headers
2. Subject line format: "RE: Action Required: Report #{reportNumber}"
3. Thread ID stored in `Job.escalationData.emailThreadId`

### Email Templates

| Notification | Subject | Recipients |
|--------------|---------|------------|
| ESCALATION_STARTED | Action Required: Report #{reportNumber} | Law Firm + Staff |
| AUTHORIZATION_REQUESTED | RE: Action Required: Report #{reportNumber} | Law Firm |
| AUTHORIZATION_UPLOADED | RE: Action Required: Report #{reportNumber} | Staff |
| PICKUP_CLAIMED | RE: Action Required: Report #{reportNumber} | Law Firm |
| PICKUP_SCHEDULED | RE: Action Required: Report #{reportNumber} | Law Firm |
| REPORT_READY | RE: Action Required: Report #{reportNumber} | Law Firm |

### Required Data Per Email

| Email | Data Needed |
|-------|-------------|
| ESCALATION_STARTED | jobId, reportNumber, clientName, escalationReason, magicLink(upload_auth) |
| AUTHORIZATION_UPLOADED | jobId, reportNumber, clientName, uploadedAt |
| PICKUP_CLAIMED | jobId, reportNumber, clientName, claimedBy, magicLink(view_job) |
| PICKUP_SCHEDULED | jobId, reportNumber, clientName, scheduledDate, scheduledTime, magicLink(view_job) |
| REPORT_READY | jobId, reportNumber, clientName, reportType, magicLink(download) |

### Provider Considerations

- Provider must support `In-Reply-To` header for threading
- Consider: Resend, SendGrid, Postmark
- V2 will add HMAC signatures to magic links for security
- Rate limiting: One email per notification type per job

---

*Last Updated: 2025-12-12*
*Version: V1.8.0*
