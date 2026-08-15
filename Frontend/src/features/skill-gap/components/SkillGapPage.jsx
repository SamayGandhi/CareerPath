/**
 * SkillGapPage.jsx
 * -----------------------------------------
 * Full Skill Gap Analysis page.
 * BATCH 4 UPDATE (visual only): refined grid/card layout, staggered
 * gap-list entrance. ALL logic is byte-identical, including the
 * Batch 5.2 staleness detection (isStale, skillsVersion comparison)
 * and the padded-wrapper layout from Batch 4's routing fix.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Target, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import AiEnhancedBadge from '../../../components/ui/atoms/AiEnhancedBadge';
import ReadinessScoreGauge from './ReadinessScoreGauge';
import SkillGapRadarChart from './SkillGapRadarChart';
import GapListItem from './GapListItem';
import { skillGapApi } from '../skillGap.api';
import { profileApi } from '../../profile/profile.api';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../routes/routeConfig';

export default function SkillGapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [noReportYet, setNoReportYet] = useState(false);

  const passedCareerPathId = location.state?.targetCareerPathId;

  useEffect(() => {
    loadInitial();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadInitial() {
    setLoading(true);
    try {
      const { data: profileData } = await profileApi.getMyProfile();
      setProfile(profileData.profile);

      const targetId = passedCareerPathId || profileData.profile.targetCareerPathId?._id;
      if (!targetId) {
        setNoReportYet(true);
        return;
      }

      try {
        const { data } = await skillGapApi.getLatest(targetId);
        setReport(data.skillGapReport);
      } catch {
        setNoReportYet(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleAnalyze = async () => {
    const targetId = passedCareerPathId || profile?.targetCareerPathId?._id;
    if (!targetId) {
      showToast('Please set a target career path first.', 'error');
      navigate(ROUTES.CAREER_EXPLORER);
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await skillGapApi.analyze(targetId);
      setReport(data.skillGapReport);
      setNoReportYet(false);

      const { data: refreshedProfile } = await profileApi.getMyProfile();
      setProfile(refreshedProfile.profile);

      showToast('Skill gap analysis complete!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (!profile?.targetCareerPathId && !passedCareerPathId) {
    return (
      <EmptyState
        icon={Target}
        title="Set a career goal first"
        description="Choose a target career path so we can compare it against your current skills."
        actionLabel="Explore Career Paths"
        onAction={() => navigate(ROUTES.CAREER_EXPLORER)}
      />
    );
  }

  if (noReportYet && !report) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Skill Gap Analysis</h1>
        <EmptyState
          icon={Target}
          title="No analysis yet"
          description="Run your first skill gap analysis to see exactly what stands between you and your goal."
          actionLabel={analyzing ? 'Analyzing...' : 'Run Skill Gap Analysis'}
          onAction={handleAnalyze}
        />
      </div>
    );
  }

  if (!report) return null;

  const isStale =
    profile?.skillsVersion !== undefined &&
    report?.profileSnapshotVersion !== undefined &&
    profile.skillsVersion !== report.profileSnapshotVersion;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Skill Gap Analysis</h1>
          <p className="mt-1 text-text-secondary">
            For: {report.targetCareerPathId?.title || 'Your target role'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleAnalyze} isLoading={analyzing}>
          <RefreshCw className="h-4 w-4" /> Re-run Analysis
        </Button>
      </div>

      {isStale && (
        <Card className="flex items-center justify-between gap-4 border-warning/30 bg-warning/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                Your skills have changed since this analysis
              </p>
              <p className="text-xs text-text-secondary">
                The score and gaps below reflect an earlier snapshot of your profile. Re-run the
                analysis to get an up-to-date readiness score.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleAnalyze} isLoading={analyzing}>
            Re-run Now
          </Button>
        </Card>
      )}

      {report.aiEnhancementStatus === 'success' && report.aiEnhancedExplanation && (
        <Card className="flex flex-col gap-2">
          <AiEnhancedBadge />
          <p className="text-sm leading-relaxed text-text-primary">{report.aiEnhancedExplanation}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex items-center justify-center lg:col-span-1">
          <ReadinessScoreGauge score={report.overallReadinessScore} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">Current vs. Required</h2>
          <SkillGapRadarChart gaps={report.gaps} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Skill Gaps</h2>
        <div className="flex flex-col gap-2">
          {report.gaps.map((gap, i) => (
            <div
              key={gap.skillId?._id || gap.skillId}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <GapListItem gap={gap} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">Ready for the next step?</h3>
          <p className="text-sm text-text-secondary">
            Get personalized course recommendations that close your biggest gaps first.
          </p>
        </div>
        <Link to={ROUTES.RECOMMENDATIONS} state={{ skillGapReportId: report._id }}>
          <Button>
            Generate Recommendations <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}