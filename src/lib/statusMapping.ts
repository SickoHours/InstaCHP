/**
 * Status mapping configuration for InstaTCR
 * Converts internal statuses (staff view) to public statuses (law firm view)
 *
 * CRITICAL: Law firms NEVER see internal statuses or technical details
 */

import type {
  InternalStatus,
  PublicStatus,
  StatusConfig,
  StatusColor,
} from './types';

// ============================================
// INTERNAL -> PUBLIC STATUS MAPPING
// ============================================

/**
 * Complete mapping of internal statuses to public-facing configuration
 * Each entry contains: public status, color, and law firm message
 */
export const STATUS_MAP: Record<InternalStatus, StatusConfig> = {
  NEW: {
    publicStatus: 'SUBMITTED',
    color: 'gray',
    message: "We've received your request and will begin processing shortly.",
  },
  NEEDS_CALL: {
    publicStatus: 'IN_PROGRESS',
    color: 'blue',
    message: "We're working on your request.",
  },
  CALL_IN_PROGRESS: {
    publicStatus: 'CONTACTING_CHP',
    color: 'blue',
    message: "We're contacting CHP about your report.",
  },
  READY_FOR_AUTOMATION: {
    publicStatus: 'IN_PROGRESS',
    color: 'blue',
    message: "We're working on your request.",
  },
  AUTOMATION_RUNNING: {
    publicStatus: 'CONTACTING_CHP',
    color: 'blue',
    message: "We're contacting CHP about your report.",
  },
  FACE_PAGE_ONLY: {
    publicStatus: 'FACE_PAGE_READY',
    color: 'yellow',
    message:
      "We've received a preliminary copy (face page). The full report will follow.",
  },
  WAITING_FOR_FULL_REPORT: {
    publicStatus: 'WAITING_FOR_REPORT',
    color: 'yellow',
    message: "We're waiting for the full report to become available.",
  },
  COMPLETED_FULL_REPORT: {
    publicStatus: 'REPORT_READY',
    color: 'green',
    message: 'Your report is ready to download.',
  },
  COMPLETED_MANUAL: {
    publicStatus: 'REPORT_READY',
    color: 'green',
    message: 'Your report is ready to download.',
  },
  NEEDS_MORE_INFO: {
    publicStatus: 'NEEDS_INFO',
    color: 'amber',
    message: 'We need a bit more information to locate your report.',
  },
  NEEDS_IN_PERSON_PICKUP: {
    publicStatus: 'IN_PROGRESS',
    color: 'blue',
    message: "We're working on your request.",
  },
  AUTOMATION_ERROR: {
    publicStatus: 'IN_PROGRESS',
    color: 'blue',
    message: "We're working on your request.",
  },
  CANCELLED: {
    publicStatus: 'CANCELLED',
    color: 'red',
    message: 'This request has been cancelled.',
  },
};

// ============================================
// STATUS COLOR CLASSES
// ============================================

/**
 * Tailwind CSS classes for each status color
 * Used by StatusBadge and card border styling
 */
export const STATUS_COLORS: Record<
  StatusColor,
  { bg: string; text: string; border: string; borderLeft: string }
> = {
  gray: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    borderLeft: 'border-l-slate-400',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    borderLeft: 'border-l-blue-500',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-400',
    borderLeft: 'border-l-yellow-500',
  },
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-400',
    borderLeft: 'border-l-emerald-500',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-400',
    borderLeft: 'border-l-amber-500',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    borderLeft: 'border-l-red-500',
  },
};

/**
 * Dark mode Tailwind CSS classes for each status color
 * Features translucent backgrounds with glow effects
 */
export const DARK_STATUS_COLORS: Record<
  StatusColor,
  { bg: string; text: string; border: string; borderLeft: string; glow: string }
> = {
  gray: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-200', // Improved contrast (was 300)
    border: 'border-slate-500/30',
    borderLeft: 'border-l-slate-400',
    glow: 'shadow-slate-500/20',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-200', // Improved contrast (was 300)
    border: 'border-blue-500/30',
    borderLeft: 'border-l-blue-500',
    glow: 'shadow-blue-500/30',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-200', // Improved contrast (was 300)
    border: 'border-yellow-500/30',
    borderLeft: 'border-l-yellow-500',
    glow: 'shadow-yellow-500/30',
  },
  green: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-200', // Improved contrast (was 300)
    border: 'border-emerald-500/30',
    borderLeft: 'border-l-emerald-500',
    glow: 'shadow-emerald-500/30',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-200', // Improved contrast (was 300)
    border: 'border-amber-500/30',
    borderLeft: 'border-l-amber-500',
    glow: 'shadow-amber-500/30',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-200', // Improved contrast (was 300)
    border: 'border-red-500/30',
    borderLeft: 'border-l-red-500',
    glow: 'shadow-red-500/30',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert internal status to public-facing status
 */
export function getPublicStatus(internalStatus: InternalStatus): PublicStatus {
  return STATUS_MAP[internalStatus].publicStatus;
}

/**
 * Get the color for an internal status
 */
export function getStatusColor(internalStatus: InternalStatus): StatusColor {
  return STATUS_MAP[internalStatus].color;
}

/**
 * Get the law firm-facing message for an internal status
 */
export function getStatusMessage(internalStatus: InternalStatus): string {
  return STATUS_MAP[internalStatus].message;
}

/**
 * Get Tailwind classes for a status color
 */
export function getStatusColorClasses(color: StatusColor) {
  return STATUS_COLORS[color];
}

/**
 * Get dark mode Tailwind classes for a status color
 */
export function getDarkStatusColorClasses(color: StatusColor) {
  return DARK_STATUS_COLORS[color];
}

/**
 * Format public status for display
 * Converts SNAKE_CASE to Title Case
 * @example formatPublicStatus('REPORT_READY') => 'Report Ready'
 */
export function formatPublicStatus(status: PublicStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a status indicates the job is complete
 */
export function isCompletedStatus(internalStatus: InternalStatus): boolean {
  return ['COMPLETED_FULL_REPORT', 'COMPLETED_MANUAL'].includes(internalStatus);
}

/**
 * Check if a status requires user attention
 */
export function needsAttention(internalStatus: InternalStatus): boolean {
  return internalStatus === 'NEEDS_MORE_INFO';
}

/**
 * Check if a status indicates active processing
 */
export function isActiveStatus(internalStatus: InternalStatus): boolean {
  return ![
    'COMPLETED_FULL_REPORT',
    'COMPLETED_MANUAL',
    'CANCELLED',
    'NEEDS_MORE_INFO',
  ].includes(internalStatus);
}
