/**
 * ProfileInfoForm.jsx — BATCH 5 (visual only)
 * Adopts Select atom for the three dropdown fields. ALL form state
 * and save-call logic unchanged.
 */

import { useState } from 'react';
import Card from '../../../components/ui/molecules/Card';
import Input from '../../../components/ui/atoms/Input';
import Select from '../../../components/ui/atoms/Select';
import Button from '../../../components/ui/atoms/Button';
import { profileApi } from '../profile.api';
import { useToast } from '../../../components/feedback/Toast';
import { EDUCATION_LEVELS, LEARNING_STYLES, BUDGET_PREFERENCES } from '../../../constants';

export default function ProfileInfoForm({ profile, onUpdated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    educationLevel: profile.educationLevel || '',
    currentRole: profile.currentRole || '',
    yearsOfExperience: profile.yearsOfExperience ?? '',
    interests: (profile.interests || []).join(', '),
    preferredLearningStyle: profile.preferredLearningStyle || '',
    weeklyTimeCommitmentHours: profile.weeklyTimeCommitmentHours ?? '',
    budgetPreference: profile.budgetPreference || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await profileApi.updateProfile({
        educationLevel: form.educationLevel || undefined,
        currentRole: form.currentRole || undefined,
        yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : undefined,
        interests: form.interests
          ? form.interests.split(',').map((i) => i.trim()).filter(Boolean)
          : undefined,
        preferredLearningStyle: form.preferredLearningStyle || undefined,
        weeklyTimeCommitmentHours:
          form.weeklyTimeCommitmentHours !== '' ? Number(form.weeklyTimeCommitmentHours) : undefined,
        budgetPreference: form.budgetPreference || undefined,
      });
      onUpdated(data.profile);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="font-semibold text-text-primary">Personal Information</h3>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Education Level</label>
        <Select value={form.educationLevel} onChange={(e) => update('educationLevel', e.target.value)}>
          <option value="">Select...</option>
          {EDUCATION_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Current Role</label>
        <Input value={form.currentRole} onChange={(e) => update('currentRole', e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Years of Experience</label>
        <Input
          type="number"
          min="0"
          value={form.yearsOfExperience}
          onChange={(e) => update('yearsOfExperience', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Interests (comma-separated)
        </label>
        <Input value={form.interests} onChange={(e) => update('interests', e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Preferred Learning Style</label>
        <Select value={form.preferredLearningStyle} onChange={(e) => update('preferredLearningStyle', e.target.value)}>
          <option value="">Select...</option>
          {LEARNING_STYLES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Weekly Time Commitment (hours)
        </label>
        <Input
          type="number"
          min="1"
          max="80"
          value={form.weeklyTimeCommitmentHours}
          onChange={(e) => update('weeklyTimeCommitmentHours', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Budget Preference</label>
        <Select value={form.budgetPreference} onChange={(e) => update('budgetPreference', e.target.value)}>
          <option value="">Select...</option>
          {BUDGET_PREFERENCES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>

      <Button onClick={handleSave} isLoading={saving} className="self-start">
        Save Changes
      </Button>
    </Card>
  );
}