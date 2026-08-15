/**
 * CareerPathCard.jsx
 * -----------------------------------------
 * Card for the Career Explorer grid.
 * BATCH 3 UPDATE (visual only): refined badge/icon treatment and hover
 * lift (via Card's `interactive` prop, unchanged). Props/data shape
 * consumed (careerPath.title/description/growthOutlook/requiredSkills)
 * are identical.
 */

import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import { ROUTES } from '../../../routes/routeConfig';

const GROWTH_VARIANT = { high: 'success', medium: 'warning', low: 'neutral' };

export default function CareerPathCard({ careerPath }) {
  return (
    <Link to={ROUTES.CAREER_DETAIL.replace(':slug', careerPath.slug)}>
      <Card interactive className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary">{careerPath.title}</h3>
          {careerPath.growthOutlook && (
            <Badge variant={GROWTH_VARIANT[careerPath.growthOutlook]}>
              <TrendingUp className="mr-1 h-3 w-3" />
              {careerPath.growthOutlook}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">
          {careerPath.description}
        </p>
        <p className="text-xs text-text-tertiary">
          {careerPath.requiredSkills?.length || 0} required skills
        </p>
      </Card>
    </Link>
  );
}