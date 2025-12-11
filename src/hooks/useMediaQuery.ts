'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive design with media queries
 * SSR-safe - returns defaultValue on server, updates on client
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @param defaultValue - Value to return on server and before hydration
 * @returns boolean indicating if the media query matches
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  const handleChange = useCallback((e: MediaQueryListEvent | MediaQueryList) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    // Use addEventListener for modern browsers, addListener for older ones
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }
  }, [query, handleChange]);

  return matches;
}

// ============================================
// PRESET HOOKS FOR COMMON BREAKPOINTS
// ============================================

/**
 * Check if viewport is mobile (< 768px)
 * Matches Tailwind's default `md` breakpoint
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)', true); // Default true for mobile-first
}

/**
 * Check if viewport is desktop (>= 768px)
 * Matches Tailwind's default `md` breakpoint
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)', false);
}

/**
 * Check if viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)', false);
}

/**
 * Check if viewport is large desktop (>= 1280px)
 * Matches Tailwind's default `xl` breakpoint
 */
export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)', false);
}

// ============================================
// ACCESSIBILITY HOOKS
// ============================================

/**
 * Check if user prefers reduced motion
 * Useful for disabling animations
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/**
 * Check if user prefers dark color scheme
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)', false);
}

/**
 * Check if device has coarse pointer (touch screen)
 * Useful for increasing touch target sizes
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)', false);
}

// ============================================
// BREAKPOINT CONSTANTS (for reference)
// ============================================

export const BREAKPOINTS = {
  mobile: 375,   // Minimum mobile width
  sm: 640,       // Tailwind sm
  md: 768,       // Tailwind md (primary breakpoint)
  lg: 1024,      // Tailwind lg
  xl: 1280,      // Tailwind xl
  '2xl': 1536,   // Tailwind 2xl
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint name
 * Returns the largest breakpoint that matches
 */
export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'mobile';
}
