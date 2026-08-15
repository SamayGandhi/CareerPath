/**
 * CourseComparisonPage.jsx
 * -----------------------------------------
 * Course comparison.
 * BATCH 3 UPDATE (visual only): refined search/selection area and
 * badge presentation. ALL selection state, debounced search, and
 * best-value/highest-rated computation are byte-identical.
 */

import { useState, useEffect } from 'react';
import { Search, Award, TrendingDown, Scale } from 'lucide-react';
import Input from '../../../components/ui/atoms/Input';
import Badge from '../../../components/ui/atoms/Badge';
import Card from '../../../components/ui/molecules/Card';
import ComparisonTable from './ComparisonTable';
import CourseCard from './CourseCard';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import { coursesApi } from '../courses.api';
import { useDebounce } from '../../../hooks/useDebounce';
import { formatCurrency } from '../../../utils';

export default function CourseComparisonPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }
    coursesApi
      .search(debouncedSearch, { limit: 8 })
      .then(({ data }) => setSearchResults(data.courses))
      .catch(() => setSearchResults([]));
  }, [debouncedSearch]);

  const toggleSelect = (course) => {
    setSelectedCourses((prev) => {
      const exists = prev.find((c) => c._id === course._id);
      if (exists) return prev.filter((c) => c._id !== course._id);
      if (prev.length >= 4) return prev;
      return [...prev, course];
    });
  };

  const bestValueId =
    selectedCourses.length > 1
      ? [...selectedCourses].sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))[0]._id
      : null;
  const highestRatedId =
    selectedCourses.length > 1
      ? [...selectedCourses].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]._id
      : null;

  const rows = [
    { label: 'Price', render: (c) => formatCurrency(c.price?.amount, c.price?.currency) },
    { label: 'Duration', render: (c) => (c.durationHours ? `${c.durationHours}h` : '—') },
    { label: 'Level', render: (c) => c.level },
    { label: 'Rating', render: (c) => (c.rating > 0 ? `${c.rating.toFixed(1)} / 5` : '—') },
    { label: 'Platform', render: (c) => c.platformId?.name || '—' },
    { label: 'Certification', render: (c) => (c.certificationOffered ? 'Yes' : 'No') },
    {
      label: 'Skills Covered',
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {(c.skillsCovered || []).map((s) => (
            <Badge key={s._id} variant="neutral">
              {s.skillName}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Compare Courses</h1>
        <p className="mt-1 text-text-secondary">Search and select up to 4 courses to compare side-by-side.</p>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses to add..."
            className="pl-9"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {searchResults.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                selectable
                selected={selectedCourses.some((c) => c._id === course._id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </Card>

      {selectedCourses.length === 0 ? (
        <EmptyState icon={Scale} title="No courses selected" description="Search above and select courses to compare." />
      ) : (
        <>
          {selectedCourses.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {selectedCourses.find((c) => c._id === bestValueId) && (
                <Badge variant="success">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  Best Value: {selectedCourses.find((c) => c._id === bestValueId).title}
                </Badge>
              )}
              {selectedCourses.find((c) => c._id === highestRatedId) && (
                <Badge variant="brand">
                  <Award className="mr-1 h-3 w-3" />
                  Highest Rated: {selectedCourses.find((c) => c._id === highestRatedId).title}
                </Badge>
              )}
            </div>
          )}

          <ComparisonTable
            items={selectedCourses}
            rows={rows}
            getHeader={(c) => (
              <div>
                <p className="font-semibold text-text-primary">{c.title}</p>
                <p className="text-xs text-text-tertiary">{c.platformId?.name}</p>
              </div>
            )}
          />
        </>
      )}
    </div>
  );
}