import { Container, Logo } from '@/components/ui';
import { DEFAULT_LAW_FIRM_NAME } from '@/lib/mockData';

export const metadata = {
  title: 'Dashboard | InstaTCR',
  description: 'View and manage your CHP crash report requests',
};

export default function LawFirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <Logo size="md" variant="dark" />

            {/* Desktop: Law firm name */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-slate-600 font-medium">
                {DEFAULT_LAW_FIRM_NAME}
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
