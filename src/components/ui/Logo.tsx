import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
}

export default function Logo({
  size = 'md',
  variant = 'light',
  showWordmark = true
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center font-serif font-bold transition-opacity hover:opacity-80',
        size === 'sm' && 'text-xl',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-3xl'
      )}
    >
      {showWordmark && (
        <>
          <span className={cn(
            variant === 'light' ? 'text-amber-400' : 'text-amber-500'
          )}>
            Insta
          </span>
          <span className={cn(
            variant === 'light' ? 'text-white' : 'text-slate-900'
          )}>
            TCR
          </span>
        </>
      )}
    </Link>
  );
}
