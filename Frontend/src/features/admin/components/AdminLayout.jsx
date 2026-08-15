/**
 * AdminLayout.jsx
 * -----------------------------------------
 * Admin-specific shell per approved UX spec (B.23): distinct nav
 * (Overview, Users, Content, Question Bank, Reviews, Audit Logs, AI
 * Reliability, Feature Flags) rendered as tabs within the standard
 * DashboardLayout content area — denser, more utilitarian register
 * than the student-facing product, while sharing the same design
 * tokens.
 */

import { classNames } from '../../../utils';

const SECTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'users', label: 'Users' },
  { value: 'content', label: 'Content' },
  { value: 'questions', label: 'Question Bank' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'auditLogs', label: 'Audit Logs' },
  { value: 'aiReliability', label: 'AI Reliability' },
  { value: 'featureFlags', label: 'Feature Flags' },
];

export default function AdminLayout({ activeSection, onChange, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="mt-1 text-text-secondary">Platform management and observability.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border-subtle">
        {SECTIONS.map((section) => (
          <button
            key={section.value}
            onClick={() => onChange(section.value)}
            className={classNames(
              'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-expo duration-150',
              activeSection === section.value
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {children}
    </div>
  );
}