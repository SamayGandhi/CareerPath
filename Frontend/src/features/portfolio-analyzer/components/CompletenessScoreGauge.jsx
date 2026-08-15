/**
 * CompletenessScoreGauge.jsx — BATCH 5 (visual only)
 * Gradient gauge matching the new palette. Logic unchanged.
 */

export default function CompletenessScoreGauge({ score }) {
  const angle = (score / 100) * 360;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-500"
        style={{
          background: `conic-gradient(from 0deg, var(--raw-brand-primary), var(--raw-accent-cyan) ${angle}deg, var(--raw-bg-surface-secondary) ${angle}deg)`,
        }}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-surface shadow-inner">
          <span className="text-2xl font-bold tracking-tight text-text-primary">{score}</span>
          <span className="text-xs text-text-tertiary">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-text-secondary">Completeness Score</span>
    </div>
  );
}