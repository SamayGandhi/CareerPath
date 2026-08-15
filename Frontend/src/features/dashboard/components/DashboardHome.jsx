/**
 * DashboardHome.jsx
 * -----------------------------------------
 * Composed home screen per approved UX spec (B.7).
 * BATCH 3 UPDATE (visual only): refined stat/icon presentation with
 * colored icon containers, staggered card entrance, better visual
 * hierarchy on the readiness-score number, and softer section
 * spacing. ALL data fetching (dashboardApi.getSummary), the
 * localStorage-based recent-career-paths read, every conditional
 * render branch, and every Link destination are UNCHANGED from Batch
 * 5.5.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Route as RouteIcon,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Bell,
  MessagesSquare,
  Compass,
} from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import ProgressBar from '../../../components/ui/atoms/ProgressBar';
import Spinner from '../../../components/ui/atoms/Spinner';
import { dashboardApi } from '../dashboard.api';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../routes/routeConfig';
import { formatRelativeTime, formatDate } from '../../../utils';
import { getRecentCareerPaths } from '../../career-explorer/recentCareerPaths';

const SEVERITY_VARIANT = { critical: 'danger', moderate: 'warning', minor: 'info' };

export default function DashboardHome() {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentCareerPaths, setRecentCareerPaths] = useState([]);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    setRecentCareerPaths(getRecentCareerPaths());
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center text-danger">
        Could not load your dashboard: {error}
      </Card>
    );
  }

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Good to see you, {firstName}
        </h1>
        <p className="mt-1 text-text-secondary">Here&apos;s where things stand today.</p>
      </div>

      {summary.profileCompletion < 100 && (
        <Card className="flex items-center justify-between gap-4 border-brand/30 bg-brand-subtle">
          <div>
            <p className="text-sm font-medium text-brand">
              Your profile is {summary.profileCompletion}% complete
            </p>
            <ProgressBar value={summary.profileCompletion} variant="brand" className="mt-2 max-w-xs" />
          </div>
          <Link to={ROUTES.PROFILE}>
            <Button size="sm" variant="secondary">
              Complete Profile
            </Button>
          </Link>
        </Card>
      )}

      {!summary.activeRoadmap ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent shadow-sm">
            <RouteIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Let&apos;s build your first roadmap
          </h2>
          <p className="max-w-md text-sm text-text-secondary">
            Take a skill assessment, then generate a personalized recommendation and roadmap
            tailored to your goals.
          </p>
          <Link to={ROUTES.SKILL_ASSESSMENT}>
            <Button size="lg">
              Start Skill Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                {summary.activeRoadmap.title}
              </h3>
              <Badge variant="brand">{summary.activeRoadmap.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Stage {summary.activeRoadmap.currentStageIndex + 1} of{' '}
              {summary.activeRoadmap.totalStages} · Est.{' '}
              {summary.activeRoadmap.estimatedTotalDurationWeeks} weeks total
            </p>
            {summary.roadmapProgressSummary && (
              <ProgressBar
                value={summary.roadmapProgressSummary.overallPercentage}
                variant="success"
                className="mt-4"
                showLabel
              />
            )}
            <Link to={ROUTES.ROADMAP}>
              <Button variant="secondary" size="sm" className="mt-4">
                Continue Learning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-subtle">
                <Target className="h-4 w-4 text-brand" />
              </div>
              <span className="text-sm font-medium">Readiness Score</span>
            </div>
            <p className="text-4xl font-bold tracking-tight text-text-primary">
              {summary.latestReadinessScore ?? '—'}
              <span className="text-base font-normal text-text-tertiary">/100</span>
            </p>
            {summary.topSkillGaps?.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {summary.topSkillGaps.map((gap) => (
                  <div key={gap.skillId?._id || gap.skillId} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {gap.skillId?.skillName || 'Skill'}
                    </span>
                    <Badge variant={SEVERITY_VARIANT[gap.gapSeverity] || 'neutral'}>
                      {gap.gapSeverity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="ghost" size="sm" className="mt-3">
                View Full Analysis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {(summary.latestAssessment || summary.interviewReadiness?.readinessScore != null) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {summary.latestAssessment && (
            <Card>
              <div className="mb-2 flex items-center gap-2 text-text-secondary">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-subtle">
                  <ClipboardList className="h-4 w-4 text-brand" />
                </div>
                <span className="text-sm font-medium">Latest Assessment</span>
              </div>
              <p className="text-sm text-text-primary">
                Completed {formatDate(summary.latestAssessment.completedAt)} — updated{' '}
                {summary.latestAssessment.skillsUpdatedCount} skill
                {summary.latestAssessment.skillsUpdatedCount === 1 ? '' : 's'}.
              </p>
              <Link to={ROUTES.SKILL_ASSESSMENT}>
                <Button variant="ghost" size="sm" className="mt-3">
                  Retake Assessment <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}

          {summary.interviewReadiness?.readinessScore != null && (
            <Card>
              <div className="mb-2 flex items-center gap-2 text-text-secondary">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-subtle">
                  <MessagesSquare className="h-4 w-4 text-brand" />
                </div>
                <span className="text-sm font-medium">Interview Readiness</span>
              </div>
              <p className="text-4xl font-bold tracking-tight text-text-primary">
                {summary.interviewReadiness.readinessScore}
                <span className="text-base font-normal text-text-tertiary">/100</span>
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Based on {summary.interviewReadiness.basedOnAttemptCount} recent attempt
                {summary.interviewReadiness.basedOnAttemptCount === 1 ? '' : 's'}
              </p>
              <Link to={ROUTES.INTERVIEW_PREP}>
                <Button variant="ghost" size="sm" className="mt-3">
                  Practice More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to={ROUTES.SKILL_ASSESSMENT}>
          <Card interactive className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle">
              <ClipboardList className="h-4 w-4 text-brand" />
            </div>
            <span className="text-sm font-medium text-text-primary">Retake Assessment</span>
          </Card>
        </Link>
        <Link to={ROUTES.RESUME_ANALYZER}>
          <Card interactive className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <span className="text-sm font-medium text-text-primary">Analyze Resume</span>
          </Card>
        </Link>
        <Link to={ROUTES.CAREER_EXPLORER}>
          <Card interactive className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle">
              <RouteIcon className="h-4 w-4 text-brand" />
            </div>
            <span className="text-sm font-medium text-text-primary">Explore Careers</span>
          </Card>
        </Link>
      </div>

      {recentCareerPaths.length > 0 && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Compass className="h-4 w-4 text-brand" /> Recently Viewed Career Paths
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentCareerPaths.map((cp) => (
              <Link
                key={cp._id}
                to={ROUTES.CAREER_DETAIL.replace(':slug', cp.slug)}
                className="rounded-full border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-all duration-150 hover:border-brand/50 hover:bg-brand-subtle hover:text-brand"
              >
                {cp.title}
              </Link>
            ))}
          </div>
        </Card>
      )}

      {summary.recentNotifications?.length > 0 && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Bell className="h-4 w-4 text-brand" /> Recent Activity
          </h3>
          <div className="flex flex-col divide-y divide-border-subtle">
            {summary.recentNotifications.map((n) => (
              <div key={n._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-tertiary">{n.message}</p>
                </div>
                <span className="shrink-0 pl-3 text-xs text-text-tertiary">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}