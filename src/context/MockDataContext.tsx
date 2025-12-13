'use client';

/**
 * MockDataContext - V1 Frontend-Only State Management
 *
 * React Context providing global access to MockDataManager.
 * All data stays in browser memory - resets on page refresh.
 * Zero backend implications.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Job, JobEvent, NewJobFormData, EventType } from '@/lib/types';
import { mockDataManager } from '@/lib/mockDataManager';

interface MockDataContextValue {
  // Job operations
  createJob: (formData: NewJobFormData) => Job;
  getJobById: (jobId: string) => Job | undefined;
  getJobsForLawFirm: (lawFirmId: string) => Job[];
  getAllJobs: () => Job[];
  updateJob: (jobId: string, updates: Partial<Job>) => Job;

  // Event operations
  addEvent: (
    jobId: string,
    eventData: Partial<JobEvent> & {
      eventType: EventType;
      message: string;
      isUserFacing: boolean;
    }
  ) => JobEvent;
  getJobEvents: (jobId: string) => JobEvent[];
  getUserFacingEvents: (jobId: string) => JobEvent[];
  completeInteraction: (eventId: string) => void;
  getEventById: (eventId: string) => JobEvent | undefined;

  // Utility
  refreshData: () => void;
}

const MockDataContext = createContext<MockDataContextValue | undefined>(undefined);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  // Force re-render when data changes
  const [, setUpdateTrigger] = useState(0);

  // Trigger refresh to force components to re-render
  const refreshData = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Wrapped methods that trigger refresh after mutations
  const createJob = useCallback((formData: NewJobFormData) => {
    const job = mockDataManager.createJob(formData);
    refreshData();
    return job;
  }, [refreshData]);

  const updateJob = useCallback((jobId: string, updates: Partial<Job>) => {
    const job = mockDataManager.updateJob(jobId, updates);
    refreshData();
    return job;
  }, [refreshData]);

  const addEvent = useCallback((
    jobId: string,
    eventData: Partial<JobEvent> & {
      eventType: EventType;
      message: string;
      isUserFacing: boolean;
    }
  ) => {
    const event = mockDataManager.addEvent(jobId, eventData);
    refreshData();
    return event;
  }, [refreshData]);

  const completeInteraction = useCallback((eventId: string) => {
    mockDataManager.completeInteraction(eventId);
    refreshData();
  }, [refreshData]);

  // Read-only methods (no refresh needed)
  const getJobById = useCallback((jobId: string) => {
    return mockDataManager.getJobById(jobId);
  }, []);

  const getJobsForLawFirm = useCallback((lawFirmId: string) => {
    return mockDataManager.getJobsForLawFirm(lawFirmId);
  }, []);

  const getAllJobs = useCallback(() => {
    return mockDataManager.getAllJobs();
  }, []);

  const getJobEvents = useCallback((jobId: string) => {
    return mockDataManager.getJobEvents(jobId);
  }, []);

  const getUserFacingEvents = useCallback((jobId: string) => {
    return mockDataManager.getUserFacingEvents(jobId);
  }, []);

  const getEventById = useCallback((eventId: string) => {
    return mockDataManager.getEventById(eventId);
  }, []);

  const value: MockDataContextValue = {
    createJob,
    getJobById,
    getJobsForLawFirm,
    getAllJobs,
    updateJob,
    addEvent,
    getJobEvents,
    getUserFacingEvents,
    completeInteraction,
    getEventById,
    refreshData,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

/**
 * Hook to access mock data operations
 * Throws error if used outside MockDataProvider
 */
export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
