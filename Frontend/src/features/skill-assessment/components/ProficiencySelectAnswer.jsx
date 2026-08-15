/**
 * ProficiencySelectAnswer.jsx
 * -----------------------------------------
 * Renders the option list for a 'proficiencySelect' question type.
 * BATCH 4 UPDATE (visual only): refined selected-state treatment with
 * a subtle scale and check-style border glow. Props/behavior
 * unchanged.
 */

import { classNames } from '../../../utils';

export default function ProficiencySelectAnswer({ options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.label)}
          className={classNames(
            'rounded-md border px-4 py-3 text-left text-sm transition-all duration-150 ease-out',
            value === option.label
              ? 'border-brand bg-brand-subtle text-brand shadow-[0_0_0_1px_var(--color-brand)]'
              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:bg-surface-secondary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}