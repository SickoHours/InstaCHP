'use client';

/**
 * AuthorizationUploadCard - Law firm authorization document upload (V1.6.0)
 *
 * Friendly card prompting law firms to upload authorization document.
 * NO technical jargon - just "we need your help to complete the request"
 */

import { useState } from 'react';
import { FileText, Upload, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthorizationUploadCardProps {
  onUpload: (file: File) => Promise<void>;
  uploaded?: boolean;
  uploadedAt?: number;
  disabled?: boolean;
}

export default function AuthorizationUploadCard({
  onUpload,
  uploaded = false,
  uploadedAt,
  disabled = false,
}: AuthorizationUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Already uploaded state
  if (uploaded) {
    return (
      <div
        className={cn(
          'rounded-xl p-5',
          'bg-gradient-to-br from-emerald-900/20 to-green-900/20',
          'border border-emerald-500/30'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-emerald-200 font-medium">
              Authorization document received
            </h3>
            {uploadedAt && (
              <p className="text-sm text-emerald-400/70">
                Uploaded {getRelativeTime(uploadedAt)}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Thank you! We&apos;re working on completing your request.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl p-5',
        'bg-gradient-to-br from-amber-900/20 to-orange-900/20',
        'border border-amber-500/30'
      )}
    >
      {/* Header - Friendly messaging, no technical details */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 shrink-0">
          <HelpCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-amber-200 font-medium">
            We need your help
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            To complete your request, please upload your Authorization to Obtain Governmental Agency Records and Reports.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl p-6',
          'border-2 border-dashed transition-all duration-200',
          dragOver
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-slate-600/50 hover:border-slate-500/50',
          'cursor-pointer'
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {selectedFile ? (
            <>
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-200 font-medium">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-300">
                  Drop your PDF here or{' '}
                  <span className="text-amber-400">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Authorization to Obtain Governmental Agency Records and Reports
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={disabled || isUploading}
          className={cn(
            'w-full mt-4 flex items-center justify-center gap-2 p-4 rounded-xl',
            'bg-gradient-to-r from-amber-600 to-orange-600',
            'text-white font-medium',
            'transition-all duration-200',
            'hover:from-amber-500 hover:to-orange-500',
            'hover:shadow-lg hover:shadow-amber-500/25',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </>
          )}
        </button>
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500 text-center mt-4">
        This helps us obtain your report faster
      </p>
    </div>
  );
}
