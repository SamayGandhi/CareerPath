/**
 * SettingsPage.jsx — Visual only.
 * ALL tab-switch logic unchanged.
 */

import { useState } from 'react';
import { User, Shield, Palette, AlertTriangle } from 'lucide-react';
import { classNames } from '../../../utils';
import AccountSettingsTab from './AccountSettingsTab';
import SecuritySettingsTab from './SecuritySettingsTab';
import AppearanceSettingsTab from './AppearanceSettingsTab';
import DangerZoneTab from './DangerZoneTab';

const SECTIONS = [
  { value: 'account', label: 'Account', icon: User, Component: AccountSettingsTab },
  { value: 'security', label: 'Security', icon: Shield, Component: SecuritySettingsTab },
  { value: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceSettingsTab },
  { value: 'danger', label: 'Danger Zone', icon: AlertTriangle, Component: DangerZoneTab },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const ActiveComponent = SECTIONS.find((s) => s.value === activeSection)?.Component;

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-text-primary">Settings</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <nav className="flex flex-row gap-1 md:flex-col">
          {SECTIONS.map((section) => (
            <button
              key={section.value}
              onClick={() => setActiveSection(section.value)}
              className={classNames(
                'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-150',
                activeSection === section.value
                  ? 'bg-brand-subtle text-brand'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
                section.value === 'danger' && activeSection !== section.value && 'text-danger'
              )}
            >
              <section.icon className="h-4 w-4" /> {section.label}
            </button>
          ))}
        </nav>

        <div className="animate-fade-in md:col-span-3">{ActiveComponent && <ActiveComponent />}</div>
      </div>
    </div>
  );
}