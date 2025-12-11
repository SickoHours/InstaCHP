/**
 * Design system constants for InstaTCR
 */

// Color palette
export const colors = {
  // Primary colors
  primaryNavy: '#0f2c59',
  primaryGold: '#c5a572',

  // Accent colors
  accentTeal: '#1a7f7a',
  accentAmber: '#d97706',

  // Neutral colors
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate300: '#cbd5e1',
  slate600: '#475569',
  slate900: '#0f172a',

  // Semantic colors
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
} as const;

// Breakpoints (in pixels)
export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
} as const;

// Animation durations (in milliseconds)
export const durations = {
  fast: 200,
  normal: 300,
  slow: 700,
  orb: 25000,
} as const;

// Touch target sizes (WCAG AAA)
export const touchTargets = {
  minimum: 44, // 44px minimum
  comfortable: 48, // 48px for better UX
  hero: 64, // 64px for hero CTAs
} as const;
