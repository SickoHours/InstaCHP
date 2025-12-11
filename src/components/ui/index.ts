/**
 * Barrel exports for UI components
 * Allows clean imports: import { Button, Card, Container } from '@/components/ui'
 */

// Core components
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Container } from './Container';
export { default as Logo } from './Logo';
export { default as Input } from './Input';

// Status & badges
export { default as StatusBadge } from './StatusBadge';

// Cards
export { default as MobileJobCard } from './MobileJobCard';
export { default as StaffJobCard } from './StaffJobCard';
export { default as StatCard } from './StatCard';

// Navigation & layout
export { default as TabBar } from './TabBar';
export { default as FloatingActionButton } from './FloatingActionButton';
export { default as MobileNav, NAV_PRESETS, LAW_FIRM_NAV_ITEMS, STAFF_NAV_ITEMS } from './MobileNav';
export { default as MobileDrawer, NavigationDrawer } from './MobileDrawer';

// Modals & overlays
export { default as BottomSheet, ConfirmSheet, ActionSheet } from './BottomSheet';

// Timeline
export { default as TimelineMessage } from './TimelineMessage';

// Toast notifications
export { Toast, ToastContainer } from './Toast';

// Skeleton loading
export {
  SkeletonBase,
  SkeletonText,
  SkeletonCard,
  JobCardSkeleton,
  StatCardSkeleton,
  TimelineItemSkeleton,
} from './Skeleton';

// Tooltip & text utilities
export { default as Tooltip } from './Tooltip';
export { default as TruncatedText } from './TruncatedText';

// Error states
export { default as ErrorState, NetworkError, NotFoundError, ServerError } from './ErrorState';
