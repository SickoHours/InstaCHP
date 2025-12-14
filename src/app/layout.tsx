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

// Inline script to prevent flash of wrong theme (runs before React hydration)
// Enforces route-based defaults: staff = dark, law_firm = light
const themeScript = `
(function() {
  try {
    var pathname = window.location.pathname;
    var isStaffRoute = pathname.startsWith('/staff');
    
    if (isStaffRoute) {
      // Staff: always dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      return;
    }
    
    // Law firm: check their specific storage key, default to dark
    var stored = localStorage.getItem('instaTCR_theme_law_firm');
    var theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      // Default to dark mode for law firms
      theme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Fallback: check pathname, default to light if can't determine
    var pathname = window.location.pathname;
    var isStaffRoute = pathname.startsWith('/staff');
    document.documentElement.setAttribute('data-theme', isStaffRoute ? 'dark' : 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${workSans.variable} ${sourceSerif.variable} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-amber-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
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
