/**
 * YesNoAnswer.jsx
 * -----------------------------------------
 * Renders a binary choice for a 'yesNo' question type.
 * BATCH 4 UPDATE (visual only): refined selected-state treatment.
 * Value/onChange behavior unchanged.
 */

import { classNames } from '../../../utils';

export default function YesNoAnswer({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Yes', val: true },
        { label: 'No', val: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.val)}
          className={classNames(
            'rounded-md border px-4 py-3 text-sm font-medium transition-all duration-150 ease-out',
            value === opt.val
              ? 'border-brand bg-brand-subtle text-brand shadow-[0_0_0_1px_var(--color-brand)]'
              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:bg-surface-secondary'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}