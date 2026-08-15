/**
 * ScoreBadge.jsx
 * -----------------------------------------
 * 0-100 score badge, color-tiered.
 * BATCH 4 UPDATE (visual only): added a subtle ring matching the tier
 * color for extra definition. Tier thresholds/logic unchanged.
 */

import { classNames } from '../../../utils';

function getTierClasses(score) {
  if (score >= 80) return 'bg-success/10 text-success ring-1 ring-success/25';
  if (score >= 60) return 'bg-info/10 text-info ring-1 ring-info/25';
  if (score >= 40) return 'bg-warning/10 text-warning ring-1 ring-warning/25';
  return 'bg-danger/10 text-danger ring-1 ring-danger/25';
}

export default function ScoreBadge({ score }) {
  return (
    <div
      className={classNames(
        'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg font-bold transition-colors duration-150',
        getTierClasses(score)
      )}
    >
      <span className="text-lg leading-none">{score}</span>
    </div>
  );
}