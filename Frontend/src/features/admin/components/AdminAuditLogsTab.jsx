/**
 * AdminAuditLogsTab.jsx
 * -----------------------------------------
 * Audit log viewer per approved UX spec (B.23): searchable/filterable/
 * paginated table, real GET /admin/audit-logs data.
 */

import { useEffect, useState } from 'react';
import Input from '../../../components/ui/atoms/Input';
import Button from '../../../components/ui/atoms/Button';
import DataTable from '../../../components/ui/organisms/DataTable';
import { adminApi } from '../admin.api';
import { formatDate } from '../../../utils';

export default function AdminAuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getAuditLogs({ action: actionFilter || undefined, page, limit: 20 })
      .then(({ data, meta }) => {
        setLogs(data.auditLogs);
        setPagination(meta.pagination);
      })
      .finally(() => setLoading(false));
  }, [actionFilter, page]);

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'actor', label: 'Actor', render: (row) => row.actorUserId?.fullName || row.actorUserId?.email || '—' },
    { key: 'targetEntityType', label: 'Target Type' },
    { key: 'createdAt', label: 'When', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={actionFilter}
        onChange={(e) => {
          setActionFilter(e.target.value);
          setPage(1);
        }}
        placeholder="Filter by action (e.g. USER_ROLE_OR_STATUS_CHANGED)..."
        className="max-w-md"
      />

      <DataTable columns={columns} rows={logs} loading={loading} emptyMessage="No audit log entries found" />

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
    </div>
  );
}