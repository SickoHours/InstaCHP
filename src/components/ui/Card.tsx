import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg',

          // Variant styles
          variant === 'default' && [
            'bg-white shadow-md',
          ],
          variant === 'glass' && [
            'glass-card',
          ],
          variant === 'bordered' && [
            'border border-slate-300',
          ],

          // Padding styles
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',

          // Hover effect
          hover && [
            'transition-all duration-300',
            'hover:-translate-y-1 hover:shadow-xl',
          ],

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
