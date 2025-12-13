import { AppShell } from '@/components/shell';

export const metadata = {
  title: 'Staff Dashboard | InstaTCR',
  description: 'Staff job queue and management dashboard',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell userType="staff">{children}</AppShell>;
}
