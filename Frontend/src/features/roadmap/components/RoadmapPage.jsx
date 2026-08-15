/**
 * RoadmapPage.jsx
 * -----------------------------------------
 * Full Learning Roadmap page.
 * BATCH 4 UPDATE (visual only): refined header card layout. ALL logic
 * is byte-identical to the confirmed-fixed version: recommendationId
 * resolution (loadActive/resolveLatestRecommendation), generation,
 * stage-status updates, abandon flow, and the "no purchase required"
 * empty-state copy.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route as RouteIcon, RefreshCw, XCircle, Target } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import Spinner from '../../../components/ui/atoms/Spinner';
import ProgressBar from '../../../components/ui/atoms/ProgressBar';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import RoadmapTimeline from './RoadmapTimeline';
import { roadmapApi } from '../roadmap.api';
import { progressApi } from '../../progress-tracker/progress.api';
import { recommendationsApi } from '../../recommendations/recommendations.api';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../routes/routeConfig';

export default function RoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [roadmap, setRoadmap] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [noneYet, setNoneYet] = useState(false);
  const [updatingStageId, setUpdatingStageId] = useState(null);
  const [resolvingRecommendation, setResolvingRecommendation] = useState(false);

  const [availableRecommendationId, setAvailableRecommendationId] = useState(
    location.state?.recommendationId || null
  );

  useEffect(() => {
    loadActive();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadActive() {
    setLoading(true);
    try {
      const { data } = await roadmapApi.getActive();
      setRoadmap(data.roadmap);
      loadProgress(data.roadmap._id);
    } catch {
      setNoneYet(true);
      if (!location.state?.recommendationId) {
        await resolveLatestRecommendation();
      }
    } finally {
      setLoading(false);
    }
  }

  async function resolveLatestRecommendation() {
    setResolvingRecommendation(true);
    try {
      const { data } = await recommendationsApi.getLatest();
      setAvailableRecommendationId(data.recommendation._id);
    } catch {
      setAvailableRecommendationId(null);
    } finally {
      setResolvingRecommendation(false);
    }
  }

  async function loadProgress(roadmapId) {
    try {
      const { data } = await progressApi.getRoadmapSummary(roadmapId);
      setProgressSummary(data);
    } catch {
      // Non-fatal — progress summary is supplementary
    }
  }

  const handleGenerate = async (force = false) => {
    if (!availableRecommendationId) {
      showToast('Please generate recommendations first.', 'error');
      navigate(ROUTES.RECOMMENDATIONS);
      return;
    }
    setGenerating(true);
    try {
      const { data } = await roadmapApi.generate(availableRecommendationId, force);
      setRoadmap(data.roadmap);
      setNoneYet(false);
      showToast('Roadmap generated successfully!', 'success');
      loadProgress(data.roadmap._id);
    } catch (err) {
      if (err.errorCode === 'ACTIVE_ROADMAP_EXISTS') {
        showToast('You already have an active roadmap.', 'error');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (stageId, newStatus) => {
    setUpdatingStageId(stageId);
    try {
      const { data } = await roadmapApi.updateStageStatus(roadmap._id, stageId, newStatus);
      setRoadmap(data.roadmap);
      loadProgress(data.roadmap._id);
      if (newStatus === 'completed') {
        showToast('Stage completed! 🎉', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingStageId(null);
    }
  };

  const handleAbandon = async () => {
    if (!window.confirm('Are you sure you want to abandon this roadmap?')) return;
    try {
      await roadmapApi.abandon(roadmap._id);
      setRoadmap(null);
      setNoneYet(true);
      showToast('Roadmap abandoned.', 'info');
      await resolveLatestRecommendation();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading || resolvingRecommendation) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (noneYet && !roadmap) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Learning Roadmap</h1>

        {availableRecommendationId ? (
          <EmptyState
            icon={RouteIcon}
            title="No active roadmap yet"
            description="You already have course recommendations ready. Generate a sequenced, staged roadmap from them right now — you can preview and start planning immediately, with no purchase or enrollment required."
            actionLabel={generating ? 'Generating...' : 'Generate Roadmap'}
            onAction={() => handleGenerate(false)}
          />
        ) : (
          <EmptyState
            icon={Target}
            title="Let's get you there step by step"
            description="A roadmap is built from your personalized course recommendations. Run a skill gap analysis and generate recommendations first — free, no purchase needed — then come back here to build your roadmap."
            actionLabel="Go to Recommendations"
            onAction={() => navigate(ROUTES.RECOMMENDATIONS)}
          />
        )}
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card className="animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">{roadmap.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Est. {roadmap.estimatedTotalDurationWeeks} weeks total
            </p>
          </div>
          <Badge variant={roadmap.status === 'completed' ? 'success' : 'brand'}>{roadmap.status}</Badge>
        </div>
        {progressSummary && (
          <ProgressBar
            value={progressSummary.overallPercentage}
            variant={roadmap.status === 'completed' ? 'success' : 'brand'}
            className="mt-4"
            showLabel
          />
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleGenerate(true)} isLoading={generating}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAbandon}>
            <XCircle className="h-4 w-4" /> Abandon
          </Button>
        </div>
      </Card>

      <RoadmapTimeline
        stages={roadmap.stages}
        currentStageIndex={roadmap.currentStageIndex}
        onStatusChange={handleStatusChange}
        updatingStageId={updatingStageId}
      />
    </div>
  );
}