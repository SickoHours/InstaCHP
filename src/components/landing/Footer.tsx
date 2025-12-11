'use client';

import { Container } from '@/components/ui';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-white/10">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-400">
            &copy; {currentYear} InstaTCR. All rights reserved.
          </p>

          {/* Optional Links - Minimal for V1 */}
          <div className="flex gap-6 text-sm text-slate-400">
            <a
              href="#"
              className="hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Contact
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
