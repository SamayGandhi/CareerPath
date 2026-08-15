/**
 * AssessmentSummary.jsx
 * -----------------------------------------
 * Shown after successful submission.
 * BATCH 4 UPDATE (visual only): refined success icon treatment and
 * skill-badge list layout. Reads from assessment.derivedSkills exactly
 * as before (Batch 5.1 fix preserved).
 */

import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import { ROUTES } from '../../../routes/routeConfig';

const PROFICIENCY_LABELS = { 1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Proficient', 5: 'Expert' };
const PROFICIENCY_VARIANT = { 1: 'neutral', 2: 'neutral', 3: 'info', 4: 'success', 5: 'success' };

export default function AssessmentSummary({ assessment }) {
  const derivedSkills = assessment?.derivedSkills || [];

  return (
    <Card className="animate-fade-in-up flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Assessment Complete</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your profile has been updated with {derivedSkills.length} skill
          {derivedSkills.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2 text-left">
        {derivedSkills.map((skill) => (
          <div
            key={skill.skillId?._id || skill.skillId}
            className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5"
          >
            <span className="text-sm text-text-primary">
              {skill.skillId?.skillName || 'Skill'}
            </span>
            <Badge variant={PROFICIENCY_VARIANT[skill.proficiency]}>
              {PROFICIENCY_LABELS[skill.proficiency]}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link to={ROUTES.SKILL_GAP}>
          <Button>
            View Skill Gap Analysis <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    </Card>
  );
}