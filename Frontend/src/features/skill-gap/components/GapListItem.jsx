/**
 * GapListItem.jsx
 * -----------------------------------------
 * Single row in the severity-ranked gap list.
 * BATCH 4 UPDATE (visual only): refined layout with a left accent bar
 * matching severity color, smoother hover. Props/data shape unchanged.
 */

import { AlertTriangle } from 'lucide-react';
import SeverityBadge from '../../../components/ui/molecules/SeverityBadge';
import { classNames } from '../../../utils';

const SEVERITY_BORDER = {
  critical: 'border-l-danger',
  moderate: 'border-l-warning',
  minor: 'border-l-info',
  none: 'border-l-success',
};

export default function GapListItem({ gap }) {
  return (
    <div
      className={classNames(
        'flex items-center justify-between rounded-md border border-l-[3px] border-border-subtle px-4 py-3',
        'transition-colors duration-150 hover:bg-surface-secondary/50',
        SEVERITY_BORDER[gap.gapSeverity] || SEVERITY_BORDER.none
      )}
    >
      <div>
        <p className="font-medium text-text-primary">{gap.skillId?.skillName || 'Skill'}</p>
        <p className="text-xs text-text-tertiary">
          Current: {gap.currentLevel}/5 · Required: {gap.requiredLevel}/5
        </p>
        {gap.missingPrerequisites?.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            {gap.missingPrerequisites.length} prerequisite
            {gap.missingPrerequisites.length > 1 ? 's' : ''} missing
          </p>
        )}
      </div>
      <SeverityBadge severity={gap.gapSeverity} />
    </div>
  );
}