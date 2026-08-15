/**
 * SkillAssessmentPage.jsx
 * -----------------------------------------
 * Full page orchestrator.
 * BATCH 4 UPDATE (visual only): refined nav-button layout. ALL phase
 * state machine logic, the career-path-aware question loading (Batch
 * 5.1), and submission flow are byte-identical.
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';
import StepperProgress from '../../../components/ui/molecules/StepperProgress';
import AssessmentIntro from './AssessmentIntro';
import QuestionCard from './QuestionCard';
import AssessmentSummary from './AssessmentSummary';
import { skillAssessmentApi } from '../skillAssessment.api';
import { profileApi } from '../../profile/profile.api';
import { useToast } from '../../../components/feedback/Toast';

const PHASES = { INTRO: 'intro', QUESTIONS: 'questions', SUBMITTING: 'submitting', DONE: 'done' };
const QUESTION_LIMIT = 15;

export default function SkillAssessmentPage() {
  const { showToast } = useToast();
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submittedAssessment, setSubmittedAssessment] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadQuestions() {
    setLoading(true);
    setError(null);

    let careerPathId;
    try {
      const { data: profileData } = await profileApi.getMyProfile();
      careerPathId = profileData.profile?.targetCareerPathId?._id;
    } catch {
      // No profile yet — assessment still works fully without a career goal.
    }

    try {
      const params = { limit: QUESTION_LIMIT };
      if (careerPathId) params.careerPathId = careerPathId;

      const { data } = await skillAssessmentApi.getQuestions('initialOnboarding', params);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : undefined;
  const hasAnswered = currentAnswer !== undefined && currentAnswer !== null;

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: value }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => setCurrentIndex((i) => Math.max(0, i - 1));

  const handleSubmit = async () => {
    setPhase(PHASES.SUBMITTING);
    try {
      const responses = questions.map((q) => ({
        questionId: q._id,
        answer: answers[q._id],
      }));

      const { data } = await skillAssessmentApi.submit({
        assessmentType: 'initialOnboarding',
        responses,
      });

      setSubmittedAssessment(data.assessment);
      setPhase(PHASES.DONE);
    } catch (err) {
      showToast(err.message, 'error');
      setPhase(PHASES.QUESTIONS);
    }
  };

  if (phase === PHASES.INTRO) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <AssessmentIntro
          questionCount={questions.length}
          loading={loading}
          error={error}
          onStart={() => setPhase(PHASES.QUESTIONS)}
        />
      </div>
    );
  }

  if (phase === PHASES.DONE) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <AssessmentSummary assessment={submittedAssessment} />
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <StepperProgress
        currentStep={currentIndex + 1}
        totalSteps={questions.length}
        label="Skill Assessment"
      />

      <QuestionCard question={currentQuestion} value={currentAnswer} onChange={handleAnswerChange} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={goBack} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={goNext} disabled={!hasAnswered} isLoading={phase === PHASES.SUBMITTING}>
          {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
          {currentIndex !== questions.length - 1 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}