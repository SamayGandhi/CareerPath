/**
 * SkillGapRadarChart.jsx
 * -----------------------------------------
 * Radar chart via Recharts, with an accessible data-table fallback.
 * BATCH 4 UPDATE (visual only): radar fill colors updated to the new
 * accent-cyan/danger palette, refined table styling. Toggle logic and
 * --raw-* variable usage (Tailwind v4 compatibility) unchanged.
 */

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Table2, RadarIcon } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';

export default function SkillGapRadarChart({ gaps }) {
  const [showTable, setShowTable] = useState(false);

  const chartData = gaps.map((gap) => ({
    skill: gap.skillId?.skillName || 'Skill',
    Current: gap.currentLevel,
    Required: gap.requiredLevel,
  }));

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setShowTable((s) => !s)}>
          {showTable ? <RadarIcon className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          {showTable ? 'View Chart' : 'View as Table'}
        </Button>
      </div>

      {showTable ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-tertiary">
              <th className="pb-2 font-medium">Skill</th>
              <th className="pb-2 font-medium">Current Level</th>
              <th className="pb-2 font-medium">Required Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {chartData.map((row) => (
              <tr key={row.skill} className="transition-colors duration-150 hover:bg-surface-secondary/50">
                <td className="py-2.5 text-text-primary">{row.skill}</td>
                <td className="py-2.5 text-text-secondary">{row.Current} / 5</td>
                <td className="py-2.5 text-text-secondary">{row.Required} / 5</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="var(--raw-border-subtle)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--raw-text-tertiary)', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={{ fill: 'var(--raw-text-tertiary)', fontSize: 10 }} />
            <Radar
              name="Required"
              dataKey="Required"
              stroke="var(--raw-danger)"
              fill="var(--raw-danger)"
              fillOpacity={0.12}
            />
            <Radar
              name="Current"
              dataKey="Current"
              stroke="var(--raw-brand-primary)"
              fill="var(--raw-accent-cyan)"
              fillOpacity={0.28}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--raw-bg-surface)',
                border: '1px solid var(--raw-border-subtle)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}