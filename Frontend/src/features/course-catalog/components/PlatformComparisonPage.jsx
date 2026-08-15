/**
 * PlatformComparisonPage.jsx
 * -----------------------------------------
 * Platform comparison.
 * BATCH 3 UPDATE (visual only): refined platform-chip selector styling.
 * ALL selection state and compare-call logic are byte-identical.
 */

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import Input from '../../../components/ui/atoms/Input';
import Badge from '../../../components/ui/atoms/Badge';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import ComparisonTable from './ComparisonTable';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import { platformsApi } from '../platforms.api';
import { useToast } from '../../../components/feedback/Toast';
import { classNames } from '../../../utils';

export default function PlatformComparisonPage() {
  const { showToast } = useToast();
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparedPlatforms, setComparedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformsApi
      .list({ limit: 50 })
      .then(({ data }) => setAllPlatforms(data.platforms))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      showToast('Please select at least 2 platforms to compare.', 'error');
      return;
    }
    try {
      const { data } = await platformsApi.compare(selectedIds);
      setComparedPlatforms(data.platforms);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const rows = [
    { label: 'Pricing Model', render: (p) => p.pricingModel },
    {
      label: 'Certification Recognition',
      render: (p) => p.certificationRecognition || '—',
    },
    { label: 'Average Rating', render: (p) => (p.averageRating > 0 ? `${p.averageRating.toFixed(1)} / 5` : '—') },
    {
      label: 'Strengths',
      render: (p) => (
        <ul className="list-inside list-disc space-y-0.5">
          {(p.strengths || []).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    {
      label: 'Weaknesses',
      render: (p) => (
        <ul className="list-inside list-disc space-y-0.5">
          {(p.weaknesses || []).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Compare Platforms</h1>
        <p className="mt-1 text-text-secondary">Select 2 to 5 platforms to compare side-by-side.</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {allPlatforms.map((platform) => (
            <button
              key={platform._id}
              onClick={() => toggleId(platform._id)}
              className={classNames(
                'rounded-full border px-3 py-1.5 text-sm transition-all duration-150',
                selectedIds.includes(platform._id)
                  ? 'border-brand bg-brand-subtle text-brand'
                  : 'border-border-subtle text-text-secondary hover:border-brand/40 hover:text-text-primary'
              )}
            >
              {platform.name}
            </button>
          ))}
        </div>
        <Button className="mt-4" onClick={handleCompare} disabled={selectedIds.length < 2}>
          Compare Selected ({selectedIds.length})
        </Button>
      </Card>

      {comparedPlatforms.length === 0 ? (
        <EmptyState icon={Scale} title="No comparison yet" description="Select platforms above and click Compare." />
      ) : (
        <ComparisonTable
          items={comparedPlatforms}
          rows={rows}
          getHeader={(p) => (
            <div className="flex items-center gap-2">
              {p.logoUrl && <img src={p.logoUrl} alt="" className="h-6 w-6 rounded" />}
              <span className="font-semibold text-text-primary">{p.name}</span>
            </div>
          )}
        />
      )}
    </div>
  );
}