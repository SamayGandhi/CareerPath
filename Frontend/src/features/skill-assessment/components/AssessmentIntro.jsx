/**
 * AssessmentIntro.jsx
 * -----------------------------------------
 * Landing state before the assessment starts.
 * BATCH 4 UPDATE (visual only): icon in a soft gradient circle,
 * refined empty/error states. Props (questionCount, loading, error,
 * onStart) and all conditional branches unchanged.
 */

import { ClipboardList } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';

export default function AssessmentIntro({ questionCount, loading, error, onStart }) {
  if (loading) {
    return (
      <Card className="flex justify-center py-16">
        <Spinner size={32} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="py-10 text-center text-danger">
        Could not load assessment questions: {error}
      </Card>
    );
  }

  if (questionCount === 0) {
    return (
      <Card className="animate-fade-in-up flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-secondary">
          <ClipboardList className="h-7 w-7 text-text-tertiary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">No questions available yet</h2>
        <p className="max-w-sm text-sm text-text-secondary">
          The assessment question bank hasn&apos;t been configured for this deployment yet. Please
          check back later.
        </p>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent shadow-sm">
        <ClipboardList className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Skill Self-Assessment</h1>
      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
        Answer {questionCount} quick question{questionCount === 1 ? '' : 's'} about your current
        skills. Your answers directly power your Skill Gap Analysis — be honest, not aspirational.
      </p>
      <Button size="lg" onClick={onStart}>
        Start Assessment
      </Button>
    </Card>
  );
}