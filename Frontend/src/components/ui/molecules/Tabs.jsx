/**
 * Tabs.jsx
 * -----------------------------------------
 * Simple, controlled tabs component.
 * BATCH 1 UPDATE (visual only): refined inactive-tab hover treatment
 * and smoother active-state color/border transition. Props/API
 * unchanged: tabs, activeTab, onChange.
 */

import { classNames } from '../../../utils';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 border-b border-border-subtle">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={classNames(
            'flex items-center gap-1.5 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium',
            'transition-all duration-150 ease-out',
            activeTab === tab.value
              ? 'border-brand text-brand'
              : 'border-transparent text-text-secondary hover:bg-surface-secondary/60 hover:text-text-primary'
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}