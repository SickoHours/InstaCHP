/**
 * AnimatedBackground component
 * Creates the atmospheric gradient with floating blurred orbs
 * Uses CSS animations for performance (GPU-accelerated)
 */

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Floating Orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
    </div>
  );
}
