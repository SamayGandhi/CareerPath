/**
 * OnboardingFlow.jsx
 * -----------------------------------------
 * Full-screen, focused multi-step onboarding per approved UX spec
 * (B.6). Covers: Welcome -> Education/Experience -> Career Goal ->
 * Interests/Learning Style/Budget -> Completion. Every step's data is
 * accumulated in local state and submitted as ONE real POST /profiles/me
 * call at the end (plus a follow-up PATCH for target career path if one
 * was selected) — no mock data, no simulated success.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';
import Input from '../../../components/ui/atoms/Input';
import Card from '../../../components/ui/molecules/Card';
import Spinner from '../../../components/ui/atoms/Spinner';
import { classNames } from '../../../utils';
import { profileApi } from '../../profile/profile.api';
import { careerPathApi } from '../../career-explorer/careerPath.api';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../routes/routeConfig';
import { EDUCATION_LEVELS, LEARNING_STYLES, BUDGET_PREFERENCES } from '../../../constants';

const EDUCATION_LABELS = {
  school: 'In School',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  graduated: 'Graduated',
  none: 'No Formal Education',
};

const LEARNING_STYLE_LABELS = {
  video: 'Video Lessons',
  text: 'Reading / Text',
  'project-based': 'Project-Based',
  mixed: 'A Mix of Everything',
};

const BUDGET_LABELS = {
  free: 'Free Only',
  low: 'Low Budget',
  medium: 'Medium Budget',
  premium: 'Premium / Flexible',
  noConstraint: 'No Constraint',
};

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loadingCareerPaths, setLoadingCareerPaths] = useState(false);

  const [formData, setFormData] = useState({
    educationLevel: '',
    currentRole: '',
    yearsOfExperience: '',
    targetCareerPathId: '',
    interests: '',
    preferredLearningStyle: '',
    weeklyTimeCommitmentHours: '',
    budgetPreference: '',
  });

  useEffect(() => {
    if (step === 3) {
      setLoadingCareerPaths(true);
      careerPathApi
        .list({ limit: 12 })
        .then(({ data }) => setCareerPaths(data.careerPaths))
        .catch(() => showToast('Could not load career paths. You can skip this step.', 'error'))
        .finally(() => setLoadingCareerPaths(false));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 2) return Boolean(formData.educationLevel);
    return true;
  };

  const handleNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await profileApi.createProfile({
        educationLevel: formData.educationLevel,
        currentRole: formData.currentRole || undefined,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        interests: formData.interests
          ? formData.interests.split(',').map((i) => i.trim()).filter(Boolean)
          : undefined,
        preferredLearningStyle: formData.preferredLearningStyle || undefined,
        weeklyTimeCommitmentHours: formData.weeklyTimeCommitmentHours
          ? Number(formData.weeklyTimeCommitmentHours)
          : undefined,
        budgetPreference: formData.budgetPreference || undefined,
      });

      if (formData.targetCareerPathId) {
        await profileApi.updateTargetCareerPath(formData.targetCareerPathId);
      }

      showToast('Profile created successfully!', 'success');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="h-1 w-full bg-surface-secondary">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-xl">
          {step === 1 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Rocket className="h-12 w-12 text-brand" />
              <h1 className="text-2xl font-semibold text-text-primary">
                Let&apos;s build your personalized path
              </h1>
              <p className="max-w-sm text-sm text-text-secondary">
                A few quick questions will help us understand where you&apos;re starting from and
                where you want to go.
              </p>
              <Button onClick={handleNext} size="lg">
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold text-text-primary">Education & Experience</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Education level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EDUCATION_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => update('educationLevel', level)}
                      className={classNames(
                        'rounded-md border px-3 py-2 text-sm transition-expo duration-150',
                        formData.educationLevel === level
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-border-subtle text-text-secondary hover:border-border-strong'
                      )}
                    >
                      {EDUCATION_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Current role (optional)
                </label>
                <Input
                  value={formData.currentRole}
                  onChange={(e) => update('currentRole', e.target.value)}
                  placeholder="e.g. Marketing Executive"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Years of experience (optional)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => update('yearsOfExperience', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Career Goal</h2>
                <p className="text-sm text-text-secondary">
                  Choose a target career path, or skip if you&apos;re not sure yet.
                </p>
              </div>

              {loadingCareerPaths ? (
                <Spinner size={28} className="py-8" />
              ) : (
                <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
                  {careerPaths.map((cp) => (
                    <button
                      key={cp._id}
                      type="button"
                      onClick={() => update('targetCareerPathId', cp._id)}
                      className={classNames(
                        'rounded-md border p-3 text-left text-sm transition-expo duration-150',
                        formData.targetCareerPathId === cp._id
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-border-subtle text-text-secondary hover:border-border-strong'
                      )}
                    >
                      <p className="font-medium text-text-primary">{cp.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-text-tertiary">{cp.description}</p>
                    </button>
                  ))}
                  {careerPaths.length === 0 && (
                    <p className="col-span-2 py-4 text-center text-sm text-text-tertiary">
                      No career paths available yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold text-text-primary">Interests & Learning Style</h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Interests (comma-separated, optional)
                </label>
                <Input
                  value={formData.interests}
                  onChange={(e) => update('interests', e.target.value)}
                  placeholder="e.g. design, data, entrepreneurship"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Preferred learning style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LEARNING_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => update('preferredLearningStyle', style)}
                      className={classNames(
                        'rounded-md border px-3 py-2 text-sm transition-expo duration-150',
                        formData.preferredLearningStyle === style
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-border-subtle text-text-secondary hover:border-border-strong'
                      )}
                    >
                      {LEARNING_STYLE_LABELS[style]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Weekly time commitment (hours, optional)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="80"
                  value={formData.weeklyTimeCommitmentHours}
                  onChange={(e) => update('weeklyTimeCommitmentHours', e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Budget preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_PREFERENCES.map((budget) => (
                    <button
                      key={budget}
                      type="button"
                      onClick={() => update('budgetPreference', budget)}
                      className={classNames(
                        'rounded-md border px-3 py-2 text-sm transition-expo duration-150',
                        formData.budgetPreference === budget
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-border-subtle text-text-secondary hover:border-border-strong'
                      )}
                    >
                      {BUDGET_LABELS[budget]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Check className="h-12 w-12 text-success" />
              <h1 className="text-2xl font-semibold text-text-primary">You&apos;re all set</h1>
              <p className="max-w-sm text-sm text-text-secondary">
                We&apos;ll save your profile now. Next, take a quick skill assessment from your
                dashboard to unlock your personalized skill gap analysis and roadmap.
              </p>
              <Button onClick={handleComplete} size="lg" isLoading={isSubmitting}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {step > 1 && step < 5 && (
            <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}