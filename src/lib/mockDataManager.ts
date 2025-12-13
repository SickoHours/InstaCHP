/**
 * MockDataManager - V1 Frontend-Only Data Management
 *
 * In-memory singleton managing jobs and events for InstaTCR V1.
 * All data stays in browser memory - resets on page refresh.
 * Zero backend implications.
 */

import type { Job, JobEvent, NewJobFormData, EventType } from './types';
import { mockJobs, mockJobEvents, DEFAULT_LAW_FIRM_ID, DEFAULT_LAW_FIRM_NAME } from './mockData';
import { deriveNcic, generateId } from './utils';

class MockDataManager {
  private jobs: Job[];
  private events: JobEvent[];

  constructor() {
    // Initialize with existing mock data
    this.jobs = [...mockJobs];
    this.events = [...mockJobEvents];
  }

  /**
   * Generate unique job ID
   * Uses timestamp to avoid collisions when creating multiple jobs rapidly
   */
  generateJobId(): string {
    const existingJobs = this.jobs.map(j => j._id);
    const maxJobNumber = Math.max(
      ...existingJobs.map(id => {
        const match = id.match(/job_(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
    );
    const nextNumber = maxJobNumber + 1;
    return `job_${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Create new job from form submission
   * Automatically adds initial events:
   * 1. job_created - "We've received your request..."
   * 2. driver_passenger_prompt - Interactive prompt (unless fatal)
   *
   * V1.6.0: Fatal reports skip wrapper and auto-escalate
   */
  createJob(formData: NewJobFormData): Job {
    const isFatal = formData.isFatal ?? false;

    const newJob: Job = {
      _id: this.generateJobId(),
      lawFirmId: DEFAULT_LAW_FIRM_ID,
      lawFirmName: DEFAULT_LAW_FIRM_NAME,
      clientName: formData.clientName,
      clientType: null, // Will be set via interactive prompt (unless fatal)
      reportNumber: formData.reportNumber,
      crashDate: '', // Will be collected later
      ncic: deriveNcic(formData.reportNumber),
      internalStatus: formData.internalStatus ?? 'NEEDS_CALL',
      wrapperRuns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      interactiveState: {
        driverPassengerAsked: isFatal, // Skip prompts for fatal
        chpNudgeDismissed: isFatal,
      },
      // V1.6.0: Fatal report fields
      isFatal,
      fatalDetails: formData.fatalDetails,
      escalationData: formData.escalationData,
    };

    // Add to jobs array
    this.jobs.push(newJob);

    // Create initial events based on job type
    if (isFatal) {
      // Fatal report events
      this.addEvent(newJob._id, {
        eventType: 'fatal_report_created',
        message: "We've received your fatal report request. Our team will handle this with priority.",
        isUserFacing: true,
      });

      this.addEvent(newJob._id, {
        eventType: 'escalation_fatal_triggered',
        message: 'Fatal report - auto-escalated for manual pickup.',
        isUserFacing: false, // Staff only
      });

      // If client was deceased and death cert uploaded
      if (formData.fatalDetails?.clientWasDeceased && formData.fatalDetails?.deathCertificateToken) {
        this.addEvent(newJob._id, {
          eventType: 'death_certificate_uploaded',
          message: 'Death certificate uploaded.',
          isUserFacing: false, // Staff only
        });
      }

      // Auth already uploaded with fatal report
      if (formData.escalationData?.authorizationDocumentToken) {
        this.addEvent(newJob._id, {
          eventType: 'authorization_uploaded',
          message: 'Authorization document received.',
          isUserFacing: true,
        });
      }
    } else {
      // Standard job events
      this.addEvent(newJob._id, {
        eventType: 'job_created',
        message: "We've received your request and will begin processing shortly.",
        isUserFacing: true,
      });

      this.addEvent(newJob._id, {
        eventType: 'driver_passenger_prompt',
        message: 'Is this for a driver or passenger?',
        isUserFacing: true,
        metadata: {
          isInteractive: true,
          interactionComplete: false,
        },
      });
    }

    return newJob;
  }

  /**
   * Get job by ID
   */
  getJobById(jobId: string): Job | undefined {
    return this.jobs.find(j => j._id === jobId);
  }

  /**
   * Get all jobs for a law firm
   */
  getJobsForLawFirm(lawFirmId: string): Job[] {
    return this.jobs.filter(j => j.lawFirmId === lawFirmId);
  }

  /**
   * Get all jobs (for staff view)
   */
  getAllJobs(): Job[] {
    return this.jobs;
  }

  /**
   * Update job with partial data
   */
  updateJob(jobId: string, updates: Partial<Job>): Job {
    const jobIndex = this.jobs.findIndex(j => j._id === jobId);
    if (jobIndex === -1) {
      throw new Error(`Job not found: ${jobId}`);
    }

    this.jobs[jobIndex] = {
      ...this.jobs[jobIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    return this.jobs[jobIndex];
  }

  /**
   * Add event to timeline
   */
  addEvent(
    jobId: string,
    eventData: Partial<JobEvent> & {
      eventType: EventType;
      message: string;
      isUserFacing: boolean;
    }
  ): JobEvent {
    const event: JobEvent = {
      _id: `evt_${generateId()}`,
      jobId,
      timestamp: Date.now(),
      ...eventData,
    };

    this.events.push(event);
    return event;
  }

  /**
   * Get all events for a job
   */
  getJobEvents(jobId: string): JobEvent[] {
    return this.events
      .filter(e => e.jobId === jobId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get user-facing events for a job (law firm view)
   */
  getUserFacingEvents(jobId: string): JobEvent[] {
    return this.events
      .filter(e => e.jobId === jobId && e.isUserFacing)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Mark an interactive event as complete
   */
  completeInteraction(eventId: string): void {
    const event = this.events.find(e => e._id === eventId);
    if (event && event.metadata) {
      event.metadata.interactionComplete = true;
    }
  }

  /**
   * Get event by ID
   */
  getEventById(eventId: string): JobEvent | undefined {
    return this.events.find(e => e._id === eventId);
  }

  /**
   * Reset all data (useful for testing)
   */
  reset(): void {
    this.jobs = [...mockJobs];
    this.events = [...mockJobEvents];
  }
}

// Export singleton instance
export const mockDataManager = new MockDataManager();
