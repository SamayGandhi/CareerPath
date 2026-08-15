/**
 * AppRouter.jsx
 * -----------------------------------------
 * Top-level route tree.
 * UPDATED (Batch 4 — Navigation Consistency Fix): Career Explorer,
 * Career Path Detail, Course Explorer, Course Comparison, Course
 * Detail, and Platform Comparison now render through AdaptiveLayout
 * instead of being hardcoded under MainLayout. This means logged-in
 * users keep their Sidebar/Navbar while browsing these pages (they
 * previously lost it entirely), while guests see the exact same public
 * shell and public access as before. No route paths changed, no
 * guards changed, no access rules changed.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdaptiveLayout from '../components/layout/AdaptiveLayout';
import PrivateRoute from '../routes/PrivateRoute';
import RoleBasedRoute from '../routes/RoleBasedRoute';

import LandingPage from '../pages/LandingPage';
import NotFoundPage from '../pages/NotFoundPage';

import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm';

import OnboardingFlow from '../features/onboarding/components/OnboardingFlow';
import DashboardHome from '../features/dashboard/components/DashboardHome';
import SkillAssessmentPage from '../features/skill-assessment/components/SkillAssessmentPage';
import CareerExplorerPage from '../features/career-explorer/components/CareerExplorerPage';
import CareerPathDetailPage from '../features/career-explorer/components/CareerPathDetailPage';
import SkillGapPage from '../features/skill-gap/components/SkillGapPage';
import RecommendationPage from '../features/recommendations/components/RecommendationPage';
import RoadmapPage from '../features/roadmap/components/RoadmapPage';
import CourseExplorerPage from '../features/course-catalog/components/CourseExplorerPage';
import CourseDetailPage from '../features/course-catalog/components/CourseDetailPage';
import CourseComparisonPage from '../features/course-catalog/components/CourseComparisonPage';
import PlatformComparisonPage from '../features/course-catalog/components/PlatformComparisonPage';
import ResumeAnalyzerPage from '../features/resume-analyzer/components/ResumeAnalyzerPage';
import GithubAnalyzerPage from '../features/github-analyzer/components/GithubAnalyzerPage';
import PortfolioAnalyzerPage from '../features/portfolio-analyzer/components/PortfolioAnalyzerPage';
import InterviewPrepPage from '../features/interview-prep/components/InterviewPrepPage';
import ProfilePage from '../features/profile/components/ProfilePage';
import SettingsPage from '../features/settings/components/SettingsPage';
import NotificationsPage from '../features/notifications/components/NotificationsPage';
import AdminDashboardPage from '../features/admin/components/AdminDashboardPage';

import { ROUTES } from '../routes/routeConfig';
import { ROLES } from '../constants';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public marketing — landing page only. Kept exclusively under
          MainLayout since its full-bleed section design is specific
          to this one page. */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
      </Route>

      {/* Public + authenticated hybrid pages: guests get the public
          shell, logged-in users get the full app shell (Sidebar +
          Navbar). Access is identical either way — only the
          surrounding chrome adapts. */}
      <Route element={<AdaptiveLayout />}>
        <Route path={ROUTES.CAREER_EXPLORER} element={<CareerExplorerPage />} />
        <Route path={ROUTES.CAREER_DETAIL} element={<CareerPathDetailPage />} />
        <Route path={ROUTES.COURSE_EXPLORER} element={<CourseExplorerPage />} />
        <Route path={ROUTES.COURSE_COMPARISON} element={<CourseComparisonPage />} />
        <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
        <Route path={ROUTES.PLATFORM_COMPARISON} element={<PlatformComparisonPage />} />
      </Route>

      {/* Public auth */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
        <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordForm />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordForm />} />
      </Route>

      {/* Private: full-screen onboarding (no sidebar/nav) */}
      <Route element={<PrivateRoute />}>
        <Route path={ROUTES.ONBOARDING} element={<OnboardingFlow />} />
      </Route>

      {/* Private: main app shell */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
          <Route path={ROUTES.SKILL_ASSESSMENT} element={<SkillAssessmentPage />} />
          <Route path={ROUTES.SKILL_GAP} element={<SkillGapPage />} />
          <Route path={ROUTES.RECOMMENDATIONS} element={<RecommendationPage />} />
          <Route path={ROUTES.ROADMAP} element={<RoadmapPage />} />
          <Route path={ROUTES.RESUME_ANALYZER} element={<ResumeAnalyzerPage />} />
          <Route path={ROUTES.GITHUB_ANALYZER} element={<GithubAnalyzerPage />} />
          <Route path={ROUTES.PORTFOLIO_ANALYZER} element={<PortfolioAnalyzerPage />} />
          <Route path={ROUTES.INTERVIEW_PREP} element={<InterviewPrepPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}