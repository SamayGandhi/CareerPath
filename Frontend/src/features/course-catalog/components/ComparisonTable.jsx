/**
 * ComparisonTable.jsx
 * -----------------------------------------
 * Reusable side-by-side comparison table, used for both Course and
 * Platform comparison.
 * BATCH 3 UPDATE (visual only): refined header/row treatment with a
 * subtle brand-tinted header background and smoother row hover. Props
 * (items, rows, getHeader) and rendering logic are byte-identical.
 */

import { classNames } from '../../../utils';

export default function ComparisonTable({ items, rows, getHeader }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle shadow-xs">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border-b border-border-subtle bg-surface-secondary p-3 text-left font-medium text-text-tertiary">
              &nbsp;
            </th>
            {items.map((item) => (
              <th
                key={item._id}
                className="border-b border-border-subtle bg-surface-secondary p-3 text-left"
              >
                {getHeader(item)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={classNames(
                'transition-colors duration-150 hover:bg-brand-subtle/40',
                i % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary/40'
              )}
            >
              <td className="sticky left-0 z-10 border-b border-border-subtle bg-inherit p-3 font-medium text-text-primary">
                {row.label}
              </td>
              {items.map((item) => (
                <td key={item._id} className="border-b border-border-subtle p-3 text-text-secondary">
                  {row.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}