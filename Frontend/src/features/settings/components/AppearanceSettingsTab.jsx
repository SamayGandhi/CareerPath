/**
 * AppearanceSettingsTab.jsx — Visual only. Theme toggle logic
 * unchanged.
 */

import { Sun, Moon } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { classNames } from '../../../utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function AppearanceSettingsTab() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="font-semibold text-text-primary">Theme</h3>
      <div className="flex gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={classNames(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-all duration-150',
              theme === opt.value
                ? 'border-brand bg-brand-subtle text-brand shadow-[0_0_0_1px_var(--color-brand)]'
                : 'border-border-subtle text-text-secondary hover:border-border-strong hover:bg-surface-secondary'
            )}
          >
            <opt.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}