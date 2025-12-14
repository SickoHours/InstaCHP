'use client';

/**
 * BackgroundOrbs - V2.1.0
 *
 * Animated floating background orbs used in the dark theme app shell.
 * Only renders in dark mode - returns null in light mode for clean background.
 *
 * Uses CSS animation defined in globals.css (orb-dark class).
 */

import { useTheme } from '@/context/ThemeContext';

export function BackgroundOrbs() {
  const { theme } = useTheme();

  // Don't render orbs in light mode - user preference for clean background
  if (theme === 'light') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Top-left amber orb */}
      <div
        className="orb-dark w-[500px] h-[500px] bg-amber-500/20 top-[-10%] left-[-10%]"
        style={{ animationDelay: '0s' }}
      />

      {/* Right-side navy orb */}
      <div
        className="orb-dark w-[400px] h-[400px] bg-blue-600/15 bottom-[20%] right-[-5%]"
        style={{ animationDelay: '5s' }}
      />

      {/* Bottom-center slate orb */}
      <div
        className="orb-dark w-[600px] h-[600px] bg-slate-700/25 bottom-[-20%] left-[30%]"
        style={{ animationDelay: '10s' }}
      />
    </div>
  );
}

export default BackgroundOrbs;
