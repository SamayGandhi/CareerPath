/**
 * AdminAiReliabilityTab.jsx
 * -----------------------------------------
 * AI reliability view per approved UX spec (B.23). Honestly displays
 * the backend's real message that the AI layer doesn't exist yet,
 * rather than showing an empty chart as if data were simply absent.
 */

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Spinner from '../../../components/ui/atoms/Spinner';
import { adminApi } from '../admin.api';

export default function AdminAiReliabilityTab() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAiLogs().then(({ data }) => setResult(data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <Sparkles className="h-10 w-10 text-text-tertiary" />
      <h3 className="font-semibold text-text-primary">AI Reliability Metrics</h3>
      <p className="max-w-md text-sm text-text-secondary">{result?.message}</p>
    </Card>
  );
}