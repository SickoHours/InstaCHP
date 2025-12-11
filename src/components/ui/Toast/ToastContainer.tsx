'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { Toast } from './Toast';

// ============================================
// COMPONENT
// ============================================

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Track exiting toasts for animation
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = (id: string) => {
    if (prefersReducedMotion) {
      // Immediately remove if reduced motion is preferred
      removeToast(id);
    } else {
      // Add to exiting set for animation
      setExitingIds((prev) => new Set(prev).add(id));
      // Remove after animation
      setTimeout(() => {
        removeToast(id);
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 200);
    }
  };

  // Don't render anything until mounted (SSR safety)
  if (!mounted) return null;

  // Don't render if no toasts
  if (toasts.length === 0) return null;

  const container = (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className={cn(
        'fixed z-[9999] flex flex-col gap-3 p-4',
        // Mobile: bottom center
        // Desktop: top right
        isMobile
          ? 'bottom-0 left-0 right-0 items-center'
          : 'top-4 right-4 items-end'
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={handleDismiss}
          isExiting={exitingIds.has(toast.id)}
        />
      ))}
    </div>
  );

  // Use portal to render at document root
  return createPortal(container, document.body);
}

export default ToastContainer;
