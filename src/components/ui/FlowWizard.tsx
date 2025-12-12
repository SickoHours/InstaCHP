'use client';

/**
 * FlowWizard - Orchestrator for law firm request flow
 *
 * Manages the step-by-step wizard flow for collecting client type,
 * passenger verification data, and optional crash details.
 *
 * Flow:
 * - Driver: selection → speedup → [crash_details] → done
 * - Passenger: selection → verification → speedup → [crash_details] → done
 *
 * @version V1.1.0
 */

import { useState } from 'react';
import type { Job, FlowStep, PassengerVerificationData } from '@/lib/types';
import DriverPassengerChoice from './DriverPassengerChoice';
import SpeedUpPrompt from './SpeedUpPrompt';
import CrashDetailsForm, { type CrashDetailsData } from './CrashDetailsForm';
import PassengerVerificationForm from './PassengerVerificationForm';
import CollapsedHelperCTA from './CollapsedHelperCTA';

export interface FlowCompletionData {
  clientType: 'driver' | 'passenger';
  passengerVerification?: PassengerVerificationData;
  crashDetails?: CrashDetailsData;
  speedUpAccepted: boolean;
}

interface FlowWizardProps {
  job: Job;
  onStepChange: (step: FlowStep, data?: Record<string, unknown>) => void;
  onComplete: (data: FlowCompletionData) => void;
  onCollapse?: (variant: 'driver' | 'passenger') => void;  // Soft-dismiss handler
  onExpand?: (variant: 'driver' | 'passenger') => void;    // Re-expand collapsed CTA
  disabled?: boolean;
}

/**
 * Determine the current step based on job state
 */
function getCurrentStep(job: Job): FlowStep {
  // If flow is already completed
  if (job.interactiveState?.flowStep === 'done') {
    return 'done';
  }

  // If explicit step is set, use it
  if (job.interactiveState?.flowStep) {
    return job.interactiveState.flowStep;
  }

  // Otherwise, infer from job state (backward compatibility)
  if (!job.clientType) {
    return 'selection';
  }

  // If client type is set but we haven't asked about speed up
  if (!job.interactiveState?.speedUpOffered) {
    // Passengers need to go through verification first
    if (job.clientType === 'passenger' && !job.interactiveState?.passengerVerification) {
      return 'verification';
    }
    return 'speedup';
  }

  // If speed up was offered and accepted, show crash details
  if (job.interactiveState?.speedUpAccepted && !job.interactiveState?.crashDetailsProvided) {
    return 'crash_details';
  }

  return 'done';
}

export default function FlowWizard({
  job,
  onStepChange,
  onComplete,
  onCollapse,
  onExpand,
  disabled = false,
}: FlowWizardProps) {
  // Track collected data during the wizard
  const [collectedData, setCollectedData] = useState<Partial<FlowCompletionData>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine current step
  const currentStep = getCurrentStep(job);

  // If we're done, don't render anything
  if (currentStep === 'done') {
    return null;
  }

  // Handle driver/passenger selection
  const handleClientTypeSelect = async (choice: 'driver' | 'passenger') => {
    setIsTransitioning(true);
    setCollectedData({ ...collectedData, clientType: choice });

    // Notify parent of step change
    const nextStep: FlowStep = choice === 'passenger' ? 'verification' : 'speedup';
    onStepChange(nextStep, { clientType: choice });

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle passenger verification form submission
  const handleVerificationSubmit = async (data: PassengerVerificationData) => {
    setIsTransitioning(true);
    setCollectedData({ ...collectedData, passengerVerification: data });

    // Move to speed up prompt
    onStepChange('speedup', { passengerVerification: data });

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle passenger verification skip
  const handleVerificationSkip = () => {
    setIsTransitioning(true);
    setCollectedData({
      ...collectedData,
      passengerVerification: { additionalNames: [] },
    });

    // Move to speed up prompt with empty data
    onStepChange('speedup', { passengerVerification: { additionalNames: [] } });

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle speed up prompt choice
  const handleSpeedUpChoice = async (wantsToProvide: boolean) => {
    setIsTransitioning(true);
    setCollectedData({ ...collectedData, speedUpAccepted: wantsToProvide });

    if (wantsToProvide) {
      // Move to crash details form
      onStepChange('crash_details', { speedUpAccepted: true });
    } else {
      // Complete the flow
      const finalData: FlowCompletionData = {
        clientType: collectedData.clientType || (job.clientType as 'driver' | 'passenger'),
        passengerVerification: collectedData.passengerVerification,
        speedUpAccepted: false,
      };
      onComplete(finalData);
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle crash details form submission
  const handleCrashDetailsSubmit = async (data: CrashDetailsData) => {
    setIsTransitioning(true);

    // Complete the flow
    const finalData: FlowCompletionData = {
      clientType: collectedData.clientType || (job.clientType as 'driver' | 'passenger'),
      passengerVerification: collectedData.passengerVerification,
      crashDetails: data,
      speedUpAccepted: true,
    };
    onComplete(finalData);

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle crash details skip
  const handleCrashDetailsSkip = () => {
    setIsTransitioning(true);

    // Complete the flow without crash details
    const finalData: FlowCompletionData = {
      clientType: collectedData.clientType || (job.clientType as 'driver' | 'passenger'),
      passengerVerification: collectedData.passengerVerification,
      speedUpAccepted: true, // They said yes but skipped the form
    };
    onComplete(finalData);

    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div
      className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Step: Driver/Passenger Selection */}
      {currentStep === 'selection' && (
        <div className="glass-card-dark rounded-lg p-5 border border-cyan-500/30 animate-text-reveal">
          <h2 className="text-lg font-semibold text-white mb-2">First, let us know:</h2>
          <p className="text-sm text-slate-400 mb-4">
            Is this request for the driver or a passenger?
          </p>
          <DriverPassengerChoice
            onSelect={handleClientTypeSelect}
            disabled={disabled || isTransitioning}
          />
        </div>
      )}

      {/* Step: Passenger Verification */}
      {currentStep === 'verification' && (
        job.interactiveState?.passengerHelperCollapsed ? (
          <CollapsedHelperCTA
            variant="passenger"
            onExpand={() => onExpand?.('passenger')}
            disabled={disabled || isTransitioning}
          />
        ) : (
          <PassengerVerificationForm
            clientName={job.clientName}
            initialData={job.interactiveState?.passengerVerification}
            onSubmit={handleVerificationSubmit}
            onSkip={handleVerificationSkip}
            onCollapse={onCollapse ? () => onCollapse('passenger') : undefined}
            disabled={disabled || isTransitioning}
          />
        )
      )}

      {/* Step: Speed Up Prompt */}
      {currentStep === 'speedup' && (
        job.interactiveState?.driverHelperCollapsed ? (
          <CollapsedHelperCTA
            variant="driver"
            onExpand={() => onExpand?.('driver')}
            disabled={disabled || isTransitioning}
          />
        ) : (
          <SpeedUpPrompt
            onChoice={handleSpeedUpChoice}
            onCollapse={onCollapse ? () => onCollapse('driver') : undefined}
            disabled={disabled || isTransitioning}
          />
        )
      )}

      {/* Step: Crash Details Form */}
      {currentStep === 'crash_details' && (
        job.interactiveState?.driverHelperCollapsed ? (
          <CollapsedHelperCTA
            variant="driver"
            onExpand={() => onExpand?.('driver')}
            disabled={disabled || isTransitioning}
          />
        ) : (
          <CrashDetailsForm
            initialData={{
              crashDate: job.crashDate || '',
              crashTime: job.crashTime || '',
              officerId: job.officerId || '',
            }}
            onSubmit={handleCrashDetailsSubmit}
            onSkip={handleCrashDetailsSkip}
            onCollapse={onCollapse ? () => onCollapse('driver') : undefined}
            disabled={disabled || isTransitioning}
          />
        )
      )}
    </div>
  );
}
