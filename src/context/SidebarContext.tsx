'use client';

/**
 * SidebarContext - V2.0.0
 *
 * Global state management for the app shell sidebar.
 * Handles mobile drawer visibility and desktop collapse state.
 * Persists collapse preference to localStorage.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface SidebarContextValue {
  // Mobile drawer open/close
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Desktop collapse (320px vs 72px)
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

/**
 * Get storage key for sidebar collapsed state based on user type
 */
function getStorageKey(userType?: 'law_firm' | 'staff'): string {
  const baseKey = 'instaTCR_sidebar_collapsed';
  return userType ? `${baseKey}_${userType}` : baseKey;
}

/**
 * Get initial collapsed state from localStorage (client-side only)
 */
function getInitialCollapsed(defaultValue: boolean, userType?: 'law_firm' | 'staff'): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const storageKey = getStorageKey(userType);
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : defaultValue;
  } catch {
    return defaultValue;
  }
}

interface SidebarProviderProps {
  children: ReactNode;
  /** User type for user-specific storage */
  userType?: 'law_firm' | 'staff';
  /** Default collapsed state (before localStorage loads) */
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  userType,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);

  // Desktop collapse state - use lazy initialization to avoid setState in effect
  // Law firm always defaults to open (not collapsed) on first visit
  // Staff can have their own default
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (userType === 'law_firm') {
      // Law firm users: sidebar is OPEN by default on first visit
      // Check localStorage to see if user has explicitly collapsed it
      if (typeof window === 'undefined') {
        // SSR: default to open (not collapsed)
        return false;
      }
      
      const storageKey = getStorageKey(userType);
      const stored = localStorage.getItem(storageKey);
      
      // On first visit (stored === null): return false (sidebar open) ✓
      // If user collapsed it (stored === 'true'): return true (sidebar collapsed) ✓
      // If user opened it (stored === 'false'): return false (sidebar open) ✓
      return stored === 'true';
    }
    // Staff users: use their default or localStorage preference
    return getInitialCollapsed(defaultCollapsed, userType);
  });

  // Persist collapsed preference to localStorage
  useEffect(() => {
    const storageKey = getStorageKey(userType);
    localStorage.setItem(storageKey, String(isCollapsed));
  }, [isCollapsed, userType]);

  // Mobile drawer handlers
  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  // Desktop collapse handlers
  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const setCollapsed = useCallback((collapsed: boolean) => setIsCollapsed(collapsed), []);

  const value: SidebarContextValue = {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    isCollapsed,
    toggleCollapse,
    setCollapsed,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export { SidebarContext };
