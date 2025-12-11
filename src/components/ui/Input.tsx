'use client';

import { forwardRef, useState, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  isValid?: boolean;
  showValidation?: boolean;
  /** Theme variant */
  theme?: 'light' | 'dark';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      isValid,
      showValidation = true,
      theme = 'light',
      type = 'text',
      id: providedId,
      value,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const isDark = theme === 'dark';

    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        {/* Input wrapper */}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              // Base styles
              'peer w-full rounded-xl border-2 outline-none',
              'transition-all duration-300 ease-out',
              // Size - mobile first (48px height, 16px font)
              'h-14 pt-5 pb-2 px-4 text-base',
              // Desktop (40px effective with adjusted padding)
              'md:h-12 md:pt-4 md:pb-1 md:text-sm',
              // Placeholder (hidden when floating label is active)
              'placeholder:text-transparent',

              // Light mode styles
              !isDark && [
                'bg-white',
                'border-slate-200 text-slate-900',
                isFocused && !error && 'border-teal-500 ring-4 ring-teal-500/10',
                isValid && showValidation && !error && !isFocused && 'border-emerald-500',
                error && 'border-red-500 ring-4 ring-red-500/10',
                !isFocused && !error && 'hover:border-slate-300',
              ],

              // Dark mode styles
              isDark && [
                'bg-slate-900/50',
                'border-slate-700/50 text-white',
                isFocused && !error && 'border-teal-500/70 ring-4 ring-teal-500/20',
                isValid && showValidation && !error && !isFocused && 'border-emerald-500/70',
                error && 'border-red-500/70 ring-4 ring-red-500/20',
                !isFocused && !error && 'hover:border-slate-600',
              ],

              className
            )}
            {...props}
          />

          {/* Floating label */}
          <label
            htmlFor={id}
            className={cn(
              'absolute left-4 pointer-events-none',
              'transition-all duration-300 ease-out',

              // Default position (centered) - Light mode
              !isDark && !isFloating && [
                'top-1/2 -translate-y-1/2',
                'text-base md:text-sm',
                'text-slate-500',
              ],
              // Floating position - Light mode
              !isDark && isFloating && [
                'top-2 md:top-1.5',
                'text-xs',
                isFocused ? 'text-teal-600' : 'text-slate-500',
              ],
              // Error state - Light mode
              !isDark && error && isFloating && 'text-red-500',
              // Valid state - Light mode
              !isDark && isValid && showValidation && !error && isFloating && !isFocused && 'text-emerald-600',

              // Default position (centered) - Dark mode
              isDark && !isFloating && [
                'top-1/2 -translate-y-1/2',
                'text-base md:text-sm',
                'text-slate-500',
              ],
              // Floating position - Dark mode
              isDark && isFloating && [
                'top-2 md:top-1.5',
                'text-xs',
                isFocused ? 'text-teal-400' : 'text-slate-500',
              ],
              // Error state - Dark mode
              isDark && error && isFloating && 'text-red-400',
              // Valid state - Dark mode
              isDark && isValid && showValidation && !error && isFloating && !isFocused && 'text-emerald-400',
            )}
          >
            {label}
            {props.required && <span className={cn(isDark ? 'text-red-400' : 'text-red-400', 'ml-0.5')}>*</span>}
          </label>

          {/* Validation checkmark */}
          {isValid && showValidation && !error && !isFocused && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-check-pop">
                <Check className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-500')} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* Helper text / Error message */}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-xs px-1',
              error
                ? cn(isDark ? 'text-red-400' : 'text-red-500', 'animate-error-slide')
                : cn(isDark ? 'text-slate-500' : 'text-slate-500')
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
