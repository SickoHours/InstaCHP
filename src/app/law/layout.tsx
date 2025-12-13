import { AppShell } from '@/components/shell';

export const metadata = {
  title: 'Dashboard | InstaTCR',
  description: 'View and manage your CHP crash report requests',
};

export default function LawFirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell userType="law_firm">{children}</AppShell>;
}
