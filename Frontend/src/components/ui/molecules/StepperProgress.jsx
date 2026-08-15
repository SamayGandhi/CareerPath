/**
 * StepperProgress.jsx
 * -----------------------------------------
 * Thin top progress bar with a step counter label.
 * BATCH 1 UPDATE (visual only): smoother, longer fill transition.
 * Props/API unchanged: currentStep, totalSteps, label.
 */

export default function StepperProgress({ currentStep, totalSteps, label }) {
  const percentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-text-tertiary">
        <span>{label}</span>
        <span>
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}