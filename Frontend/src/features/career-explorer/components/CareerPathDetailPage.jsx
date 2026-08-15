/**
 * CareerPathDetailPage.jsx
 * -----------------------------------------
 * Career path detail per approved UX spec.
 * BATCH 3 UPDATE (visual only): refined header layout and skill
 * progress bars with subtler labels. ALL data fetching, the
 * addRecentCareerPath() call (Batch 5.5), handleSetGoal /
 * handleAnalyzeGap logic and their auth-redirect behavior are
 * byte-identical.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Target, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';
import ProgressBar from '../../../components/ui/atoms/ProgressBar';
import { careerPathApi } from '../careerPath.api';
import { profileApi } from '../../profile/profile.api';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../routes/routeConfig';
import { formatCurrency } from '../../../utils';
import { addRecentCareerPath } from '../recentCareerPaths';

export default function CareerPathDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { status } = useSelector((state) => state.auth);

  const [careerPath, setCareerPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingGoal, setSettingGoal] = useState(false);

  useEffect(() => {
    setLoading(true);
    careerPathApi
      .getBySlug(slug)
      .then(({ data }) => {
        setCareerPath(data.careerPath);
        addRecentCareerPath({
          _id: data.careerPath._id,
          title: data.careerPath.title,
          slug: data.careerPath.slug,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSetGoal = async () => {
    if (status !== 'authenticated') {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setSettingGoal(true);
    try {
      await profileApi.updateTargetCareerPath(careerPath._id);
      showToast('Career goal updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSettingGoal(false);
    }
  };

  const handleAnalyzeGap = () => {
    if (status !== 'authenticated') {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.SKILL_GAP } } });
      return;
    }
    navigate(ROUTES.SKILL_GAP, { state: { targetCareerPathId: careerPath._id } });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !careerPath) {
    return <p className="py-16 text-center text-danger">{error || 'Career path not found'}</p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <Link
        to={ROUTES.CAREER_EXPLORER}
        className="flex w-fit items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Career Explorer
      </Link>

      <Card className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{careerPath.title}</h1>
            {careerPath.industry && (
              <p className="mt-1 text-sm text-text-tertiary">{careerPath.industry}</p>
            )}
          </div>
          {careerPath.growthOutlook && (
            <Badge variant={careerPath.growthOutlook === 'high' ? 'success' : 'warning'}>
              <TrendingUp className="mr-1 h-3 w-3" />
              {careerPath.growthOutlook} growth
            </Badge>
          )}
        </div>

        <p className="mt-4 leading-relaxed text-text-secondary">{careerPath.description}</p>

        {careerPath.averageSalaryRange?.min && (
          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <DollarSign className="h-4 w-4 text-text-tertiary" />
            {formatCurrency(careerPath.averageSalaryRange.min, careerPath.averageSalaryRange.currency)} –{' '}
            {formatCurrency(careerPath.averageSalaryRange.max, careerPath.averageSalaryRange.currency)}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleSetGoal} isLoading={settingGoal}>
            <Target className="h-4 w-4" /> Set as My Goal
          </Button>
          <Button variant="secondary" onClick={handleAnalyzeGap}>
            Analyze My Gap for This Path
          </Button>
        </div>
      </Card>

      <Card className="animate-fade-in-up">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Required Skills</h2>
        <div className="flex flex-col gap-4">
          {careerPath.requiredSkills?.map((rs) => (
            <div key={rs.skillId?._id || rs.skillId}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">
                  {rs.skillId?.skillName || 'Skill'}
                </span>
                <span className="text-xs text-text-tertiary">Min level {rs.minProficiency}/5</span>
              </div>
              <ProgressBar value={(rs.minProficiency / 5) * 100} variant="brand" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}