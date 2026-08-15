/**
 * MockTestSetup.jsx — BATCH 5 (visual only)
 * Adopts Select for the career-path dropdown; refined suggested-
 * difficulty banner and pill-button styling. ALL readiness-score
 * fetching and suggestion logic (Batch 5.3) is byte-identical.
 */

import { useEffect, useState } from 'react';
import { PlayCircle, TrendingUp } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Select from '../../../components/ui/atoms/Select';
import Button from '../../../components/ui/atoms/Button';
import { careerPathApi } from '../../career-explorer/careerPath.api';
import { interviewPrepApi } from '../interviewPrep.api';
import { classNames } from '../../../utils';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_COUNTS = [5, 10, 15, 20];

function getSuggestedDifficulty(readinessScore) {
  if (readinessScore === null || readinessScore === undefined) return null;
  if (readinessScore < 40) return 'easy';
  if (readinessScore < 75) return 'medium';
  return 'hard';
}

export default function MockTestSetup({ onStart, starting }) {
  const [careerPaths, setCareerPaths] = useState([]);
  const [careerPathId, setCareerPathId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [readinessScore, setReadinessScore] = useState(null);
  const [readinessAttemptCount, setReadinessAttemptCount] = useState(0);

  useEffect(() => {
    careerPathApi
      .list({ limit: 50 })
      .then(({ data }) => setCareerPaths(data.careerPaths))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!careerPathId) {
      setReadinessScore(null);
      return;
    }
    interviewPrepApi
      .getReadinessScore(careerPathId)
      .then(({ data }) => {
        setReadinessScore(data.readinessScore);
        setReadinessAttemptCount(data.basedOnAttemptCount);
      })
      .catch(() => setReadinessScore(null));
  }, [careerPathId]);

  const suggestedDifficulty = getSuggestedDifficulty(readinessScore);

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-subtle">
          <PlayCircle className="h-4 w-4 text-brand" />
        </div>
        <h2 className="font-semibold text-text-primary">Set Up Your Mock Test</h2>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Career path (optional)
        </label>
        <Select value={careerPathId} onChange={(e) => setCareerPathId(e.target.value)}>
          <option value="">Any career path</option>
          {careerPaths.map((cp) => (
            <option key={cp._id} value={cp._id}>
              {cp.title}
            </option>
          ))}
        </Select>
      </div>

      {careerPathId && suggestedDifficulty && (
        <div className="animate-fade-in-up flex items-start gap-2 rounded-md border border-brand/20 bg-brand-subtle px-3 py-2.5 text-xs text-brand">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Based on your last {readinessAttemptCount} attempt{readinessAttemptCount === 1 ? '' : 's'}{' '}
            (readiness score {readinessScore}/100), we&apos;d suggest starting with{' '}
            <span className="font-medium capitalize">{suggestedDifficulty}</span> difficulty — but
            you&apos;re welcome to pick any level.
          </span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Difficulty</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d === difficulty ? '' : d)}
              className={classNames(
                'rounded-md border px-3 py-1.5 text-sm capitalize transition-all duration-150',
                d === difficulty
                  ? 'border-brand bg-brand-subtle text-brand'
                  : d === suggestedDifficulty
                    ? 'border-brand/40 text-text-secondary hover:border-brand/60'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong'
              )}
            >
              {d}
              {d === suggestedDifficulty && d !== difficulty && (
                <span className="ml-1 text-[10px] text-brand">•suggested</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Number of questions</label>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={classNames(
                'rounded-md border px-3 py-1.5 text-sm transition-all duration-150',
                n === questionCount
                  ? 'border-brand bg-brand-subtle text-brand'
                  : 'border-border-subtle text-text-secondary hover:border-border-strong'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() =>
          onStart({ careerPathId: careerPathId || undefined, difficulty: difficulty || undefined, questionCount })
        }
        isLoading={starting}
        fullWidth
      >
        Start Mock Test
      </Button>
    </Card>
  );
}