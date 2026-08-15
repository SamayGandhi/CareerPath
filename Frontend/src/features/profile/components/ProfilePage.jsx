/**
 * ProfilePage.jsx — BATCH 5 (visual only)
 * Refined sticky-column spacing. ALL fetch/state logic unchanged.
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Spinner from '../../../components/ui/atoms/Spinner';
import ProfileSummaryCard from './ProfileSummaryCard';
import ProfileInfoForm from './ProfileInfoForm';
import ProfileSkillsList from './ProfileSkillsList';
import ResumeUploadCard from './ResumeUploadCard';
import { profileApi } from '../profile.api';
import { useToast } from '../../../components/feedback/Toast';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .getMyProfile()
      .then(({ data }) => setProfile(data.profile))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (!profile) {
    return <p className="py-16 text-center text-text-secondary">Profile not found.</p>;
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="sticky top-24 flex flex-col gap-4">
          <ProfileSummaryCard user={user} profile={profile} onUpdated={setProfile} />
          <ResumeUploadCard profile={profile} onUpdated={setProfile} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-2">
        <ProfileInfoForm profile={profile} onUpdated={setProfile} />
        <ProfileSkillsList profile={profile} onUpdated={setProfile} />
      </div>
    </div>
  );
}