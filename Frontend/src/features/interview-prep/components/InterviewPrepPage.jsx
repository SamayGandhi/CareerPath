/**
 * InterviewPrepPage.jsx — BATCH 5 (visual only)
 * Refined heading spacing. ALL tab/phase state machine logic
 * (setup -> taking -> results, distraction-free taking-mode chrome
 * hiding) is byte-identical.
 */

import { useState } from 'react';
import { ClipboardList, PlayCircle, TrendingUp } from 'lucide-react';
import Tabs from '../../../components/ui/molecules/Tabs';
import PracticeQuestionsBrowser from './PracticeQuestionsBrowser';
import MockTestSetup from './MockTestSetup';
import MockTestTaking from './MockTestTaking';
import MockTestResults from './MockTestResults';
import ReadinessScoreTrend from './ReadinessScoreTrend';
import { interviewPrepApi } from '../interviewPrep.api';
import { useToast } from '../../../components/feedback/Toast';

const TABS = [
  { value: 'practice', label: 'Practice Questions', icon: ClipboardList },
  { value: 'mockTest', label: 'Mock Test', icon: PlayCircle },
  { value: 'history', label: 'Readiness & History', icon: TrendingUp },
];

const MOCK_TEST_PHASES = { SETUP: 'setup', TAKING: 'taking', RESULTS: 'results' };

export default function InterviewPrepPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('practice');

  const [mockTestPhase, setMockTestPhase] = useState(MOCK_TEST_PHASES.SETUP);
  const [attemptId, setAttemptId] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleStartMockTest = async (config) => {
    setStarting(true);
    try {
      const { data } = await interviewPrepApi.startMockTest(config);
      setAttemptId(data.attemptId);
      setTestQuestions(data.questions);
      setMockTestPhase(MOCK_TEST_PHASES.TAKING);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitMockTest = async (answers) => {
    setSubmitting(true);
    try {
      const { data } = await interviewPrepApi.submitMockTest(attemptId, answers);
      setResult(data);
      setMockTestPhase(MOCK_TEST_PHASES.RESULTS);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetMockTest = () => {
    setMockTestPhase(MOCK_TEST_PHASES.SETUP);
    setAttemptId(null);
    setTestQuestions([]);
    setResult(null);
  };

  if (activeTab === 'mockTest' && mockTestPhase === MOCK_TEST_PHASES.TAKING) {
    return (
      <MockTestTaking
        questions={testQuestions}
        onSubmit={handleSubmitMockTest}
        onExit={() => {
          if (window.confirm('Exit the mock test? Your progress will be lost.')) {
            resetMockTest();
          }
        }}
        submitting={submitting}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Interview Preparation</h1>
        <p className="mt-1 text-text-secondary">Practice questions, take mock tests, and track your readiness.</p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'practice' && <PracticeQuestionsBrowser />}

      {activeTab === 'mockTest' && mockTestPhase === MOCK_TEST_PHASES.SETUP && (
        <div className="mx-auto max-w-md">
          <MockTestSetup onStart={handleStartMockTest} starting={starting} />
        </div>
      )}

      {activeTab === 'mockTest' && mockTestPhase === MOCK_TEST_PHASES.RESULTS && result && (
        <MockTestResults result={result} onDone={resetMockTest} />
      )}

      {activeTab === 'history' && <ReadinessScoreTrend />}
    </div>
  );
}