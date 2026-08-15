/**
 * AdminUsersTab.jsx
 * -----------------------------------------
 * User management per approved UX spec (B.23): searchable/filterable
 * table, role/status change actions. Real PATCH /users/:userId.
 */

import { useEffect, useState } from 'react';
import Input from '../../../components/ui/atoms/Input';
import Badge from '../../../components/ui/atoms/Badge';
import DataTable from '../../../components/ui/organisms/DataTable';
import { adminApi } from '../admin.api';
import { useToast } from '../../../components/feedback/Toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { formatDate } from '../../../utils';

const ROLES = ['student', 'contentManager', 'admin'];
const STATUSES = ['active', 'suspended', 'deleted'];

export default function AdminUsersTab() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listUsers({ q: debouncedSearch || undefined, limit: 50 })
      .then(({ data }) => setUsers(data.users))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (userId, role) => {
    try {
      await adminApi.updateUser(userId, { role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
      showToast('User role updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (userId, accountStatus) => {
    try {
      await adminApi.updateUser(userId, { accountStatus });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, accountStatus } : u)));
      showToast('User status updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'userType', label: 'Type' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs text-text-primary"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'accountStatus',
      label: 'Status',
      render: (row) => (
        <select
          value={row.accountStatus}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs text-text-primary"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="max-w-sm"
      />
      <DataTable columns={columns} rows={users} loading={loading} emptyMessage="No users found" />
    </div>
  );
}