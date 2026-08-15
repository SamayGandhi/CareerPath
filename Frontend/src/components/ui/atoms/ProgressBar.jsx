/**
 * ProgressBar.jsx
 * -----------------------------------------
 * Determinate progress bar.
 * BATCH 1 UPDATE (visual only): smoother, longer fill transition for
 * a more premium feel. Props/logic unchanged: value, variant,
 * className, showLabel.
 */

import { classNames } from '../../../utils';

export default function ProgressBar({ value = 0, variant = 'brand', className = '', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, value));

  const variantClasses = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={classNames('w-full', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
        <div
          className={classNames(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="mt-1 block text-xs text-text-tertiary">{clamped}%</span>}
    </div>
  );
}