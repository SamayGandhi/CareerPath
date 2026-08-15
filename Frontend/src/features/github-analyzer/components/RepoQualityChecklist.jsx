/**
 * RepoQualityChecklist.jsx — BATCH 5 (visual only)
 * Refined pass/fail icon and stat-tile treatment. Data shape
 * unchanged.
 */

import { CheckCircle2, XCircle } from 'lucide-react';

export default function RepoQualityChecklist({ repoQualitySignals }) {
  return (
    <div className="flex flex-col gap-3">
      {repoQualitySignals.qualitySignals?.map((signal) => (
        <div key={signal.label} className="flex items-start gap-2.5">
          {signal.passed ? (
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
          ) : (
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
              <XCircle className="h-3.5 w-3.5 text-text-tertiary" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">{signal.label}</p>
            <p className="text-xs text-text-tertiary">{signal.note}</p>
          </div>
        </div>
      ))}

      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-sm">
        <div>
          <p className="text-text-tertiary">Original Repos</p>
          <p className="text-lg font-semibold text-text-primary">{repoQualitySignals.originalRepoCount}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Total Stars</p>
          <p className="text-lg font-semibold text-text-primary">{repoQualitySignals.totalStars}</p>
        </div>
      </div>
    </div>
  );
}