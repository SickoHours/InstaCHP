'use client';

/**
 * ThemeContext - V2.0.0
 *
 * Global state management for theme (light/dark mode).
 * Handles system preference detection, localStorage persistence,
 * and live updates when system preference changes.
 *
 * Enforces user-type-specific defaults:
 * - Staff: Always dark mode (no toggle allowed)
 * - Law Firm: Dark mode default (toggle allowed)
 *
 * Pattern mirrors SidebarContext for consistency.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';
type UserType = 'staff' | 'law_firm';

interface ThemeContextValue {
  /** Current resolved theme (always 'light' or 'dark') */
  theme: Theme;
  /** User's preference (could be 'system') */
  preference: ThemePreference;
  /** Toggle between light and dark (no-op for staff) */
  toggleTheme: () => void;
  /** Set a specific preference (no-op for staff) */
  setTheme: (preference: ThemePreference) => void;
  /** Check if currently using system preference */
  isSystemPreference: boolean;
  /** Whether theme toggle is allowed (false for staff) */
  canToggleTheme: boolean;
  /** Current user type */
  userType: UserType;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'instaTCR_theme';
const LAW_FIRM_STORAGE_KEY = 'instaTCR_theme_law_firm';

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Detect user type from pathname
 */
function getUserTypeFromPathname(pathname: string): UserType {
  if (pathname.startsWith('/staff')) {
    return 'staff';
  }
  return 'law_firm';
}

/**
 * Get initial preference from localStorage (law firm only)
 * Staff always uses dark mode, so this is only for law firms
 */
function getStoredPreference(userType: UserType): ThemePreference {
  if (typeof window === 'undefined') return 'dark';
  
  // Staff always uses dark mode
  if (userType === 'staff') {
    return 'dark';
  }
  
  // Law firm: check their specific storage key, fallback to dark
  try {
    const stored = localStorage.getItem(LAW_FIRM_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Default to dark mode for law firms
    return 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Resolve preference to actual theme
 */
function resolveTheme(preference: ThemePreference): Theme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname();
  const userType = getUserTypeFromPathname(pathname);
  const canToggleTheme = userType === 'law_firm';

  // User preference (light, dark, or system)
  // Staff always uses dark, law firm defaults to light
  const [preference, setPreference] = useState<ThemePreference>(() => 
    getStoredPreference(userType)
  );

  // Resolved theme (always light or dark)
  // Staff is always dark, law firm respects preference
  const [theme, setTheme] = useState<Theme>(() => {
    if (userType === 'staff') {
      return 'dark';
    }
    return resolveTheme(preference);
  });

  // Enforce staff dark mode when user type changes
  useEffect(() => {
    if (userType === 'staff') {
      setPreference('dark');
      setTheme('dark');
    } else {
      // Law firm: use stored preference or default to dark
      const lawFirmPreference = getStoredPreference('law_firm');
      setPreference(lawFirmPreference);
      setTheme(resolveTheme(lawFirmPreference));
    }
  }, [userType]);

  // Apply theme to document when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Persist preference to localStorage (law firm only)
  useEffect(() => {
    if (userType === 'staff') {
      // Staff doesn't persist - always dark
      return;
    }
    try {
      // Store law firm preference separately
      if (preference !== 'system') {
        localStorage.setItem(LAW_FIRM_STORAGE_KEY, preference);
      }
    } catch {
      // localStorage might be unavailable
    }
  }, [preference, userType]);

  // Listen for system preference changes when using 'system' preference (law firm only)
  useEffect(() => {
    if (userType === 'staff' || preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [preference, userType]);

  // Update resolved theme when preference changes (law firm only)
  useEffect(() => {
    if (userType === 'staff') {
      setTheme('dark');
      return;
    }
    setTheme(resolveTheme(preference));
  }, [preference, userType]);

  // Toggle between light and dark (no-op for staff)
  const toggleTheme = useCallback(() => {
    if (userType === 'staff') {
      // Staff cannot toggle - always dark
      return;
    }
    setPreference((prev) => {
      const currentTheme = resolveTheme(prev);
      return currentTheme === 'dark' ? 'light' : 'dark';
    });
  }, [userType]);

  // Set a specific preference (no-op for staff)
  const handleSetTheme = useCallback((newPreference: ThemePreference) => {
    if (userType === 'staff') {
      // Staff cannot change theme - always dark
      return;
    }
    setPreference(newPreference);
  }, [userType]);

  const value: ThemeContextValue = {
    theme,
    preference,
    toggleTheme,
    setTheme: handleSetTheme,
    isSystemPreference: preference === 'system',
    canToggleTheme,
    userType,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export type { Theme, ThemePreference };
