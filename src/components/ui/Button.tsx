import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-4',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Variant styles
          variant === 'primary' && [
            'bg-gradient-to-r from-teal-600 to-teal-700',
            'text-white shadow-lg shadow-teal-600/30',
            'hover:scale-102 hover:brightness-110',
            'active:scale-98',
            'focus-visible:ring-teal-500/20',
          ],
          variant === 'secondary' && [
            'bg-transparent border border-white/30',
            'text-white',
            'hover:bg-white/10',
            'active:scale-98',
            'focus-visible:ring-white/20',
          ],
          variant === 'tertiary' && [
            'text-teal-600 underline-offset-4',
            'hover:underline',
          ],

          // Size styles
          size === 'sm' && 'h-10 px-4 text-sm',
          size === 'md' && 'h-12 px-6 text-base',
          size === 'lg' && 'h-16 px-8 text-lg',

          // Full width
          fullWidth && 'w-full',

          className
        )}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && icon && iconPosition === 'left' && icon}
        {children}
        {!isLoading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// Spinner component for loading state
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
