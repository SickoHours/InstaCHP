/**
 * Barrel exports for custom hooks
 * Allows clean imports: import { useMediaQuery, useIsMobile } from '@/hooks'
 */

export {
  useMediaQuery,
  useIsMobile,
  useIsDesktop,
  useIsTablet,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useIsTouchDevice,
  useBreakpoint,
  BREAKPOINTS,
  type Breakpoint,
} from './useMediaQuery';
