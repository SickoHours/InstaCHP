import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Dashboard | InstaTCR',
  description: 'Staff job queue and management dashboard',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb-dark w-[600px] h-[600px] bg-teal-600/15 top-[-15%] right-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="orb-dark w-[500px] h-[500px] bg-blue-600/10 bottom-[10%] left-[-10%]"
          style={{ animationDelay: '7s' }}
        />
        <div
          className="orb-dark w-[400px] h-[400px] bg-purple-600/10 top-[40%] right-[20%]"
          style={{ animationDelay: '14s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
