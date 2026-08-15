/**
 * PracticeQuestionsBrowser.jsx — BATCH 5 (visual only)
 * Adopts the Select atom for the three filters (career path,
 * difficulty, type). ALL filter state, the career-path fetch effect
 * (Batch 5.3), and question-loading effect are byte-identical.
 */

import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import QuestionFlashcard from './QuestionFlashcard';
import Select from '../../../components/ui/atoms/Select';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import { interviewPrepApi } from '../interviewPrep.api';
import { careerPathApi } from '../../career-explorer/careerPath.api';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPES = ['mcq', 'descriptive', 'coding', 'behavioral'];

export default function PracticeQuestionsBrowser() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [careerPathId, setCareerPathId] = useState('');
  const [careerPaths, setCareerPaths] = useState([]);

  useEffect(() => {
    careerPathApi
      .list({ limit: 50 })
      .then(({ data }) => setCareerPaths(data.careerPaths))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    interviewPrepApi
      .getPracticeQuestions({
        difficulty: difficulty || undefined,
        type: type || undefined,
        careerPathId: careerPathId || undefined,
        limit: 20,
      })
      .then(({ data }) => setQuestions(data.questions))
      .finally(() => setLoading(false));
  }, [difficulty, type, careerPathId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select value={careerPathId} onChange={(e) => setCareerPathId(e.target.value)} className="w-48">
          <option value="">All Career Paths</option>
          {careerPaths.map((cp) => (
            <option key={cp._id} value={cp._id}>
              {cp.title}
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-40">
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-40">
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      )}

      {!loading && questions.length === 0 && (
        <EmptyState icon={ClipboardList} title="No questions found" description="Try different filters." />
      )}

      {!loading && questions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {questions.map((q, i) => (
            <div key={q._id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <QuestionFlashcard question={q} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}