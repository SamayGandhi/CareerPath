/**
 * AccountSettingsTab.jsx — Visual only. ALL update logic unchanged.
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../../components/ui/molecules/Card';
import Input from '../../../components/ui/atoms/Input';
import Select from '../../../components/ui/atoms/Select';
import Button from '../../../components/ui/atoms/Button';
import { userApi } from '../../user/user.api';
import { setCredentials } from '../../auth/authSlice';
import { useToast } from '../../../components/feedback/Toast';
import { USER_TYPES, USER_TYPE_LABELS } from '../../../constants';

export default function AccountSettingsTab() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [userType, setUserType] = useState(user?.userType || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userApi.updateMe({ fullName, userType });
      dispatch(setCredentials({ user: data.user }));
      showToast('Account updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Full Name</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
        <Input value={user?.email} disabled />
        <p className="mt-1 text-xs text-text-tertiary">Email cannot be changed here.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">User Type</label>
        <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
          {Object.values(USER_TYPES).map((t) => (
            <option key={t} value={t}>
              {USER_TYPE_LABELS[t]}
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