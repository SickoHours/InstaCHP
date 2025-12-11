'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';

// ============================================
// TYPES
// ============================================

interface TruncatedTextProps {
  /** Text content to display */
  text: string;
  /** Maximum number of lines before truncating (default: 1) */
  lines?: 1 | 2 | 3;
  /** Additional class names */
  className?: string;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show tooltip even if text isn't truncated */
  alwaysShowTooltip?: boolean;
}

// ============================================
// LINE CLAMP CLASSES
// ============================================

const LINE_CLAMP_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'truncate',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};

// ============================================
// COMPONENT
// ============================================

export function TruncatedText({
  text,
  lines = 1,
  className,
  tooltipPosition = 'top',
  alwaysShowTooltip = false,
}: TruncatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Check if text is actually truncated
  useEffect(() => {
    const checkTruncation = () => {
      if (!textRef.current) return;

      const element = textRef.current;

      if (lines === 1) {
        // For single line, compare scrollWidth to clientWidth
        setIsTruncated(element.scrollWidth > element.clientWidth);
      } else {
        // For multi-line, compare scrollHeight to clientHeight
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    };

    checkTruncation();

    // Recheck on resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text, lines]);

  const showTooltip = isTruncated || alwaysShowTooltip;

  return (
    <Tooltip
      content={showTooltip ? text : null}
      position={tooltipPosition}
      disabled={!showTooltip}
    >
      <span
        ref={textRef}
        className={cn(
          LINE_CLAMP_CLASSES[lines],
          'block',
          className
        )}
        title="" // Prevent default browser tooltip
      >
        {text}
      </span>
    </Tooltip>
  );
}

export default TruncatedText;
