'use client';

import { useState } from 'react';
import { Upload, User, FileCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { isFatalJob } from '@/lib/jobUIHelpers';

interface ManualCompletionSheetProps {
  /** The job being completed */
  job: Job;
  /** Callback when upload is complete */
  onUploadComplete: (type: 'face' | 'full', name?: string) => void;
  /** Callback when job is marked complete */
  onMarkComplete: (notes: string) => void;
  /** Callback to close the sheet */
  onClose: () => void;
}

/**
 * ManualCompletionSheet - BottomSheet content for manual report upload
 *
 * Streamlined version of the manual completion card for use in bottom sheets.
 * Handles:
 * - File type selection (face page vs full report)
 * - Name input for face page uploads (unlocks auto-checker)
 * - File upload simulation
 * - Completion notes
 */
export default function ManualCompletionSheet({
  job,
  onUploadComplete,
  onMarkComplete,
  onClose,
}: ManualCompletionSheetProps) {
  const [uploadType, setUploadType] = useState<'face' | 'full'>('face');
  const [guaranteedName, setGuaranteedName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const isFatal = isFatalJob(job);

  // Simulate file upload
  const handleUpload = async () => {
    setIsUploading(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const filename = uploadType === 'face'
      ? `face_page_${job._id.slice(-4)}.pdf`
      : `full_report_${job._id.slice(-4)}.pdf`;

    setUploadedFile(filename);
    setIsUploading(false);

    // Notify parent
    onUploadComplete(uploadType, uploadType === 'face' ? guaranteedName : undefined);
  };

  // Handle mark complete
  const handleMarkComplete = () => {
    onMarkComplete(completionNotes);
    onClose();
  };

  const canUpload = uploadType === 'full' || (uploadType === 'face' && guaranteedName.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* File Type Selection */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
          File Type
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="uploadType"
              checked={uploadType === 'face'}
              onChange={() => setUploadType('face')}
              className="w-5 h-5 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
            />
            <span className="text-sm text-slate-300">Face Page</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="uploadType"
              checked={uploadType === 'full'}
              onChange={() => setUploadType('full')}
              className="w-5 h-5 text-amber-400 bg-slate-800 border-slate-600 focus:ring-amber-400/20"
            />
            <span className="text-sm text-slate-300">Full Report</span>
          </label>
        </div>
      </div>

      {/* Conditional: Name input for face page */}
      {uploadType === 'face' && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <User className="w-3 h-3" />
            First Name *
          </label>
          <input
            type="text"
            value={guaranteedName}
            onChange={(e) => setGuaranteedName(e.target.value)}
            placeholder="Enter driver's first name"
            className={cn(
              'w-full h-12 rounded-lg border bg-slate-800/50 text-slate-200',
              'text-base px-4',
              'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
              'placeholder:text-slate-500',
              'transition-all duration-200'
            )}
          />
          {!isFatal && (
            <p className="text-xs text-slate-500">
              Required to unlock auto-checker for full report
            </p>
          )}
        </div>
      )}

      {/* Conditional: Info box for full report */}
      {uploadType === 'full' && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400">
            Job will auto-complete when full report is uploaded.
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={isUploading || !canUpload || !!uploadedFile}
        className={cn(
          'w-full h-12 rounded-xl font-medium',
          'transition-all duration-200',
          'flex items-center justify-center gap-2',
          !isUploading && canUpload && !uploadedFile
            ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-[0.98]'
            : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : uploadedFile ? (
          <>
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">Uploaded</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Select & Upload File</span>
          </>
        )}
      </button>

      {/* Uploaded File Badge */}
      {uploadedFile && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-sm text-emerald-400 truncate">{uploadedFile}</span>
        </div>
      )}

      {/* Completion Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Completion Notes (Optional)
        </label>
        <textarea
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          placeholder="Add any notes about this pickup..."
          className={cn(
            'w-full h-20 rounded-lg border bg-slate-800/50 text-slate-200',
            'text-base p-3',
            'border-slate-700/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
            'placeholder:text-slate-500',
            'resize-none'
          )}
        />
      </div>

      {/* Mark Complete Button (only for full report uploads) */}
      {uploadType === 'full' && uploadedFile && (
        <button
          onClick={handleMarkComplete}
          className={cn(
            'w-full h-12 rounded-xl font-medium',
            'bg-gradient-to-r from-emerald-600 to-amber-500 text-white',
            'hover:from-emerald-500 hover:to-amber-400',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
            'active:scale-[0.98]',
            'shadow-lg shadow-emerald-500/20'
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark as Completed</span>
        </button>
      )}

      {/* Close / Done button for face page (after upload) */}
      {uploadType === 'face' && uploadedFile && (
        <button
          onClick={onClose}
          className={cn(
            'w-full h-12 rounded-xl font-medium',
            'bg-gradient-to-r from-amber-500 to-cyan-600 text-white',
            'hover:from-amber-400 hover:to-cyan-500',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
            'active:scale-[0.98]',
            'shadow-lg shadow-amber-400/20'
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Done - Check for Full Report</span>
        </button>
      )}
    </div>
  );
}
