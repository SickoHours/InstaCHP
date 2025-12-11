'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button, Logo } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col justify-center py-20 transition-all duration-700',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      {/* Logo */}
      <div className="mb-16">
        <Logo size="lg" variant="light" />
      </div>

      {/* Headline */}
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        Get California Crash Reports
        <br />
        in Minutes, Not Days
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
        InstaTCR automates the tedious process of requesting and obtaining California
        Highway Patrol crash reports, so your firm can focus on what matters.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
        <Link href="/law" className="flex-1">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Law Firm Dashboard
          </Button>
        </Link>

        <Link href="/staff" className="flex-1">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Shield className="w-5 h-5" />}
            iconPosition="left"
          >
            Staff Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
