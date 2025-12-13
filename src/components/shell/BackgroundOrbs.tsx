/**
 * BackgroundOrbs - V2.0.0
 *
 * Animated floating background orbs used in the dark theme app shell.
 * Extracted from individual pages to be rendered once in the AppShell.
 *
 * Uses CSS animation defined in globals.css (orb-dark class).
 */

export function BackgroundOrbs() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Top-left teal orb */}
      <div
        className="orb-dark w-[500px] h-[500px] bg-teal-600/25 top-[-10%] left-[-10%]"
        style={{ animationDelay: '0s' }}
      />

      {/* Right-side cyan orb */}
      <div
        className="orb-dark w-[400px] h-[400px] bg-cyan-600/20 bottom-[20%] right-[-5%]"
        style={{ animationDelay: '5s' }}
      />

      {/* Bottom-center slate orb */}
      <div
        className="orb-dark w-[600px] h-[600px] bg-slate-700/25 bottom-[-20%] left-[30%]"
        style={{ animationDelay: '10s' }}
      />
    </div>
  );
}

export default BackgroundOrbs;
