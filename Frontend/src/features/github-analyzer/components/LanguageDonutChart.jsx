/**
 * LanguageDonutChart.jsx — BATCH 5 (visual only)
 * Palette updated to match the new theme's categorical colors. Chart
 * data mapping/props unchanged.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PALETTE = ['#3b82f6', '#22d3ee', '#f59e0b', '#f87171', '#a78bfa', '#34d399'];

export default function LanguageDonutChart({ languageDistribution }) {
  const chartData = languageDistribution.slice(0, 6).map((lang) => ({
    name: lang.language,
    value: lang.percentage,
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-text-tertiary">No language data detected.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip
          formatter={(value) => `${value}%`}
          contentStyle={{
            backgroundColor: 'var(--raw-bg-surface)',
            border: '1px solid var(--raw-border-subtle)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}