'use client';

/**
 * @deprecated Replaced by InlineFieldsCard as of V1.0.7
 * Kept for reference only. Do not use in new code.
 *
 * Page2DataCard - Editable driver info card for law firm view
 *
 * Displays firstName, lastName, plate, driverLicense, VIN with edit functionality.
 * Used in law firm job detail to collect/display Page 2 data.
 * Auto-triggers wrapper on save if prerequisites met.
 */

import { useState } from 'react';
import { User, Car, CreditCard, Edit, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page2Data {
  firstName: string;
  lastName: string;
  plate: string;
  driverLicense: string;
  vin: string;
}

interface Page2DataCardProps {
  firstName: string;
  lastName: string;
  plate: string;
  driverLicense: string;
  vin: string;
  onSave: (data: Page2Data) => void | Promise<void>;
  disabled?: boolean;
}

export default function Page2DataCard({
  firstName: initialFirstName,
  lastName: initialLastName,
  plate: initialPlate,
  driverLicense: initialDriverLicense,
  vin: initialVin,
  onSave,
  disabled = false,
}: Page2DataCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Page2Data>({
    firstName: initialFirstName,
    lastName: initialLastName,
    plate: initialPlate,
    driverLicense: initialDriverLicense,
    vin: initialVin,
  });

  const hasData = !!(
    initialFirstName ||
    initialLastName ||
    initialPlate ||
    initialDriverLicense ||
    initialVin
  );

  const handleEdit = () => {
    setFormData({
      firstName: initialFirstName,
      lastName: initialLastName,
      plate: initialPlate,
      driverLicense: initialDriverLicense,
      vin: initialVin,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: initialFirstName,
      lastName: initialLastName,
      plate: initialPlate,
      driverLicense: initialDriverLicense,
      vin: initialVin,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="glass-card-dark rounded-lg p-4 border border-cyan-500/20 animate-text-reveal">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-cyan-300">Driver Information (Page 2)</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md',
              'text-xs font-medium',
              hasData
                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-teal-600/20 text-teal-300 hover:bg-teal-600/30',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Edit className="w-3 h-3" />
            <span>{hasData ? 'Edit' : 'Add Details'}</span>
          </button>
        )}
      </div>

      {/* Display Mode */}
      {!isEditing && hasData && (
        <div className="space-y-2">
          {(initialFirstName || initialLastName) && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Name:</span>
              <span className="text-slate-200">
                {[initialFirstName, initialLastName].filter(Boolean).join(' ')}
              </span>
            </div>
          )}
          {initialPlate && (
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">License Plate:</span>
              <span className="text-slate-200 font-mono">{initialPlate}</span>
            </div>
          )}
          {initialDriverLicense && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Driver License:</span>
              <span className="text-slate-200 font-mono">{initialDriverLicense}</span>
            </div>
          )}
          {initialVin && (
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">VIN:</span>
              <span className="text-slate-200 font-mono text-xs">{initialVin}</span>
            </div>
          )}
        </div>
      )}

      {/* Display Mode - Empty State */}
      {!isEditing && !hasData && (
        <p className="text-xs text-slate-500">
          No driver information yet. Click &quot;Add Details&quot; to provide information.
        </p>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-3">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g., John"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g., Doe"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* License Plate */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              License Plate
            </label>
            <input
              type="text"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              placeholder="e.g., 8ABC123"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Driver License */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Driver License
            </label>
            <input
              type="text"
              value={formData.driverLicense}
              onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
              placeholder="e.g., D1234567"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* VIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              VIN
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              placeholder="e.g., 1HGBH41JXMN109186"
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-200 text-sm',
                'placeholder:text-slate-600',
                'focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={disabled}
              className={cn(
                'flex-1 h-9 rounded-lg font-medium text-sm',
                'bg-teal-600 text-white hover:bg-teal-500',
                'flex items-center justify-center gap-1.5',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={disabled}
              className={cn(
                'flex-1 h-9 rounded-lg font-medium text-sm',
                'bg-slate-700 text-slate-300 hover:bg-slate-600',
                'flex items-center justify-center gap-1.5',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
