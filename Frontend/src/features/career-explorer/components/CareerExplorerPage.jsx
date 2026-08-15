/**
 * CareerExplorerPage.jsx
 * -----------------------------------------
 * Public browsable catalog.
 * BATCH 3 UPDATE (visual only): staggered card-grid entrance, refined
 * heading, unchanged padding wrapper from the Batch 4 layout fix. ALL
 * data fetching (careerPathApi.list), pagination state, and error/empty
 * handling are byte-identical.
 */

import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import CareerPathCard from './CareerPathCard';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import Spinner from '../../../components/ui/atoms/Spinner';
import Button from '../../../components/ui/atoms/Button';
import { careerPathApi } from '../careerPath.api';

export default function CareerExplorerPage() {
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    careerPathApi
      .list({ page, limit: 12 })
      .then(({ data, meta }) => {
        setCareerPaths(data.careerPaths);
        setPagination(meta.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Career Explorer</h1>
        <p className="mt-1 text-text-secondary">
          Browse career paths and see exactly which skills each one requires.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      )}

      {error && <p className="text-center text-danger">{error}</p>}

      {!loading && !error && careerPaths.length === 0 && (
        <EmptyState
          icon={Compass}
          title="No career paths available yet"
          description="Check back later as our catalog grows."
        />
      )}

      {!loading && careerPaths.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {careerPaths.map((cp, i) => (
              <div
                key={cp._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <CareerPathCard careerPath={cp} />
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
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