/**
 * QuestionFlashcard.jsx — BATCH 5 (visual only)
 * Refined difficulty/type badge row and reveal transition. Reveal
 * toggle state/behavior unchanged.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import { classNames } from '../../../utils';

const DIFFICULTY_VARIANT = { easy: 'success', medium: 'warning', hard: 'danger' };

export default function QuestionFlashcard({ question }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant={DIFFICULTY_VARIANT[question.difficultyLevel]}>{question.difficultyLevel}</Badge>
        <Badge variant="neutral">{question.questionType}</Badge>
      </div>

      <h3 className="font-medium leading-snug text-text-primary">{question.questionText}</h3>

      {question.questionType === 'mcq' && question.options && (
        <div className="flex flex-col gap-1.5">
          {question.options.map((opt) => (
            <div
              key={opt}
              className="rounded-md border border-border-subtle px-3 py-2 text-sm text-text-secondary"
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setRevealed((r) => !r)}
        className="flex items-center gap-1 self-start text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
      >
        {revealed ? 'Hide' : 'Show'} thinking prompt
        <ChevronDown className={classNames('h-4 w-4 transition-transform duration-200', revealed && 'rotate-180')} />
      </button>

      {revealed && (
        <p className="animate-fade-in-up rounded-md bg-brand-subtle p-3 text-sm text-text-primary">
          Take a moment to answer this yourself before checking any reference material — active
          recall is the point of practice mode.
        </p>
      )}
    </Card>
  );
}