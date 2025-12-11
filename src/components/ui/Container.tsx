import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
  noPadding?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      size = 'lg',
      noPadding = false,
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
          'mx-auto w-full',

          // Size styles
          size === 'sm' && 'max-w-3xl',    // 768px
          size === 'md' && 'max-w-5xl',    // 1024px
          size === 'lg' && 'max-w-7xl',    // 1280px
          size === 'full' && 'max-w-full',

          // Padding styles
          !noPadding && 'px-4 md:px-8',

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
