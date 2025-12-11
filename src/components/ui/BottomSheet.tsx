'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { cn } from '@/lib/utils';
import { useIsDesktop, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Optional title for the sheet header */
  title?: string;
  /** Content to display in the sheet */
  children: React.ReactNode;
  /** Show the drag handle indicator */
  showHandle?: boolean;
  /** Close when clicking the overlay */
  closeOnOverlayClick?: boolean;
  /** Additional class names for the sheet content */
  className?: string;
  /** Show close button in header */
  showCloseButton?: boolean;
}

/**
 * BottomSheet - A modal sheet that slides up from the bottom on mobile
 * and displays as a centered modal on desktop.
 *
 * Features:
 * - Slide-up animation on mobile
 * - Centered modal on desktop
 * - Dark overlay backdrop with blur
 * - Optional drag handle
 * - Keyboard accessible (Escape to close)
 * - Focus trapping
 * - Glass-morphism styling
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to continue?</p>
 *   <Button onClick={handleConfirm}>Confirm</Button>
 * </BottomSheet>
 * ```
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  closeOnOverlayClick = true,
  className,
  showCloseButton = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Lock body scroll and add event listeners when open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Focus the sheet
      sheetRef.current?.focus();

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        returnFocusOnDeactivate: true,
        escapeDeactivates: false, // We handle escape manually
        allowOutsideClick: true,
        fallbackFocus: () => sheetRef.current || document.body,
      }}
    >
      <div
        className={cn(
          'fixed inset-0 z-50',
          'flex items-end md:items-center justify-center',
          // Overlay styles
          'bg-black/60 backdrop-blur-sm',
          // Animation
          !prefersReducedMotion && 'animate-in fade-in duration-200'
        )}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Sheet Content */}
        <div
          ref={sheetRef}
          tabIndex={-1}
          className={cn(
            // Base styles
            'relative w-full outline-none',
            // Mobile: full width, bottom aligned, rounded top
            'max-h-[90vh] rounded-t-2xl',
            // Desktop: centered modal with max width
            'md:max-w-lg md:rounded-2xl md:mx-4',
            // Glass-morphism styling
            'glass-card-dark',
            'border border-slate-700/50',
            'shadow-2xl shadow-black/50',
            // Animation
            !prefersReducedMotion && [
              'animate-in',
              // Mobile: slide up
              'slide-in-from-bottom-full',
              // Desktop: fade and scale
              'md:slide-in-from-bottom-0 md:zoom-in-95',
              'duration-300 ease-out',
            ],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Drag Handle (mobile only) */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between px-5 py-4',
              'border-b border-slate-700/50'
            )}
          >
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-lg font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {!title && <div />}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  'text-slate-400 hover:text-white',
                  'hover:bg-slate-700/50',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500/50'
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'px-5 py-4',
            'overflow-y-auto',
            'max-h-[calc(90vh-8rem)]'
          )}
        >
          {children}
        </div>

          {/* Safe area padding for notched phones */}
          <div className="h-safe-area-inset-bottom md:hidden" />
        </div>
      </div>
    </FocusTrap>
  );
}

// ============================================
// PRESET VARIANTS
// ============================================

interface ConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

/**
 * ConfirmSheet - A pre-built confirmation bottom sheet
 *
 * @example
 * ```tsx
 * <ConfirmSheet
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmSheetProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className={cn(
            'flex-1 h-12 md:h-10 rounded-lg',
            'border border-slate-600 text-slate-300',
            'font-medium',
            'hover:bg-slate-800/50',
            'transition-colors duration-200'
          )}
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            'flex-1 h-12 md:h-10 rounded-lg',
            'font-medium',
            'transition-colors duration-200',
            variant === 'danger'
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-teal-600 text-white hover:bg-teal-500'
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  );
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }[];
}

/**
 * ActionSheet - A bottom sheet with a list of actions
 *
 * @example
 * ```tsx
 * <ActionSheet
 *   isOpen={showActions}
 *   onClose={() => setShowActions(false)}
 *   title="Options"
 *   actions={[
 *     { label: 'Edit', icon: <Edit />, onClick: handleEdit },
 *     { label: 'Delete', icon: <Trash />, onClick: handleDelete, variant: 'danger' },
 *   ]}
 * />
 * ```
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: ActionSheetProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showHandle={true}
    >
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action.onClick)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
              'text-left font-medium',
              'transition-colors duration-200',
              action.variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-slate-200 hover:bg-slate-700/50'
            )}
          >
            {action.icon && (
              <span
                className={cn(
                  'w-5 h-5',
                  action.variant === 'danger' ? 'text-red-400' : 'text-slate-400'
                )}
              >
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
