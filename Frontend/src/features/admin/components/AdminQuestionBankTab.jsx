/**
 * AdminQuestionBankTab.jsx
 * -----------------------------------------
 * Interview question bank CRUD per approved UX spec (B.23). Real
 * POST/PUT/DELETE against /interview-prep/questions.
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import DataTable from '../../../components/ui/organisms/DataTable';
import Modal from '../../../components/ui/molecules/Modal';
import Input from '../../../components/ui/atoms/Input';
import { adminApi } from '../admin.api';
import { useToast } from '../../../components/feedback/Toast';
import { truncate } from '../../../utils';

const QUESTION_TYPES = ['mcq', 'descriptive', 'coding', 'behavioral'];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export default function AdminQuestionBankTab() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    try {
      const { data } = await adminApi.listQuestions({ limit: 100 });
      setQuestions(data.questions || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeactivate = async (question) => {
    if (!window.confirm('Deactivate this question?')) return;
    try {
      await adminApi.deactivateQuestion(question._id);
      showToast('Question deactivated', 'success');
      loadQuestions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'questionText', label: 'Question', render: (r) => truncate(r.questionText, 60) },
    { key: 'questionType', label: 'Type' },
    {
      key: 'difficultyLevel',
      label: 'Difficulty',
      render: (r) => (
        <Badge variant={r.difficultyLevel === 'hard' ? 'danger' : r.difficultyLevel === 'medium' ? 'warning' : 'success'}>
          {r.difficultyLevel}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button onClick={() => handleDeactivate(r)} className="text-text-tertiary hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Question
        </Button>
      </div>

      <DataTable columns={columns} rows={questions} loading={loading} emptyMessage="No questions in the bank yet" />

      {modalOpen && (
        <QuestionFormModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadQuestions();
          }}
        />
      )}
    </div>
  );
}

function QuestionFormModal({ onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    questionText: '',
    questionType: 'mcq',
    options: '',
    correctAnswer: '',
    explanation: '',
    difficultyLevel: 'easy',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.questionText.trim() || !form.correctAnswer.trim()) {
      showToast('Question text and correct answer are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createQuestion({
        questionText: form.questionText,
        questionType: form.questionType,
        options: form.questionType === 'mcq' ? form.options.split('|').map((o) => o.trim()).filter(Boolean) : undefined,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation || undefined,
        difficultyLevel: form.difficultyLevel,
        relatedSkillIds: [], // Note: skill linkage requires selecting real
        // SkillTaxonomy IDs; kept minimal here since a full searchable
        // skill-picker is beyond this form's scope — admins can refine
        // relatedSkillIds via a future dedicated picker.
      });
      showToast('Question created. Note: link related skills via the API/seed data if needed.', 'success');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New Interview Question"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <textarea
          placeholder="Question text"
          value={form.questionText}
          onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
          rows={3}
          className="w-full rounded-md border border-border-strong bg-surface p-3 text-sm text-text-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.questionType}
            onChange={(e) => setForm((f) => ({ ...f, questionType: e.target.value }))}
            className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={form.difficultyLevel}
            onChange={(e) => setForm((f) => ({ ...f, difficultyLevel: e.target.value }))}
            className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
          >
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        {form.questionType === 'mcq' && (
          <Input
            placeholder="Options separated by | (e.g. A|B|C|D)"
            value={form.options}
            onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
          />
        )}
        <Input
          placeholder="Correct answer"
          value={form.correctAnswer}
          onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
        />
        <textarea
          placeholder="Explanation (optional)"
          value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          rows={2}
          className="w-full rounded-md border border-border-strong bg-surface p-3 text-sm text-text-primary"
        />
      </div>
    </Modal>
  );
}