'use client';

/**
 * DriverInfoRescueForm - Rescue form for Page 2 verification failures
 *
 * Shown when the CHP wrapper passes Page 1 but fails Page 2 verification.
 * Collects additional identifiers (plate, DL, VIN) and names to retry verification.
 * Uses the same repeatable names pattern as PassengerVerificationForm.
 *
 * @version V2.7.0 - Added Page 1 warning context
 */

import { useState } from 'react';
import { AlertCircle, Users, Car, CreditCard, Plus, Trash2, Search, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RescueFormData } from '@/lib/types';

interface DriverInfoRescueFormProps {
  initialData?: Partial<RescueFormData>;
  onSubmit: (data: RescueFormData) => void | Promise<void>;
  disabled?: boolean;
  /** Page 1 failure count for warning context (V2.7.0+) */
  page1FailureCount?: number;
}

interface NamePair {
  id: string;
  firstName: string;
  lastName: string;
}

export default function DriverInfoRescueForm({
  initialData,
  onSubmit,
  disabled = false,
  page1FailureCount = 0,
}: DriverInfoRescueFormProps) {
  // Generate unique IDs for name rows
  const generateId = () => `name-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize names from initial data or empty array (starts empty per requirements)
  const [names, setNames] = useState<NamePair[]>(
    initialData?.additionalNames?.map((n) => ({
      id: generateId(),
      firstName: n.firstName,
      lastName: n.lastName,
    })) || []
  );

  // Vehicle/ID info state
  const [formData, setFormData] = useState({
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

  // Check if we have any data to submit
  const hasAnyData = !!(
    formData.plate ||
    formData.driverLicense ||
    formData.vin ||
    names.some((n) => n.firstName.trim() || n.lastName.trim())
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Filter out empty name rows and convert to required format
      const additionalNames = names
        .filter((n) => n.firstName.trim() || n.lastName.trim())
        .map((n) => ({ firstName: n.firstName.trim(), lastName: n.lastName.trim() }));

      await onSubmit({
        additionalNames,
        plate: formData.plate.trim() || undefined,
        driverLicense: formData.driverLicense.trim() || undefined,
        vin: formData.vin.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card-dark rounded-xl p-5 border border-amber-500/30 animate-text-reveal">
      {/* Header - Rescue explanation */}
      <div className="flex items-start gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            We need a bit more info
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We found your report, but need additional identifiers to verify and retrieve it.
            <span className="text-slate-500 ml-1">Any of these will help.</span>
          </p>
        </div>
      </div>

      {/* Page 1 Attempt Warning (V2.7.0+) */}
      {page1FailureCount > 0 && (
        <div className="mb-5 rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-300 font-medium">Page 2 retries are safe</p>
              <p className="text-xs text-slate-500 mt-0.5">
                If you need to change Page 1 details (date/time/officer), be aware CHP limits those attempts.
                {page1FailureCount >= 2 && ' Page 1 is now locked.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section: Vehicle/ID Information */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <Car className="w-4 h-4" />
          Vehicle & ID Information
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
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                placeholder="e.g., 8ABC123"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Driver License */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Driver&apos;s License Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.driverLicense}
                onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                placeholder="e.g., D1234567"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* VIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              VIN Number
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                placeholder="e.g., 1HGBH41JXMN109186"
                disabled={disabled || isSubmitting}
                className={cn(
                  'w-full h-12 md:h-10 pl-10 pr-4 rounded-lg',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-slate-200 text-base md:text-sm',
                  'placeholder:text-slate-600',
                  'focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Additional Names */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Additional Names
          <span className="text-slate-500 font-normal">(optional)</span>
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Add names of other people involved in the crash if helpful.
        </p>

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
                    'focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
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
                    'focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
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
            'text-sm text-amber-400',
            'hover:bg-amber-500/10',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Add another name</span>
        </button>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || !hasAnyData}
        className={cn(
          'w-full h-12 md:h-10 rounded-xl font-medium text-base md:text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          hasAnyData && !disabled && !isSubmitting
            ? [
                'bg-gradient-to-r from-amber-600 to-orange-600',
                'text-white',
                'hover:from-amber-500 hover:to-orange-500',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'shadow-lg shadow-amber-500/20',
              ]
            : ['bg-slate-800/50 text-slate-600', 'cursor-not-allowed']
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Checking CHP...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>Save & Check Again</span>
          </>
        )}
      </button>

      {/* Helper text */}
      {!hasAnyData && !disabled && (
        <p className="text-xs text-slate-500 text-center mt-3">
          Enter at least one identifier above to retry
        </p>
      )}
    </div>
  );
}
