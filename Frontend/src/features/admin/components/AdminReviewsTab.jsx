/**
 * AdminReviewsTab.jsx
 * -----------------------------------------
 * Reviews moderation per approved UX spec (B.23). Since reviews are
 * queried per-target (backend requires targetType+targetId), this tab
 * lets an admin look up reviews for a specific course/platform by ID
 * rather than fabricating a global "all reviews" endpoint that doesn't
 * exist in the backend.
 */

import { useState } from 'react';
import { Trash2, Search } from 'lucide-react';
import Input from '../../../components/ui/atoms/Input';
import Button from '../../../components/ui/atoms/Button';
import DataTable from '../../../components/ui/organisms/DataTable';
import { adminApi } from '../admin.api';
import { useToast } from '../../../components/feedback/Toast';
import { formatDate } from '../../../utils';

export default function AdminReviewsTab() {
  const { showToast } = useToast();
  const [targetType, setTargetType] = useState('course');
  const [targetId, setTargetId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!targetId.trim()) {
      showToast('Please enter a target ID.', 'error');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await adminApi.listReviewsByTarget(targetType, targetId.trim(), { limit: 50 });
      setReviews(data.reviews || []);
    } catch (err) {
      showToast(err.message, 'error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateDelete = async (review) => {
    if (!window.confirm('Remove this review permanently?')) return;
    try {
      await adminApi.moderateDeleteReview(review._id);
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
      showToast('Review removed', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'userId', label: 'User', render: (r) => r.userId?.fullName || '—' },
    { key: 'rating', label: 'Rating', render: (r) => `${r.rating} / 5` },
    { key: 'comment', label: 'Comment', render: (r) => r.comment || '—' },
    { key: 'isVerifiedCompletion', label: 'Verified', render: (r) => (r.isVerifiedCompletion ? 'Yes' : 'No') },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button onClick={() => handleModerateDelete(r)} className="text-text-tertiary hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Target Type</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text-primary"
          >
            <option value="course">Course</option>
            <option value="platform">Platform</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Target ID</label>
          <Input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Paste course or platform ID" />
        </div>
        <Button onClick={handleSearch} isLoading={loading}>
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>

      {searched && (
        <DataTable columns={columns} rows={reviews} loading={loading} emptyMessage="No reviews found for this target" />
      )}
    </div>
  );
}