/**
 * ProfileSkillsList.jsx — BATCH 5 (visual only)
 * Refined stepper-button treatment. ALL PATCH-per-adjustment logic
 * unchanged.
 */

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import { profileApi } from '../profile.api';
import { useToast } from '../../../components/feedback/Toast';

export default function ProfileSkillsList({ profile, onUpdated }) {
  const { showToast } = useToast();
  const [updatingSkillId, setUpdatingSkillId] = useState(null);

  const handleAdjust = async (skillId, currentProficiency, delta) => {
    const newProficiency = Math.max(1, Math.min(5, currentProficiency + delta));
    if (newProficiency === currentProficiency) return;

    setUpdatingSkillId(skillId);
    try {
      const { data } = await profileApi.updateSkillProficiency(skillId, newProficiency);
      onUpdated(data.profile);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingSkillId(null);
    }
  };

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-text-primary">
        Current Skills ({profile.currentSkills?.length || 0})
      </h3>

      {(!profile.currentSkills || profile.currentSkills.length === 0) && (
        <p className="text-sm text-text-tertiary">
          No skills recorded yet. Complete a skill assessment to populate this list.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {profile.currentSkills?.map((skill) => {
          const skillId = skill.skillId?._id || skill.skillId;
          const skillName = skill.skillId?.skillName || 'Skill';
          const isUpdating = updatingSkillId === skillId;

          return (
            <div
              key={skillId}
              className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 transition-colors duration-150 hover:bg-surface-secondary/40"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">{skillName}</span>
                {skill.verified && <Badge variant="success">Verified</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating}
                  onClick={() => handleAdjust(skillId, skill.proficiency, -1)}
                  className="rounded p-1 text-text-tertiary transition-colors duration-150 hover:bg-surface-secondary disabled:opacity-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-text-primary">
                  {skill.proficiency}
                </span>
                <button
                  disabled={isUpdating}
                  onClick={() => handleAdjust(skillId, skill.proficiency, 1)}
                  className="rounded p-1 text-text-tertiary transition-colors duration-150 hover:bg-surface-secondary disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}