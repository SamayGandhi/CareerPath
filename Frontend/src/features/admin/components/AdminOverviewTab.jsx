/**
 * AdminOverviewTab.jsx
 * -----------------------------------------
 * Admin stat cards per approved UX spec (B.23), driven by the real
 * GET /admin/stats endpoint. Honestly displays the AI fallback rate as
 * "Not available" since the AI layer isn't implemented yet — matching
 * the backend's `aiFallbackRatePercent: null` response exactly.
 */

import { useEffect, useState } from 'react';
import { Users, BookOpen, Route as RouteIcon, Building2, Sparkles, Tag } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Spinner from '../../../components/ui/atoms/Spinner';

const STAT_CONFIG = [
  { key: 'totalUsers', label: 'Total Users', icon: Users },
  { key: 'activeUsersLast30d', label: 'Active Users (30d)', icon: Users },
  { key: 'totalCourses', label: 'Total Courses', icon: BookOpen },
  { key: 'totalRoadmapsGenerated', label: 'Roadmaps Generated', icon: RouteIcon },
  { key: 'totalPlatforms', label: 'Platforms', icon: Building2 },
  { key: 'totalSkills', label: 'Skills in Taxonomy', icon: Tag },
];

export default function AdminOverviewTab({ adminApi }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, [adminApi]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CONFIG.map((stat) => (
          <Card key={stat.key} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-subtle text-brand">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats?.[stat.key] ?? '—'}</p>
              <p className="text-xs text-text-tertiary">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-secondary text-text-tertiary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {stats?.aiFallbackRatePercent !== null ? `${stats.aiFallbackRatePercent}%` : 'Not available'}
          </p>
          <p className="text-xs text-text-tertiary">
            AI Fallback Rate — {stats?.aiFeatureStatus === 'not_yet_implemented' ? 'AI layer not yet implemented' : ''}
          </p>
        </div>
      </Card>
    </div>
  );
}