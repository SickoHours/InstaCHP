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
 * Extracts first 4 digits (digits-only), must start with 9
 * @example deriveNcic('9465-2025-02802') => '9465'
 * @example deriveNcic('9XXX-2025-02802') => '9' (only valid digits)
 */
export function deriveNcic(reportNumber: string): string {
  // Extract only digits from the report number
  const digitsOnly = reportNumber.replace(/\D/g, '');
  // Take first 4 digits
  return digitsOnly.slice(0, 4);
}

/**
 * Validate NCIC format: 4 digits starting with 9
 */
export function isValidNcic(ncic: string): boolean {
  return /^9\d{3}$/.test(ncic);
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
 * Normalize crash time to HHMM format
 * Accepts HH:MM or HHMM input
 * @example normalizeCrashTime('14:30') => '1430'
 * @example normalizeCrashTime('1430') => '1430'
 * @example normalizeCrashTime('8:45') => '0845'
 */
export function normalizeCrashTime(value: string): string {
  if (!value) return '';
  // Remove any colons and normalize
  const cleaned = value.replace(/:/g, '');
  // Pad to 4 digits if needed (e.g., '845' => '0845')
  return cleaned.padStart(4, '0');
}

/**
 * Validate crash time format: HHMM (4 digits, 24-hour) or HH:MM
 */
export function isValidCrashTime(value: string): boolean {
  // Normalize first (accept HH:MM or HHMM)
  const normalized = normalizeCrashTime(value);
  if (!/^\d{4}$/.test(normalized)) return false;
  const hours = parseInt(normalized.slice(0, 2), 10);
  const minutes = parseInt(normalized.slice(2, 4), 10);
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
// OFFICER ID UTILITIES
// ============================================

/**
 * Regular expression for officer ID validation
 * Format: 5 digits, left-padded with zeros
 * @example "01234" - valid
 * @example "12345" - valid
 */
export const OFFICER_ID_REGEX = /^\d{5}$/;

/**
 * Normalize officer ID to 5 digits with leading zeros
 * @example normalizeOfficerId('1234') => '01234'
 * @example normalizeOfficerId('01234') => '01234'
 * @example normalizeOfficerId('123') => '00123'
 */
export function normalizeOfficerId(value: string): string {
  if (!value) return '';
  // Extract only digits
  const digitsOnly = value.replace(/\D/g, '');
  // Pad to 5 digits with leading zeros
  return digitsOnly.padStart(5, '0');
}

/**
 * Validate officer ID format
 * @param value - The officer ID to validate
 * @returns true if valid format (5 digits, left-padded), false otherwise
 * @example isValidOfficerId('01234') => true
 * @example isValidOfficerId('12345') => true
 * @example isValidOfficerId('1234') => false (too short)
 * @example isValidOfficerId('123456') => false (too long)
 */
export function isValidOfficerId(value: string): boolean {
  return OFFICER_ID_REGEX.test(value);
}

/**
 * Get a descriptive error message for invalid officer ID
 * Returns undefined if value is empty (field is optional) or valid
 * @param value - The officer ID to validate
 * @returns Error message string or undefined if valid/empty
 */
export function formatOfficerIdError(value: string): string | undefined {
  if (!value) return undefined; // Empty is OK (field is optional)
  if (value.length !== 5) return 'Must be exactly 5 digits';
  if (!/^\d+$/.test(value)) return 'Must contain only digits';
  return undefined; // Valid
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

// ============================================
// PAGE 1 HASH UTILITIES
// ============================================

/**
 * Normalize Page 1 inputs for consistent hashing
 * Applies all normalization rules before hashing
 */
export function normalizePage1Inputs(page1Data: {
  reportNumber: string;
  crashDate: string;
  crashTime: string;
  officerId: string;
}): {
  reportNumber: string;
  ncic: string;
  crashDate: string;
  crashTime: string;
  officerId: string;
} {
  return {
    // Report number: uppercase, digits and hyphens only
    reportNumber: page1Data.reportNumber.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
    // NCIC: first 4 digits only
    ncic: deriveNcic(page1Data.reportNumber),
    // Crash date: YYYY-MM-DD format (as-is from HTML date input)
    crashDate: page1Data.crashDate,
    // Crash time: normalize HH:MM or HHMM to HHMM
    crashTime: normalizeCrashTime(page1Data.crashTime),
    // Officer ID: 5 digits with leading zeros
    officerId: normalizeOfficerId(page1Data.officerId),
  };
}

/**
 * Generate SHA256 hash of Page 1 inputs for duplicate detection
 * Uses normalized inputs to ensure consistent hashing
 * @returns hex string of SHA256 hash
 */
export async function generatePage1Hash(page1Data: {
  reportNumber: string;
  crashDate: string;
  crashTime: string;
  officerId: string;
}): Promise<string> {
  const normalized = normalizePage1Inputs(page1Data);
  const hashInput = JSON.stringify(normalized);
  
  // Use Web Crypto API (available in Node.js and browsers)
  const encoder = new TextEncoder();
  const data = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Synchronous version of page1 hash for contexts where async isn't available
 * Uses a simpler hash algorithm (djb2) - less secure but deterministic
 */
export function generatePage1HashSync(page1Data: {
  reportNumber: string;
  crashDate: string;
  crashTime: string;
  officerId: string;
}): string {
  const normalized = normalizePage1Inputs(page1Data);
  const hashInput = JSON.stringify(normalized);
  
  // djb2 hash algorithm
  let hash = 5381;
  for (let i = 0; i < hashInput.length; i++) {
    hash = (hash * 33) ^ hashInput.charCodeAt(i);
  }
  
  // Convert to unsigned 32-bit integer and then to hex
  return (hash >>> 0).toString(16).padStart(8, '0');
}
