'use client';

import { ToastProvider } from '@/context/ToastContext';
import { MockDataProvider } from '@/context/MockDataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastContainer } from '@/components/ui/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <MockDataProvider>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </MockDataProvider>
    </ThemeProvider>
  );
}
