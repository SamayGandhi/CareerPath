/**
 * AdminFeatureFlagsTab.jsx
 * -----------------------------------------
 * Feature flags panel per approved UX spec (B.23): includes the
 * critical AI_FEATURE_ENABLED kill switch, prominently labeled with a
 * confirmation-required toggle since it's a high-blast-radius control.
 */

import { useEffect, useState } from 'react';
import Card from '../../../components/ui/molecules/Card';
import Spinner from '../../../components/ui/atoms/Spinner';
import { adminApi } from '../admin.api';
import { useToast } from '../../../components/feedback/Toast';
import { classNames } from '../../../utils';

export default function AdminFeatureFlagsTab() {
  const { showToast } = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState(null);

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    setLoading(true);
    try {
      const { data } = await adminApi.getFeatureFlags();
      setFlags(data.flags || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (flag) => {
    const newValue = !flag.enabled;
    if (!window.confirm(`Are you sure you want to set "${flag.key}" to ${newValue ? 'ENABLED' : 'DISABLED'}?`)) {
      return;
    }
    setTogglingKey(flag.key);
    try {
      await adminApi.updateFeatureFlag(flag.key, newValue);
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: newValue } : f)));
      showToast('Feature flag updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {flags.map((flag) => (
        <Card key={flag.key} className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-text-primary">{flag.key}</p>
            <p className="mt-1 max-w-lg text-sm text-text-secondary">{flag.description}</p>
          </div>
          <button
            onClick={() => handleToggle(flag)}
            disabled={togglingKey === flag.key}
            className={classNames(
              'relative h-7 w-12 shrink-0 rounded-full transition-expo duration-150',
              flag.enabled ? 'bg-brand' : 'bg-surface-secondary border border-border-strong'
            )}
          >
            <span
              className={classNames(
                'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150',
                flag.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </Card>
      ))}
    </div>
  );
}