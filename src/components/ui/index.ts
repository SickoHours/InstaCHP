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

// Interactive prompts (V1.0.5+)
export { default as DriverPassengerChoice } from './DriverPassengerChoice';
export { default as PassengerMiniForm } from './PassengerMiniForm';
export { default as CHPNudge } from './CHPNudge';
export { default as Page1DetailsCard } from './Page1DetailsCard';

// Law firm data cards (V1.0.6+)
export { default as Page1DataCard } from './Page1DataCard';
export { default as Page2DataCard } from './Page2DataCard';

// Unified inline form (V1.0.7+)
export { default as InlineFieldsCard } from './InlineFieldsCard';

// Flow wizard components (V1.1.0+)
export { default as FlowWizard } from './FlowWizard';
export { default as SpeedUpPrompt } from './SpeedUpPrompt';
export { default as CrashDetailsForm } from './CrashDetailsForm';
export { default as PassengerVerificationForm } from './PassengerVerificationForm';

// Rescue flow components (V1.2.0+)
export { default as DriverInfoRescueForm } from './DriverInfoRescueForm';

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

// Notification system (V1.8.0+)
export { default as NotificationBell } from './NotificationBell';
export { default as NotificationItem } from './NotificationItem';

// Sidebar components (V2.0.0+)
export { SidebarJobCard } from './SidebarJobCard';

// Wrapper safety components (V2.0.0+)
export { WrapperSafetyBanner, WrapperSafetyStatus } from './WrapperSafetyBanner';

// Page 1 attempt guardrails (V2.7.0+)
export { Page1WarningBanner, Page1ConfirmationModal, Page1LockedBanner } from './Page1AttemptGuard';
export { default as Page1FailureCard } from './Page1FailureCard';
