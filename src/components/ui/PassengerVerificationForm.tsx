'use client';

/**
 * PassengerVerificationForm - Enhanced passenger verification form with repeatable names
 *
 * Collects passenger verification data including:
 * - Additional people involved (repeatable first/last name pairs)
 * - Vehicle information (plate, license, VIN)
 * All fields are optional - Continue is always enabled.
 *
 * @version V1.1.0
 */

import { useState } from 'react';
import { Users, User, Car, CreditCard, Plus, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PassengerVerificationData } from '@/lib/types';

interface PassengerVerificationFormProps {
  clientName: string;
  initialData?: Partial<PassengerVerificationData>;
  onSubmit: (data: PassengerVerificationData) => void;
  onSkip: () => void;
  onCollapse?: () => void;  // Soft-dismiss handler for "No thanks" behavior
  disabled?: boolean;
}

interface NamePair {
  id: string;
  firstName: string;
  lastName: string;
}

export default function PassengerVerificationForm({
  clientName,
  initialData,
  onSubmit,
  onSkip,
  onCollapse,
  disabled = false,
}: PassengerVerificationFormProps) {
  // Generate unique IDs for name rows
  const generateId = () => `name-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize names from initial data or empty array
  const [names, setNames] = useState<NamePair[]>(
    initialData?.additionalNames?.map((n) => ({
      id: generateId(),
      firstName: n.firstName,
      lastName: n.lastName,
    })) || []
  );

  // Vehicle info state
  const [vehicleInfo, setVehicleInfo] = useState({
    plate: initialData?.plate || '',
    driverLicense: initialData?.driverLicense || '',
    vin: initialData?.vin || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a new name row
  const addNameRow = () => {
    setNames([...names, { id: generateId(), firstName: '', lastName: '' }]);
  };

  // Remove a name row
  const removeNameRow = (id: string) => {
    setNames(names.filter((n) => n.id !== id));
  };

  // Update a name row
  const updateNameRow = (id: string, field: 'firstName' | 'lastName', value: string) => {
    setNames(
      names.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Filter out empty name rows and convert to required format
      const additionalNames = names
        .filter((n) => n.firstName.trim() || n.lastName.trim())
        .map((n) => ({ firstName: n.firstName.trim(), lastName: n.lastName.trim() }));

      await onSubmit({
        additionalNames,
        plate: vehicleInfo.plate.trim() || undefined,
        driverLicense: vehicleInfo.driverLicense.trim() || undefined,
        vin: vehicleInfo.vin.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card-dark rounded-xl p-5 border border-cyan-500/20 animate-text-reveal">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0">
          <Users className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Help us verify your report
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            As a passenger, any of the following helps match you to the report.
            <span className="text-slate-500 ml-1">All fields are optional.</span>
          </p>
        </div>
      </div>

      {/* Your Name (read-only display) */}
      <div className="bg-slate-800/30 rounded-lg px-4 py-3 mb-6 border border-slate-700/30">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Client&apos;s Name</span>
            <p className="text-slate-200 font-medium">{clientName}</p>
          </div>
        </div>
      </div>

      {/* Section: Other people involved */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Other people involved
          <span className="text-slate-500 font-normal">(optional)</span>
        </h4>

        {/* Name rows */}
        <div className="space-y-3 mb-3">
          {names.map((name, index) => (
            <div key={name.id} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={name.firstName}
                  onChange={(e) => updateNameRow(name.id, 'firstName', e.target.value)}
                  placeholder="First name"
                  disabled={disabled || isSubmitting}
                  className={cn(
                    'w-full h-12 md:h-10 px-3 rounded-lg',
                    'bg-slate-800/50 border border-slate-700/50',
                    'text-slate-200 text-base md:text-sm',
                    'placeholder:text-slate-600',
                    'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
                <input
                  type="text"
                  value={name.lastName}
                  onChange={(e) => updateNameRow(name.id, 'lastName', e.target.value)}
                  placeholder="Last name"
                  disabled={disabled || isSubmitting}
                  className={cn(
                    'w-full h-12 md:h-10 px-3 rounded-lg',
                    'bg-slate-800/50 border border-slate-700/50',
                    'text-slate-200 text-base md:text-sm',
                    'placeholder:text-slate-600',
                    'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
              </div>
              {/* Remove button */}
              <button
                onClick={() => removeNameRow(name.id)}
                disabled={disabled || isSubmitting}
                className={cn(
                  'flex items-center justify-center w-10 h-12 md:h-10 rounded-lg',
                  'bg-red-500/10 border border-red-500/20',
                  'text-red-400',
                  'hover:bg-red-500/20 hover:border-red-500/30',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label={`Remove person ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add another person button */}
        <button
          onClick={addNameRow}
          disabled={disabled || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'text-sm text-teal-400',
            'hover:bg-teal-500/10',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Add another person</span>
        </button>
      </div>

      {/* Section: Vehicle Information */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
          <Car className="w-4 h-4" />
          Vehicle Information
          <span className="text-slate-500 font-normal">(optional)</span>
        </h4>

        <div className="space-y-3">
          {/* License Plate */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              License Plate
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={vehicleInfo.plate}
                onChange={(e) => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
                placeholder="e.g., 8ABC123"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Driver License */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Driver License
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={vehicleInfo.driverLicense}
                onChange={(e) => setVehicleInfo({ ...vehicleInfo, driverLicense: e.target.value })}
                placeholder="e.g., D1234567"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* VIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              VIN
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={vehicleInfo.vin}
                onChange={(e) => setVehicleInfo({ ...vehicleInfo, vin: e.target.value })}
                placeholder="e.g., 1HGBH41JXMN109186"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Continue button - always enabled */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting}
        className={cn(
          'w-full h-12 md:h-10 rounded-xl font-medium text-base md:text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          'bg-gradient-to-r from-teal-600 to-cyan-600',
          'text-white',
          'hover:from-teal-500 hover:to-cyan-500',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'shadow-lg shadow-teal-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Skip link */}
      <button
        onClick={onCollapse || onSkip}
        disabled={disabled || isSubmitting}
        className={cn(
          'w-full mt-3 py-2',
          'text-sm text-slate-500',
          'hover:text-slate-300',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        I don&apos;t have any of this information
      </button>
    </div>
  );
}
