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

const STORAGE_KEY = 'instaTCR_sidebar_collapsed';

/**
 * Get initial collapsed state from localStorage (client-side only)
 */
function getInitialCollapsed(defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : defaultValue;
  } catch {
    return defaultValue;
  }
}

interface SidebarProviderProps {
  children: ReactNode;
  /** Default collapsed state (before localStorage loads) */
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);

  // Desktop collapse state - use lazy initialization to avoid setState in effect
  const [isCollapsed, setIsCollapsed] = useState(() => getInitialCollapsed(defaultCollapsed));

  // Persist collapsed preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

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
