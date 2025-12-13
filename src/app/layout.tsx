import type { Metadata } from "next";
import { Work_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InstaTCR | CHP Crash Reports Automated",
  description: "Get California Highway Patrol crash reports in minutes, not days. InstaTCR automates the process of requesting and obtaining CHP reports for law firms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${workSans.variable} ${sourceSerif.variable} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>

        {/* DEV MODE INDICATOR - Shows when running in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 left-2 px-2 py-1 bg-amber-500/90 text-amber-950 text-[10px] font-mono font-bold rounded z-[9999] shadow-lg pointer-events-none">
            DEV MODE
          </div>
        )}
      </body>
    </html>
  );
}
