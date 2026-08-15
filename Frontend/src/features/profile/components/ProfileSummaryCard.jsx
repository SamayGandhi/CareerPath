/**
 * ProfileSummaryCard.jsx — BATCH 5 (visual only)
 * Refined avatar/badge layout, modal option-card hover. ALL
 * career-goal-editing modal logic (Batch 5.4) is byte-identical.
 */

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Avatar from '../../../components/ui/atoms/Avatar';
import Badge from '../../../components/ui/atoms/Badge';
import ProgressBar from '../../../components/ui/atoms/ProgressBar';
import Button from '../../../components/ui/atoms/Button';
import Modal from '../../../components/ui/molecules/Modal';
import Spinner from '../../../components/ui/atoms/Spinner';
import { careerPathApi } from '../../career-explorer/careerPath.api';
import { profileApi } from '../profile.api';
import { useToast } from '../../../components/feedback/Toast';
import { classNames } from '../../../utils';

export default function ProfileSummaryCard({ user, profile, onUpdated }) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);

  const openModal = async () => {
    setModalOpen(true);
    setSelectedId(profile?.targetCareerPathId?._id || '');
    setLoadingOptions(true);
    try {
      const { data } = await careerPathApi.list({ limit: 50 });
      setCareerPaths(data.careerPaths);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const { data } = await profileApi.updateTargetCareerPath(selectedId);
      onUpdated?.(data.profile);
      showToast('Career goal updated successfully!', 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col items-center gap-4 text-center">
        <Avatar fullName={user?.fullName} size="lg" />
        <div>
          <h2 className="font-semibold text-text-primary">{user?.fullName}</h2>
          <p className="text-sm text-text-tertiary">{user?.email}</p>
        </div>

        <div className="w-full">
          <ProgressBar value={profile?.profileCompletionPercentage || 0} showLabel />
        </div>

        <div className="flex items-center gap-2">
          {profile?.targetCareerPathId?.title ? (
            <Badge variant="brand">Goal: {profile.targetCareerPathId.title}</Badge>
          ) : (
            <Badge variant="neutral">No goal set</Badge>
          )}
          <button
            onClick={openModal}
            className="rounded-md p-1 text-text-tertiary transition-colors duration-150 hover:bg-surface-secondary hover:text-brand"
            aria-label="Change career goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Change your career goal"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving} disabled={!selectedId}>
              Save
            </Button>
          </>
        }
      >
        {loadingOptions ? (
          <div className="flex justify-center py-6">
            <Spinner size={24} />
          </div>
        ) : (
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {careerPaths.map((cp) => (
              <button
                key={cp._id}
                onClick={() => setSelectedId(cp._id)}
                className={classNames(
                  'rounded-md border px-3 py-2 text-left text-sm transition-all duration-150',
                  selectedId === cp._id
                    ? 'border-brand bg-brand-subtle text-brand'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong'
                )}
              >
                {cp.title}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}