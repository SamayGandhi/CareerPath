/**
 * ReadinessScoreTrend.jsx — BATCH 5 (visual only)
 * Refined score-hero card and attempt-history row treatment. ALL
 * parallel readiness/history fetching is byte-identical.
 */

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import { interviewPrepApi } from '../interviewPrep.api';
import { formatDate } from '../../../utils';

export default function ReadinessScoreTrend() {
  const [readiness, setReadiness] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      interviewPrepApi.getReadinessScore(),
      interviewPrepApi.getAttemptHistory({ limit: 10 }),
    ])
      .then(([readinessRes, attemptsRes]) => {
        setReadiness(readinessRes.data);
        setAttempts(attemptsRes.data.attempts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent shadow-sm">
          <Target className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-text-primary">
            {readiness?.readinessScore ?? '—'}
            <span className="text-base font-normal text-text-tertiary">/100</span>
          </p>
          <p className="text-sm text-text-secondary">
            Based on {readiness?.basedOnAttemptCount ?? 0} recent attempt
            {readiness?.basedOnAttemptCount === 1 ? '' : 's'}
          </p>
        </div>
      </Card>

      {attempts.length === 0 ? (
        <EmptyState icon={Target} title="No attempts yet" description="Take a mock test to start tracking your readiness." />
      ) : (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Attempt History</h3>
          <div className="flex flex-col divide-y divide-border-subtle">
            {attempts.map((attempt) => (
              <div key={attempt._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-text-primary">{attempt.careerPathId?.title || 'General'}</p>
                  <p className="text-xs text-text-tertiary">{formatDate(attempt.createdAt)}</p>
                </div>
                <Badge variant={attempt.score >= 70 ? 'success' : attempt.score >= 40 ? 'warning' : 'danger'}>
                  {attempt.score ?? '—'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}