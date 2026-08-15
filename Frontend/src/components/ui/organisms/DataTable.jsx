/**
 * DataTable.jsx
 * -----------------------------------------
 * Generic, reusable table per approved Design System (A.16): dense
 * rows, sticky header, hover highlight. Used across every Admin CRUD
 * screen. `columns` is [{ key, label, render? }], `rows` is raw data.
 */

import Spinner from '../atoms/Spinner';

export default function DataTable({ columns, rows, loading, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <p className="py-12 text-center text-sm text-text-tertiary">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead className="sticky top-0 bg-surface-secondary">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="border-b border-border-subtle p-3 text-left font-medium text-text-tertiary">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row._id || i} className="hover:bg-surface-secondary">
              {columns.map((col) => (
                <td key={col.key} className="border-b border-border-subtle p-3 text-text-secondary">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}