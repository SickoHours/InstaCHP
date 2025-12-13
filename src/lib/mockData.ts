/**
 * Mock data for InstaTCR V1 MVP
 * 18 sample jobs covering all 13 status types
 */

import type { Job } from './types';

// ============================================
// LAW FIRMS
// ============================================

export const LAW_FIRMS = {
  MARTINEZ: { id: 'lf_martinez', name: 'Martinez & Associates' },
  JOHNSON: { id: 'lf_johnson', name: 'Johnson Law Group' },
  CHEN: { id: 'lf_chen', name: 'Chen Personal Injury' },
  RIVERA: { id: 'lf_rivera', name: 'Rivera Legal Services' },
} as const;

// Default law firm for demo purposes
export const DEFAULT_LAW_FIRM_ID = LAW_FIRMS.MARTINEZ.id;
export const DEFAULT_LAW_FIRM_NAME = LAW_FIRMS.MARTINEZ.name;

// ============================================
// TIME HELPERS
// ============================================

const now = Date.now();
const hours = (n: number) => n * 60 * 60 * 1000;
const days = (n: number) => n * 24 * hours(1);

// ============================================
// MOCK JOBS (15 total)
// ============================================

export const mockJobs: Job[] = [
  // ========================================
  // NEW (1 job) - Just submitted
  // ========================================
  {
    _id: 'job_001',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0089',
    clientName: 'Maria Santos',
    clientType: 'driver',
    reportNumber: '9465-2025-02802',
    crashDate: '12/01/2025',
    crashTime: '1430',
    ncic: '9465',
    internalStatus: 'NEW',
    wrapperRuns: [],
    createdAt: now - hours(2),
    updatedAt: now - hours(2),
  },

  // ========================================
  // CALL_IN_PROGRESS (1 job) - Staff on phone
  // ========================================
  {
    _id: 'job_002',
    lawFirmId: LAW_FIRMS.JOHNSON.id,
    lawFirmName: LAW_FIRMS.JOHNSON.name,
    caseReference: 'JLG-2025-0234',
    clientName: 'Robert Chen',
    clientType: 'passenger',
    reportNumber: '9213-2025-01456',
    crashDate: '11/28/2025',
    crashTime: '0845',
    ncic: '9213',
    officerId: '034521',
    firstName: 'Robert',
    lastName: 'Chen',
    internalStatus: 'CALL_IN_PROGRESS',
    wrapperRuns: [],
    createdAt: now - hours(6),
    updatedAt: now - hours(1),
  },

  // ========================================
  // AUTOMATION_RUNNING (2 jobs) - Wrapper executing
  // ========================================
  {
    _id: 'job_003',
    lawFirmId: LAW_FIRMS.CHEN.id,
    lawFirmName: LAW_FIRMS.CHEN.name,
    clientName: 'Dora Cruz-Arteaga',
    clientType: 'driver',
    reportNumber: '9465-2025-02156',
    crashDate: '11/25/2025',
    crashTime: '1915',
    ncic: '9465',
    officerId: '045678',
    firstName: 'Dora',
    lastName: 'Cruz-Arteaga',
    plate: '8ABC123',
    internalStatus: 'AUTOMATION_RUNNING',
    wrapperRuns: [],
    createdAt: now - days(1),
    updatedAt: now - hours(0.5),
  },
  {
    _id: 'job_004',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0092',
    clientName: 'James Wilson',
    clientType: 'driver',
    reportNumber: '9312-2025-03421',
    crashDate: '11/22/2025',
    ncic: '9312',
    firstName: 'James',
    lastName: 'Wilson',
    driverLicense: 'D1234567',
    internalStatus: 'AUTOMATION_RUNNING',
    wrapperRuns: [
      {
        runId: 'run_001',
        timestamp: now - hours(4),
        result: 'PAGE1_NOT_FOUND',
        duration: 11200,
      },
    ],
    createdAt: now - days(2),
    updatedAt: now - hours(0.3),
  },

  // ========================================
  // FACE_PAGE_ONLY (2 jobs) - Waiting for full
  // ========================================
  {
    _id: 'job_005',
    lawFirmId: LAW_FIRMS.JOHNSON.id,
    lawFirmName: LAW_FIRMS.JOHNSON.name,
    caseReference: 'JLG-2025-0198',
    clientName: 'Sarah Kim',
    clientType: 'pedestrian',
    reportNumber: '9465-2025-01234',
    crashDate: '11/18/2025',
    crashTime: '2130',
    ncic: '9465',
    firstName: 'Sarah',
    lastName: 'Kim',
    internalStatus: 'FACE_PAGE_ONLY',
    facePageToken: 'fp_token_005',
    wrapperRuns: [
      {
        runId: 'run_002',
        timestamp: now - days(1),
        result: 'FACE_PAGE',
        duration: 9800,
      },
    ],
    autoCheckSettings: {
      enabled: true,
      frequency: 'daily',
      scheduledTimes: [{ hour: 16, minute: 30 }],
      scheduledChecksToday: 0,
    },
    createdAt: now - days(3),
    updatedAt: now - days(1),
  },
  {
    _id: 'job_006',
    lawFirmId: LAW_FIRMS.RIVERA.id,
    lawFirmName: LAW_FIRMS.RIVERA.name,
    clientName: 'Michael Thompson',
    clientType: 'driver',
    reportNumber: '9213-2025-02987',
    crashDate: '11/15/2025',
    ncic: '9213',
    firstName: 'Michael',
    lastName: 'Thompson',
    plate: '7XYZ789',
    internalStatus: 'FACE_PAGE_ONLY',
    facePageToken: 'fp_token_006',
    wrapperRuns: [
      {
        runId: 'run_003',
        timestamp: now - days(2),
        result: 'FACE_PAGE',
        duration: 10500,
      },
    ],
    autoCheckSettings: {
      enabled: true,
      frequency: 'daily',
      scheduledTimes: [{ hour: 16, minute: 30 }],
      scheduledChecksToday: 1,
      lastManualCheck: now - hours(6),
    },
    createdAt: now - days(4),
    updatedAt: now - days(2),
  },

  // ========================================
  // COMPLETED_FULL_REPORT (3 jobs) - Success
  // ========================================
  {
    _id: 'job_007',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0078',
    clientName: 'Jennifer Lopez',
    clientType: 'driver',
    reportNumber: '9465-2025-00789',
    crashDate: '11/10/2025',
    crashTime: '1045',
    ncic: '9465',
    officerId: '056789',
    firstName: 'Jennifer',
    lastName: 'Lopez',
    plate: '9DEF456',
    driverLicense: 'E9876543',
    internalStatus: 'COMPLETED_FULL_REPORT',
    facePageToken: 'fp_token_007',
    fullReportToken: 'fr_token_007',
    wrapperRuns: [
      {
        runId: 'run_004',
        timestamp: now - days(5),
        result: 'FULL',
        duration: 8900,
      },
    ],
    createdAt: now - days(6),
    updatedAt: now - days(5),
  },
  {
    _id: 'job_008',
    lawFirmId: LAW_FIRMS.CHEN.id,
    lawFirmName: LAW_FIRMS.CHEN.name,
    clientName: 'David Park',
    clientType: 'passenger',
    reportNumber: '9312-2025-01876',
    crashDate: '11/05/2025',
    ncic: '9312',
    firstName: 'David',
    lastName: 'Park',
    internalStatus: 'COMPLETED_FULL_REPORT',
    fullReportToken: 'fr_token_008',
    wrapperRuns: [
      {
        runId: 'run_005',
        timestamp: now - days(8),
        result: 'FULL',
        duration: 12100,
      },
    ],
    createdAt: now - days(10),
    updatedAt: now - days(8),
  },
  {
    _id: 'job_009',
    lawFirmId: LAW_FIRMS.JOHNSON.id,
    lawFirmName: LAW_FIRMS.JOHNSON.name,
    caseReference: 'JLG-2025-0156',
    clientName: 'Emily Rodriguez',
    clientType: 'driver',
    reportNumber: '9465-2025-00456',
    crashDate: '10/28/2025',
    crashTime: '0730',
    ncic: '9465',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    plate: '5GHI321',
    vin: '1HGBH41JXMN109186',
    internalStatus: 'COMPLETED_FULL_REPORT',
    facePageToken: 'fp_token_009',
    fullReportToken: 'fr_token_009',
    wrapperRuns: [
      {
        runId: 'run_006',
        timestamp: now - days(12),
        result: 'FACE_PAGE',
        duration: 9200,
      },
      {
        runId: 'run_007',
        timestamp: now - days(10),
        result: 'FULL',
        duration: 10800,
      },
    ],
    createdAt: now - days(14),
    updatedAt: now - days(10),
  },

  // ========================================
  // NEEDS_MORE_INFO (2 jobs) - Missing data
  // ========================================
  {
    _id: 'job_010',
    lawFirmId: LAW_FIRMS.RIVERA.id,
    lawFirmName: LAW_FIRMS.RIVERA.name,
    clientName: 'Andrew Miller',
    clientType: 'driver',
    reportNumber: '9465-2025-02345',
    crashDate: '11/20/2025',
    ncic: '9465',
    internalStatus: 'NEEDS_MORE_INFO',
    wrapperRuns: [],
    createdAt: now - days(2),
    updatedAt: now - hours(8),
  },
  {
    _id: 'job_011',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0095',
    clientName: 'Lisa Wang',
    clientType: 'passenger',
    reportNumber: '9312-2025-03678',
    crashDate: '11/12/2025',
    ncic: '9312',
    firstName: 'Lisa',
    lastName: 'Wang',
    internalStatus: 'NEEDS_MORE_INFO',
    wrapperRuns: [
      {
        runId: 'run_008',
        timestamp: now - days(3),
        result: 'PAGE1_NOT_FOUND',
        duration: 13000,
      },
    ],
    createdAt: now - days(5),
    updatedAt: now - days(3),
  },

  // ========================================
  // NEEDS_IN_PERSON_PICKUP (1 job) - Escalated
  // ========================================
  {
    _id: 'job_012',
    lawFirmId: LAW_FIRMS.CHEN.id,
    lawFirmName: LAW_FIRMS.CHEN.name,
    clientName: 'Kevin Brown',
    clientType: 'driver',
    reportNumber: '9465-2025-01567',
    crashDate: '10/15/2025',
    crashTime: '1600',
    ncic: '9465',
    officerId: '067890',
    firstName: 'Kevin',
    lastName: 'Brown',
    plate: '6JKL654',
    internalStatus: 'NEEDS_IN_PERSON_PICKUP',
    facePageToken: 'fp_token_012',
    wrapperRuns: [
      {
        runId: 'run_009',
        timestamp: now - days(15),
        result: 'FACE_PAGE',
        duration: 11000,
      },
      {
        runId: 'run_010',
        timestamp: now - days(10),
        result: 'PAGE1_NOT_FOUND',
        duration: 12500,
      },
    ],
    createdAt: now - days(20),
    updatedAt: now - days(7),
  },

  // ========================================
  // CANCELLED (1 job) - Request cancelled
  // ========================================
  {
    _id: 'job_013',
    lawFirmId: LAW_FIRMS.JOHNSON.id,
    lawFirmName: LAW_FIRMS.JOHNSON.name,
    caseReference: 'JLG-2025-0189',
    clientName: 'Amanda Taylor',
    clientType: 'other',
    reportNumber: '9213-2025-02100',
    crashDate: '11/01/2025',
    ncic: '9213',
    internalStatus: 'CANCELLED',
    wrapperRuns: [],
    createdAt: now - days(12),
    updatedAt: now - days(8),
  },

  // ========================================
  // AUTOMATION_ERROR (1 job) - Error state
  // ========================================
  {
    _id: 'job_014',
    lawFirmId: LAW_FIRMS.RIVERA.id,
    lawFirmName: LAW_FIRMS.RIVERA.name,
    clientName: 'Christopher Davis',
    clientType: 'driver',
    reportNumber: '9465-2025-02678',
    crashDate: '11/08/2025',
    crashTime: '1230',
    ncic: '9465',
    firstName: 'Christopher',
    lastName: 'Davis',
    plate: '4MNO987',
    internalStatus: 'AUTOMATION_ERROR',
    wrapperRuns: [
      {
        runId: 'run_011',
        timestamp: now - hours(12),
        result: 'PORTAL_ERROR',
        duration: 45000,
        errorMessage: 'Portal timeout after 45 seconds',
      },
    ],
    createdAt: now - days(3),
    updatedAt: now - hours(12),
  },

  // ========================================
  // COMPLETED_MANUAL (1 job) - Manual completion
  // ========================================
  {
    _id: 'job_015',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0065',
    clientName: 'Nicole Johnson',
    clientType: 'driver',
    reportNumber: '9312-2025-00987',
    crashDate: '10/20/2025',
    ncic: '9312',
    firstName: 'Nicole',
    lastName: 'Johnson',
    internalStatus: 'COMPLETED_MANUAL',
    facePageToken: 'fp_token_015',
    fullReportToken: 'fr_token_015',
    wrapperRuns: [
      {
        runId: 'run_012',
        timestamp: now - days(18),
        result: 'PAGE1_NOT_FOUND',
        duration: 11500,
      },
    ],
    createdAt: now - days(25),
    updatedAt: now - days(5),
  },

  // ========================================
  // NEEDS_CALL (1 job) - Awaiting staff call
  // ========================================
  {
    _id: 'job_016',
    lawFirmId: LAW_FIRMS.CHEN.id,
    lawFirmName: LAW_FIRMS.CHEN.name,
    clientName: 'Patricia Gonzalez',
    clientType: 'driver',
    reportNumber: '9213-2025-03456',
    crashDate: '12/05/2025',
    ncic: '9213',
    internalStatus: 'NEEDS_CALL',
    wrapperRuns: [],
    createdAt: now - hours(4),
    updatedAt: now - hours(3),
  },

  // ========================================
  // READY_FOR_AUTOMATION (1 job) - Page 1+2 complete, ready to run
  // ========================================
  {
    _id: 'job_017',
    lawFirmId: LAW_FIRMS.RIVERA.id,
    lawFirmName: LAW_FIRMS.RIVERA.name,
    caseReference: 'RLS-2025-0045',
    clientName: 'Thomas Anderson',
    clientType: 'passenger',
    reportNumber: '9465-2025-03012',
    crashDate: '12/03/2025',
    crashTime: '0915',
    ncic: '9465',
    officerId: '078901',
    firstName: 'Thomas',
    lastName: 'Anderson',
    plate: '3PQR567',
    internalStatus: 'READY_FOR_AUTOMATION',
    wrapperRuns: [],
    createdAt: now - hours(8),
    updatedAt: now - hours(2),
  },

  // ========================================
  // WAITING_FOR_FULL_REPORT (1 job) - Has face page, checking periodically
  // ========================================
  {
    _id: 'job_018',
    lawFirmId: LAW_FIRMS.MARTINEZ.id,
    lawFirmName: LAW_FIRMS.MARTINEZ.name,
    caseReference: 'MART-2025-0101',
    clientName: 'Rebecca Martinez',
    clientType: 'driver',
    reportNumber: '9312-2025-02567',
    crashDate: '11/28/2025',
    crashTime: '1730',
    ncic: '9312',
    officerId: '089012',
    firstName: 'Rebecca',
    lastName: 'Martinez',
    internalStatus: 'WAITING_FOR_FULL_REPORT',
    facePageToken: 'fp_token_018',
    wrapperRuns: [
      {
        runId: 'run_013',
        timestamp: now - days(2),
        result: 'FACE_PAGE',
        duration: 10200,
      },
    ],
    autoCheckSettings: {
      enabled: true,
      frequency: 'twice_daily',
      scheduledTimes: [
        { hour: 9, minute: 0 },
        { hour: 16, minute: 30 },
      ],
      scheduledChecksToday: 1,
      lastScheduledCheck: now - hours(4),
    },
    createdAt: now - days(4),
    updatedAt: now - days(1),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all jobs for a specific law firm
 */
export function getJobsForLawFirm(lawFirmId: string): Job[] {
  return mockJobs.filter((job) => job.lawFirmId === lawFirmId);
}

/**
 * Get a single job by ID
 */
export function getJobById(jobId: string): Job | undefined {
  return mockJobs.find((job) => job._id === jobId);
}

/**
 * Get jobs by status
 */
export function getJobsByStatus(
  status: Job['internalStatus'],
  lawFirmId?: string
): Job[] {
  return mockJobs.filter(
    (job) =>
      job.internalStatus === status &&
      (!lawFirmId || job.lawFirmId === lawFirmId)
  );
}

// ============================================
// MOCK JOB EVENTS (for timeline/chat view)
// ============================================

import type { JobEvent } from './types';

/**
 * Sample events for jobs - only user-facing events shown to law firms
 */
export const mockJobEvents: JobEvent[] = [
  // Job 001 - NEW (Maria Santos)
  {
    _id: 'evt_001_1',
    jobId: 'job_001',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - hours(2),
  },

  // Job 002 - CALL_IN_PROGRESS (Robert Chen)
  {
    _id: 'evt_002_1',
    jobId: 'job_002',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - hours(6),
  },
  {
    _id: 'evt_002_2',
    jobId: 'job_002',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - hours(1),
  },

  // Job 003 - AUTOMATION_RUNNING (Dora Cruz-Arteaga)
  {
    _id: 'evt_003_1',
    jobId: 'job_003',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(1),
  },
  {
    _id: 'evt_003_2',
    jobId: 'job_003',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - hours(12),
  },
  {
    _id: 'evt_003_3',
    jobId: 'job_003',
    eventType: 'status_change',
    message: "We're working on retrieving your report from CHP systems.",
    isUserFacing: true,
    timestamp: now - hours(0.5),
  },

  // Job 005 - FACE_PAGE_ONLY (Sarah Kim)
  {
    _id: 'evt_005_1',
    jobId: 'job_005',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(3),
  },
  {
    _id: 'evt_005_2',
    jobId: 'job_005',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - days(2),
  },
  {
    _id: 'evt_005_3',
    jobId: 'job_005',
    eventType: 'file_uploaded',
    message: "We've received a preliminary copy (face page). The full report will follow.",
    isUserFacing: true,
    timestamp: now - days(1),
  },

  // Job 007 - COMPLETED_FULL_REPORT (Jennifer Lopez)
  {
    _id: 'evt_007_1',
    jobId: 'job_007',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(6),
  },
  {
    _id: 'evt_007_2',
    jobId: 'job_007',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - days(5.5),
  },
  {
    _id: 'evt_007_3',
    jobId: 'job_007',
    eventType: 'completed',
    message: 'Your report is ready to download.',
    isUserFacing: true,
    timestamp: now - days(5),
  },

  // Job 010 - NEEDS_MORE_INFO (Andrew Miller)
  {
    _id: 'evt_010_1',
    jobId: 'job_010',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(2),
  },
  {
    _id: 'evt_010_2',
    jobId: 'job_010',
    eventType: 'status_change',
    message: 'We need a bit more information to locate your report. Our team will reach out if needed.',
    isUserFacing: true,
    timestamp: now - hours(8),
  },

  // Job 012 - NEEDS_IN_PERSON_PICKUP (Kevin Brown)
  {
    _id: 'evt_012_1',
    jobId: 'job_012',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(20),
  },
  {
    _id: 'evt_012_2',
    jobId: 'job_012',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - days(18),
  },
  {
    _id: 'evt_012_3',
    jobId: 'job_012',
    eventType: 'file_uploaded',
    message: "We've received a preliminary copy (face page). The full report will follow.",
    isUserFacing: true,
    timestamp: now - days(15),
  },
  {
    _id: 'evt_012_4',
    jobId: 'job_012',
    eventType: 'status_change',
    message: "We're working on obtaining the full report. This may take a bit longer.",
    isUserFacing: true,
    timestamp: now - days(7),
  },

  // Job 013 - CANCELLED (Amanda Taylor)
  {
    _id: 'evt_013_1',
    jobId: 'job_013',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(12),
  },
  {
    _id: 'evt_013_2',
    jobId: 'job_013',
    eventType: 'status_change',
    message: 'This request has been cancelled.',
    isUserFacing: true,
    timestamp: now - days(8),
  },

  // Job 005 - check_requested event (Sarah Kim - FACE_PAGE_ONLY)
  {
    _id: 'evt_005_4',
    jobId: 'job_005',
    eventType: 'check_requested',
    message: 'Checked if full report is available.',
    isUserFacing: false, // Staff-only event
    timestamp: now - hours(12),
  },

  // Job 016 - NEEDS_CALL (Patricia Gonzalez)
  {
    _id: 'evt_016_1',
    jobId: 'job_016',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - hours(4),
  },
  {
    _id: 'evt_016_2',
    jobId: 'job_016',
    eventType: 'status_change',
    message: "We're working on your request.",
    isUserFacing: true,
    timestamp: now - hours(3),
  },

  // Job 017 - READY_FOR_AUTOMATION (Thomas Anderson)
  {
    _id: 'evt_017_1',
    jobId: 'job_017',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - hours(8),
  },
  {
    _id: 'evt_017_2',
    jobId: 'job_017',
    eventType: 'status_change',
    message: "We're working on your request.",
    isUserFacing: true,
    timestamp: now - hours(2),
  },

  // Job 018 - WAITING_FOR_FULL_REPORT (Rebecca Martinez)
  {
    _id: 'evt_018_1',
    jobId: 'job_018',
    eventType: 'job_created',
    message: "We've received your request and will begin processing shortly.",
    isUserFacing: true,
    timestamp: now - days(4),
  },
  {
    _id: 'evt_018_2',
    jobId: 'job_018',
    eventType: 'status_change',
    message: "We're contacting CHP about your report.",
    isUserFacing: true,
    timestamp: now - days(3),
  },
  {
    _id: 'evt_018_3',
    jobId: 'job_018',
    eventType: 'file_uploaded',
    message:
      "We've received a preliminary copy (face page). The full report will follow.",
    isUserFacing: true,
    timestamp: now - days(2),
  },
  {
    _id: 'evt_018_4',
    jobId: 'job_018',
    eventType: 'status_change',
    message: "We're waiting for the full report to become available.",
    isUserFacing: true,
    timestamp: now - days(1),
  },
];

/**
 * Get all events for a job
 */
export function getJobEvents(jobId: string): JobEvent[] {
  return mockJobEvents
    .filter((event) => event.jobId === jobId)
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get only user-facing events for a job (law firm view)
 */
export function getUserFacingEvents(jobId: string): JobEvent[] {
  return mockJobEvents
    .filter((event) => event.jobId === jobId && event.isUserFacing)
    .sort((a, b) => a.timestamp - b.timestamp);
}
