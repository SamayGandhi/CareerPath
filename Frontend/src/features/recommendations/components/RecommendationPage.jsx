/**
 * RecommendationPage.jsx
 * -----------------------------------------
 * Full Recommendation Result page.
 * BATCH 4 UPDATE (visual only): refined summary banner with subtle
 * gradient, staggered course-card entrance. ALL logic (generation,
 * AI explanation regeneration, the "no purchase required" copy from
 * the Roadmap-feasibility follow-up) is byte-identical.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import AiEnhancedBadge from '../../../components/ui/atoms/AiEnhancedBadge';
import RecommendationCard from './RecommendationCard';
import { recommendationsApi } from '../recommendations.api';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../routes/routeConfig';

const STRATEGY_LABELS = {
  schoolStudentStrategy: 'School Student',
  collegeStudentStrategy: 'College Student',
  fresherStrategy: 'Fresher',
  workingProfessionalStrategy: 'Working Professional',
  careerSwitcherStrategy: 'Career Switcher',
  selfLearnerStrategy: 'Self Learner',
};

export default function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regeneratingExplanation, setRegeneratingExplanation] = useState(false);
  const [noneYet, setNoneYet] = useState(false);

  const skillGapReportId = location.state?.skillGapReportId;

  useEffect(() => {
    loadLatest();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadLatest() {
    setLoading(true);
    try {
      const { data } = await recommendationsApi.getLatest();
      setRecommendation(data.recommendation);
    } catch {
      setNoneYet(true);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async () => {
    if (!skillGapReportId) {
      showToast('Please run a skill gap analysis first.', 'error');
      navigate(ROUTES.SKILL_GAP);
      return;
    }

    setGenerating(true);
    try {
      const { data } = await recommendationsApi.generate(skillGapReportId);
      setRecommendation(data.recommendation);
      setNoneYet(false);
      showToast('Recommendations generated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateExplanation = async () => {
    setRegeneratingExplanation(true);
    try {
      const { data } = await recommendationsApi.regenerateExplanation(recommendation._id);
      setRecommendation(data.recommendation);
      showToast('AI explanation updated.', 'success');
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setRegeneratingExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (noneYet && !recommendation) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Recommendations</h1>
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Generate personalized course recommendations based on your latest skill gap analysis."
          actionLabel={generating ? 'Generating...' : 'Generate Recommendations'}
          onAction={handleGenerate}
        />
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="flex flex-col gap-6">
      <Card className="animate-fade-in-up flex items-center justify-between border-brand/20 bg-gradient-to-br from-brand-subtle to-surface">
        <div>
          <Badge variant="brand">
            {STRATEGY_LABELS[recommendation.strategyUsed] || recommendation.strategyUsed}
          </Badge>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
            Your Personalized Recommendations
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {recommendation.recommendedCourses.length} courses matched to your profile and skill
            gaps, ranked by fit.
          </p>
        </div>
        {skillGapReportId && (
          <Button variant="secondary" size="sm" onClick={handleGenerate} isLoading={generating}>
            Regenerate
          </Button>
        )}
      </Card>

      {recommendation.aiEnhancementStatus === 'success' && recommendation.aiEnhancedExplanation ? (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <AiEnhancedBadge />
            <button
              onClick={handleRegenerateExplanation}
              disabled={regeneratingExplanation}
              className="flex items-center gap-1 text-xs text-text-tertiary transition-colors duration-150 hover:text-brand disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
          </div>
          <p className="text-sm leading-relaxed text-text-primary">{recommendation.aiEnhancedExplanation}</p>
        </Card>
      ) : (
        <button
          onClick={handleRegenerateExplanation}
          disabled={regeneratingExplanation}
          className="flex w-fit items-center gap-1.5 text-xs text-text-tertiary transition-colors duration-150 hover:text-brand disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {regeneratingExplanation ? 'Generating AI summary...' : 'Try generating an AI summary'}
        </button>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {recommendation.recommendedCourses.map((rc, i) => (
            <div
              key={rc.courseId?._id || rc.courseId}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <RecommendationCard recommendedCourse={rc} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {recommendation.recommendedPlatforms?.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Recommended Platforms</h3>
              <div className="flex flex-col gap-3">
                {recommendation.recommendedPlatforms.map((rp) => (
                  <div key={rp.platformId?._id || rp.platformId} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {rp.platformId?.name || 'Platform'}
                    </span>
                    <Badge variant="brand">{rp.score}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="flex flex-col gap-3 border-brand/20 bg-brand-subtle">
            <h3 className="font-semibold text-text-primary">Ready to plan your path?</h3>
            <p className="text-sm text-text-secondary">
              Build a sequenced, staged learning roadmap from these recommendations right now — no
              purchase or enrollment required to preview and start planning.
            </p>
            <Link to={ROUTES.ROADMAP} state={{ recommendationId: recommendation._id }}>
              <Button fullWidth>
                Build My Roadmap <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}