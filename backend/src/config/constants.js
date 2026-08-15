/**
 * constants.js
 * -----------------------------------------
 * Application-wide constants: enums, limits, and fixed values shared
 * across modules. Centralizing these avoids magic strings scattered
 * throughout the codebase and keeps enum values consistent between
 * Mongoose schemas, validation schemas, and API responses.
 */

const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  CONTENT_MANAGER: 'contentManager',
  ADMIN: 'admin',
});

const USER_TYPES = Object.freeze({
  SCHOOL_STUDENT: 'schoolStudent',
  COLLEGE_STUDENT: 'collegeStudent',
  FRESHER: 'fresher',
  WORKING_PROFESSIONAL: 'workingProfessional',
  CAREER_SWITCHER: 'careerSwitcher',
  SELF_LEARNER: 'selfLearner',
});

const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
});

const AUTH_PROVIDERS = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
  GITHUB: 'github',
});

const PAGINATION_DEFAULTS = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

const COOKIE_NAMES = Object.freeze({
  REFRESH_TOKEN: 'refreshToken',
});

module.exports = {
  USER_ROLES,
  USER_TYPES,
  ACCOUNT_STATUS,
  AUTH_PROVIDERS,
  PAGINATION_DEFAULTS,
  COOKIE_NAMES,
};