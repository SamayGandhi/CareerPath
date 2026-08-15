/**
 * ReadinessScoreGauge.jsx
 * -----------------------------------------
 * Conic-gradient gauge.
 * BATCH 4 UPDATE (visual only): gradient now spans brand->accent
 * (matching the new palette) instead of a flat brand color, refined
 * inner circle shadow. Uses the --raw-* variable namespace exactly as
 * required for Tailwind v4 compatibility. Score computation/props
 * unchanged.
 */

export default function ReadinessScoreGauge({ score }) {
  const angle = (score / 100) * 360;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-500"
        style={{
          background: `conic-gradient(from 0deg, var(--raw-brand-primary), var(--raw-accent-cyan) ${angle}deg, var(--raw-bg-surface-secondary) ${angle}deg)`,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface shadow-inner">
          <span className="text-3xl font-bold tracking-tight text-text-primary">{score}</span>
          <span className="text-xs text-text-tertiary">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-text-secondary">Readiness Score</span>
    </div>
  );
}