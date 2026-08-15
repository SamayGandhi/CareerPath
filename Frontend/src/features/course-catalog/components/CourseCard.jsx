/**
 * CourseCard.jsx
 * -----------------------------------------
 * Card for the Course Explorer grid / comparison selection.
 * BATCH 3 UPDATE (visual only): refined badge/price presentation and
 * rating/duration meta row. ALL props (course, selectable, selected,
 * onToggleSelect) and the selectable-vs-link branching behavior are
 * byte-identical.
 */

import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import { ROUTES } from '../../../routes/routeConfig';
import { formatCurrency } from '../../../utils';

export default function CourseCard({ course, selectable, selected, onToggleSelect }) {
  const content = (
    <Card interactive={!selectable} className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-tertiary">{course.platformId?.name}</p>
          <h3 className="font-semibold text-text-primary">{course.title}</h3>
        </div>
        <Badge variant="neutral">{course.level}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
        {course.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" /> {course.rating.toFixed(1)}
          </span>
        )}
        {course.durationHours && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.durationHours}h
          </span>
        )}
      </div>

      {course.skillsCovered?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {course.skillsCovered.slice(0, 3).map((s) => (
            <Badge key={s._id} variant="brand">
              {s.skillName}
            </Badge>
          ))}
          {course.skillsCovered.length > 3 && (
            <Badge variant="neutral">+{course.skillsCovered.length - 3}</Badge>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
        <span className="font-semibold text-text-primary">
          {formatCurrency(course.price?.amount, course.price?.currency)}
        </span>
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.preventDefault();
              onToggleSelect(course);
            }}
            className="h-4 w-4 accent-brand"
          />
        )}
      </div>
    </Card>
  );

  if (selectable) {
    return (
      <div onClick={() => onToggleSelect(course)} className="cursor-pointer">
        {content}
      </div>
    );
  }

  return <Link to={ROUTES.COURSE_DETAIL.replace(':slug', course.slug)}>{content}</Link>;
}