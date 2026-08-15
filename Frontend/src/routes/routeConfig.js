/**
 * routeConfig.js
 * -----------------------------------------
 * Central path constants, avoiding magic strings scattered across
 * Link/navigate() calls throughout the app.
 */

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  SKILL_ASSESSMENT: '/assessment',
  CAREER_EXPLORER: '/careers',
  CAREER_DETAIL: '/careers/:slug',
  SKILL_GAP: '/skill-gap',
  RECOMMENDATIONS: '/recommendations',
  ROADMAP: '/roadmap',
  COURSE_EXPLORER: '/courses',
  COURSE_DETAIL: '/courses/:slug',
  COURSE_COMPARISON: '/courses/compare',
  PLATFORM_COMPARISON: '/platforms/compare',
  RESUME_ANALYZER: '/tools/resume-analyzer',
  GITHUB_ANALYZER: '/tools/github-analyzer',
  PORTFOLIO_ANALYZER: '/tools/portfolio-analyzer',
  INTERVIEW_PREP: '/interview-prep',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
};