/**
 * constants/index.js
 * -----------------------------------------
 * Frontend-side mirror of backend enums, kept consistent with the
 * approved database/API design.
 * UPDATED: GAP_SEVERITY_COLORS now references the --raw-* CSS variable
 * namespace (tokens.css), matching the Tailwind v4 compatibility fix —
 * these are consumed as literal color strings (e.g. by Recharts), not
 * as Tailwind classes.
 */

export const USER_TYPES = {
  SCHOOL_STUDENT: 'schoolStudent',
  COLLEGE_STUDENT: 'collegeStudent',
  FRESHER: 'fresher',
  WORKING_PROFESSIONAL: 'workingProfessional',
  CAREER_SWITCHER: 'careerSwitcher',
  SELF_LEARNER: 'selfLearner',
};

export const USER_TYPE_LABELS = {
  schoolStudent: 'School Student',
  collegeStudent: 'College Student',
  fresher: 'Fresher',
  workingProfessional: 'Working Professional',
  careerSwitcher: 'Career Switcher',
  selfLearner: 'Self Learner',
};

export const EDUCATION_LEVELS = ['school', 'undergraduate', 'postgraduate', 'graduated', 'none'];

export const LEARNING_STYLES = ['video', 'text', 'project-based', 'mixed'];

export const BUDGET_PREFERENCES = ['free', 'low', 'medium', 'premium', 'noConstraint'];

export const GAP_SEVERITY_COLORS = {
  critical: 'var(--raw-danger)',
  moderate: 'var(--raw-warning)',
  minor: 'var(--raw-info)',
  none: 'var(--raw-success)',
};

export const ROLES = {
  STUDENT: 'student',
  CONTENT_MANAGER: 'contentManager',
  ADMIN: 'admin',
};

export const COOKIE_NAME_REFRESH_TOKEN = 'refreshToken';