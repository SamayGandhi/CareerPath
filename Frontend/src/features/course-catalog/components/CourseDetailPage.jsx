/**
 * CourseDetailPage.jsx
 * -----------------------------------------
 * Course detail page.
 * BATCH 3 UPDATE (visual only): refined header/meta row and price/CTA
 * footer. ALL data fetching (coursesApi.getBySlug) and structure are
 * byte-identical.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, ExternalLink, ArrowLeft, Award } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';
import { coursesApi } from '../courses.api';
import { ROUTES } from '../../../routes/routeConfig';
import { formatCurrency } from '../../../utils';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    coursesApi
      .getBySlug(slug)
      .then(({ data }) => setCourse(data.course))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !course) {
    return <p className="py-16 text-center text-danger">{error || 'Course not found'}</p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <Link
        to={ROUTES.COURSE_EXPLORER}
        className="flex w-fit items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Course Explorer
      </Link>

      <Card className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-tertiary">{course.platformId?.name}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">{course.title}</h1>
            {course.instructor && (
              <p className="mt-1 text-sm text-text-secondary">by {course.instructor}</p>
            )}
          </div>
          <Badge variant="neutral">{course.level}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          {course.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" /> {course.rating.toFixed(1)} (
              {course.ratingCount.toLocaleString()})
            </span>
          )}
          {course.durationHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {course.durationHours} hours
            </span>
          )}
          {course.certificationOffered && (
            <span className="flex items-center gap-1 text-success">
              <Award className="h-4 w-4" /> Certificate offered
            </span>
          )}
        </div>

        <p className="mt-4 leading-relaxed text-text-secondary">{course.description}</p>

        {course.skillsCovered?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {course.skillsCovered.map((s) => (
              <Badge key={s._id} variant="brand">
                {s.skillName}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-5">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {formatCurrency(course.price?.amount, course.price?.currency)}
          </span>
          <a href={course.externalUrl} target="_blank" rel="noopener noreferrer">
            <Button>
              View Course <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}