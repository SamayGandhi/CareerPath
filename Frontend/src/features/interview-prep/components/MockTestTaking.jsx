/**
 * MockTestTaking.jsx — BATCH 5 (visual only)
 * Refined progress-dot and timer treatment. ALL timing tracking,
 * answer recording, and finish logic are byte-identical.
 */

import { useEffect, useState, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import { classNames } from '../../../utils';

export default function MockTestTaking({ questions, onSubmit, onExit, submitting }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const questionStartRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion._id]?.answer;

  const recordAnswer = (value) => {
    const timeTakenSeconds = Math.round((Date.now() - questionStartRef.current) / 1000);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: { answer: value, timeTakenSeconds },
    }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const payload = questions.map((q) => ({
      questionId: q._id,
      userAnswer: answers[q._id]?.answer ?? null,
      timeTakenSeconds: answers[q._id]?.timeTakenSeconds ?? 0,
    }));
    onSubmit(payload);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-sm text-text-tertiary transition-colors duration-150 hover:text-danger"
        >
          <X className="h-4 w-4" /> Exit
        </button>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-secondary px-3 py-1 text-sm font-medium text-text-secondary">
          <Clock className="h-3.5 w-3.5" /> {formatTime(elapsedSeconds)}
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={classNames(
              'h-1.5 w-6 rounded-full transition-colors duration-200',
              i === currentIndex ? 'bg-brand' : i < currentIndex ? 'bg-success' : 'bg-surface-secondary'
            )}
          />
        ))}
      </div>

      <Card key={currentQuestion._id} className="animate-fade-in-up flex flex-col gap-4">
        <Badge variant="neutral">
          Question {currentIndex + 1} of {questions.length}
        </Badge>
        <h2 className="text-lg font-medium leading-snug text-text-primary">{currentQuestion.questionText}</h2>

        {currentQuestion.questionType === 'mcq' && currentQuestion.options ? (
          <div className="flex flex-col gap-2">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => recordAnswer(opt)}
                className={classNames(
                  'rounded-md border px-4 py-3 text-left text-sm transition-all duration-150',
                  currentAnswer === opt
                    ? 'border-brand bg-brand-subtle text-brand shadow-[0_0_0_1px_var(--color-brand)]'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong hover:bg-surface-secondary'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => recordAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={5}
            className="w-full resize-y rounded-md border border-border-strong bg-surface p-3 text-sm text-text-primary transition-all duration-150 hover:border-border-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        )}
      </Card>

      <Button onClick={goNext} isLoading={submitting} fullWidth>
        {currentIndex === questions.length - 1 ? 'Finish & Submit' : 'Next'}
      </Button>
    </div>
  );
}