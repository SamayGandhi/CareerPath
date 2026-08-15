/**
 * DetectedSectionsChecklist.jsx — BATCH 5 (visual only)
 * Refined pass/fail icon treatment matching RepoQualityChecklist.
 * Data shape unchanged.
 */

import { CheckCircle2, XCircle } from 'lucide-react';

const SECTION_LABELS = {
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  contact: 'Contact',
};

export default function DetectedSectionsChecklist({ detectedSections }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(SECTION_LABELS).map(([key, label]) => {
        const present = detectedSections?.[key];
        return (
          <div key={key} className="flex items-center gap-2">
            {present ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              </div>
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-secondary">
                <XCircle className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
            )}
            <span className="text-sm text-text-primary">{label}</span>
          </div>
        );
      })}
    </div>
  );
}