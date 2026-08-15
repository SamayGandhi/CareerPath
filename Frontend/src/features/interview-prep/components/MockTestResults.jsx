/**
 * MockTestResults.jsx — BATCH 5 (visual only)
 * Refined score-hero and per-question breakdown treatment. ALL
 * honest-ungraded handling (isCorrect: null) unchanged.
 */

import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';

export default function MockTestResults({ result, onDone }) {
  const { score, correctCount, gradableCount, totalQuestions, breakdown, readinessScoreImpact } = result;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card className="animate-fade-in-up flex flex-col items-center gap-3 py-10 text-center">
        <div className="text-5xl font-bold tracking-tight text-text-primary">{score ?? '—'}</div>
        <p className="text-sm text-text-secondary">
          {score !== null
            ? `${correctCount} of ${gradableCount} auto-gradable questions correct (${totalQuestions} total)`
            : 'This test contained no automatically-gradable (MCQ) questions.'}
        </p>
        {readinessScoreImpact !== 0 && score !== null && (
          <Badge variant={readinessScoreImpact > 0 ? 'success' : 'warning'}>
            {readinessScoreImpact > 0 ? '+' : ''}
            {readinessScoreImpact} readiness impact
          </Badge>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        {breakdown.map((item, i) => (
          <Card
            key={item.questionId}
            className="animate-fade-in-up flex gap-3"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            {item.isCorrect === true && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            )}
            {item.isCorrect === false && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/10">
                <XCircle className="h-4 w-4 text-danger" />
              </div>
            )}
            {item.isCorrect === null && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <HelpCircle className="h-4 w-4 text-text-tertiary" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {i + 1}. {item.questionText}
              </p>
              <p className="mt-1 text-xs text-text-secondary">Your answer: {String(item.userAnswer ?? '—')}</p>
              {item.correctAnswer !== null && item.isCorrect === false && (
                <p className="text-xs text-success">Correct answer: {String(item.correctAnswer)}</p>
              )}
              {item.explanation && <p className="mt-1 text-xs text-text-tertiary">{item.explanation}</p>}
              {item.isCorrect === null && (
                <p className="mt-1 text-xs text-text-tertiary">
                  This question type isn&apos;t automatically graded.
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={onDone} fullWidth>
        Done
      </Button>
    </div>
  );
}