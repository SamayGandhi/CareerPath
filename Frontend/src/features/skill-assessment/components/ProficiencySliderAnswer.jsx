/**
 * ProficiencySliderAnswer.jsx
 * -----------------------------------------
 * Renders a 1-5 slider for a 'proficiencySlider' question type.
 * BATCH 4 UPDATE (visual only): refined number markers and label
 * treatment. Value/onChange behavior unchanged.
 */

const LABELS = {
  1: 'No experience',
  2: 'Basics',
  3: 'Comfortable',
  4: 'Proficient',
  5: 'Expert',
};

export default function ProficiencySliderAnswer({ value, onChange }) {
  const current = value || 3;

  return (
    <div className="flex flex-col gap-4 px-1">
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
      <div className="flex justify-between text-xs text-text-tertiary">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n === current ? 'font-semibold text-brand transition-colors duration-150' : 'transition-colors duration-150'}
          >
            {n}
          </span>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-text-primary">{LABELS[current]}</p>
    </div>
  );
}