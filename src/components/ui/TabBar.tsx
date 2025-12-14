'use client';

import { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of tab items */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab is selected */
  onTabChange: (tabId: string) => void;
  /** Accessible label for the tab list */
  ariaLabel?: string;
  /** Visual variant: 'default' for inline tabs, 'pills' for glass-container pill tabs */
  variant?: 'default' | 'pills';
}

const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  ({ className, tabs, activeTab, onTabChange, ariaLabel = 'Filter options', variant = 'default', ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        let newIndex = currentIndex;

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
          case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            event.preventDefault();
            newIndex = tabs.length - 1;
            break;
          default:
            return;
        }

        // Update active tab and focus the new tab button
        const newTabId = tabs[newIndex].id;
        onTabChange(newTabId);

        // Focus the new tab button
        const container = containerRef.current;
        if (container) {
          const newButton = container.querySelector(
            `[data-tab-id="${newTabId}"]`
          ) as HTMLButtonElement;
          newButton?.focus();
        }
      },
      [tabs, onTabChange]
    );

    // Update indicator position when active tab changes
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const activeButton = container.querySelector(
        `[data-tab-id="${activeTab}"]`
      ) as HTMLButtonElement;

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - containerRect.left + container.scrollLeft,
          width: buttonRect.width,
        });

        // Scroll active tab into view
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, [activeTab]);

    const isPills = variant === 'pills';

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          // Pills variant gets a glass container
          isPills && 'glass-surface p-2',
          className
        )}
        {...props}
      >
        {/* Scrollable tab container */}
        <div
          ref={containerRef}
          role="tablist"
          aria-label={ariaLabel}
          className={cn(
            'flex gap-1 overflow-x-auto scrollbar-none',
            !isPills && 'pb-1 -mb-1', // Only compensate for indicator on default
            'relative'
          )}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  // Base styles
                  'relative flex items-center gap-2 px-4 py-2.5',
                  isPills ? 'rounded-lg' : 'rounded-lg',
                  'text-sm font-medium whitespace-nowrap',
                  'transition-all duration-300 ease-out',
                  'flex-shrink-0',

                  // Default state
                  'text-slate-400 hover:text-slate-200',
                  isPills
                    ? 'hover:bg-white/5'
                    : 'hover:bg-slate-800/50',

                  // Focus visible
                  'focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',

                  // Active state
                  isActive && [
                    'text-white',
                    isPills
                      ? 'bg-white/10 shadow-sm'
                      : 'bg-slate-800/80',
                  ]
                )}
              >
                {tab.label}

                {/* Count badge */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                      'transition-colors duration-300',
                      isActive
                        ? 'bg-amber-400/30 text-amber-300'
                        : 'bg-slate-700/50 text-slate-400'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Animated glow indicator - only for default variant */}
          {!isPills && (
            <div
              className={cn(
                'absolute bottom-0 h-0.5 rounded-full',
                'bg-gradient-to-r from-amber-400 to-cyan-500',
                'transition-all duration-300 ease-out',
                'shadow-[0_0_10px_rgba(20,184,166,0.5)]'
              )}
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
          )}
        </div>

        {/* Fade edges for scroll indication - only for default variant */}
        {!isPills && (
          <>
            <div className="absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-1 w-4 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none md:hidden" />
          </>
        )}
      </div>
    );
  }
);

TabBar.displayName = 'TabBar';

export default TabBar;
