/**
 * CourseExplorerPage.jsx
 * -----------------------------------------
 * Course Explorer.
 * BATCH 3 UPDATE (visual only): refined filter bar spacing/hover and
 * staggered grid entrance. ALL search debouncing, filter state, and
 * API calls are byte-identical to the Batch 4 padded-wrapper version.
 */

import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import CourseCard from './CourseCard';
import Input from '../../../components/ui/atoms/Input';
import Select from '../../../components/ui/atoms/Select';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import { coursesApi } from '../courses.api';
import { useDebounce } from '../../../hooks/useDebounce';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'allLevels'];

export default function CourseExplorerPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [level, setLevel] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');

  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const request = debouncedSearch
      ? coursesApi.search(debouncedSearch, { page, limit: 12 })
      : coursesApi.list({
          page,
          limit: 12,
          level: level || undefined,
          isFree: isFree || undefined,
          sortBy,
          order: 'desc',
        });

    request
      .then(({ data, meta }) => {
        setCourses(data.courses);
        setPagination(meta.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch, level, isFree, sortBy, page]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Course Explorer</h1>
        <p className="mt-1 text-text-secondary">Browse and filter courses across every platform.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses..."
            className="pl-9"
          />
        </div>

        <Select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
          className="sm:w-40"
        >
          <option value="">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sm:w-44">
          <option value="createdAt">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price">Price</option>
          <option value="enrollmentCount">Most Popular</option>
        </Select>

        <label className="flex h-10 items-center gap-2 rounded-md border border-border-strong px-3 text-sm text-text-secondary transition-colors duration-150 hover:border-brand/40">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => {
              setIsFree(e.target.checked);
              setPage(1);
            }}
            className="accent-brand"
          />
          Free only
        </label>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      )}

      {error && <p className="text-center text-danger">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <EmptyState icon={BookOpen} title="No courses match your filters" description="Try adjusting your search or filters." />
      )}

      {!loading && courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <div
                key={course._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-text-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}