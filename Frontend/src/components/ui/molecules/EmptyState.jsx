/**
 * EmptyState.jsx
 * -----------------------------------------
 * Reusable empty-state pattern per approved Design System.
 * BATCH 1 UPDATE (visual only): icon now sits in a soft circular
 * container for a more polished look, and the whole block fades/lifts
 * in on mount. Props/API unchanged: icon, title, description,
 * actionLabel, onAction.
 */

import Button from '../atoms/Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex animate-fade-in-up flex-col items-center gap-4 rounded-lg border border-dashed border-border-subtle py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-secondary">
          <Icon className="h-7 w-7 text-text-tertiary" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      </div>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}