import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with conditional logic
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// REPORT NUMBER & NCIC UTILITIES
// ============================================

/**
 * Derive NCIC code from report number
 * NCIC is always the first 4 characters of the report number
 * @example deriveNcic('9465-2025-02802') => '9465'
 */
export function deriveNcic(reportNumber: string): string {
  return reportNumber.slice(0, 4);
}

/**
 * Validate report number format: 9XXX-YYYY-ZZZZZ
 */
export function isValidReportNumber(value: string): boolean {
  return /^9\d{3}-\d{4}-\d{5}$/.test(value);
}

// ============================================
// NAME UTILITIES
// ============================================

/**
 * Split a full client name into first and last name
 * Handles hyphenated and multi-word last names correctly
 * @example splitClientName('Dora Cruz-Arteaga') => { firstName: 'Dora', lastName: 'Cruz-Arteaga' }
 * @example splitClientName('Mary Jane Smith') => { firstName: 'Mary Jane', lastName: 'Smith' }
 */
export function splitClientName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Convert HTML date input format to API format
 * @example convertDateForApi('2025-12-01') => '12/01/2025'
 */
export function convertDateForApi(htmlDate: string): string {
  if (!htmlDate) return '';
  const [year, month, day] = htmlDate.split('-');
  return `${month}/${day}/${year}`;
}

/**
 * Convert API date format to HTML input format
 * @example convertDateForInput('12/01/2025') => '2025-12-01'
 */
export function convertDateForInput(apiDate: string): string {
  if (!apiDate) return '';
  const [month, day, year] = apiDate.split('/');
  return `${year}-${month}-${day}`;
}

// ============================================
// TIME UTILITIES
// ============================================

/**
 * Validate crash time format: HHMM (4 digits, 24-hour)
 */
export function isValidCrashTime(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false;
  const hours = parseInt(value.slice(0, 2), 10);
  const minutes = parseInt(value.slice(2, 4), 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Format crash time for display
 * @example formatCrashTime('1430') => '2:30 PM'
 * @example formatCrashTime('0845') => '8:45 AM'
 */
export function formatCrashTime(time: string): string {
  if (!time || time.length !== 4) return '';
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = time.slice(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

/**
 * Format HHMM time to display format HH:MM (24-hour)
 * @example formatHHMMTime('1430') => '14:30'
 * @example formatHHMMTime('0845') => '08:45'
 */
export function formatHHMMTime(time: string): string {
  if (!time || time.length !== 4) return time;
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

/**
 * Format timestamp as relative time
 * @example formatRelativeTime(Date.now() - 3600000) => '1 hour ago'
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;

  // For older dates, show actual date
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================
// ID UTILITIES
// ============================================

/**
 * Generate a random ID for mock data
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
