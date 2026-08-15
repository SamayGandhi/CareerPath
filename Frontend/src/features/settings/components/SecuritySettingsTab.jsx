/**
 * SecuritySettingsTab.jsx — Visual only. ALL password-change and
 * logout-all logic unchanged.
 */

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Input from '../../../components/ui/atoms/Input';
import Button from '../../../components/ui/atoms/Button';
import { userApi } from '../../user/user.api';
import { authApi } from '../../auth/auth.api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/feedback/Toast';

export default function SecuritySettingsTab() {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const handleChangePassword = async () => {
    setSaving(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully. Please log in again.', 'success');
      setTimeout(() => logout(), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out from all devices?')) return;
    setLoggingOutAll(true);
    try {
      await authApi.logoutAll();
      showToast('Logged out from all devices.', 'success');
      logout();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <h3 className="font-semibold text-text-primary">Change Password</h3>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Current Password</label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">New Password</label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <Button
          onClick={handleChangePassword}
          isLoading={saving}
          disabled={!currentPassword || !newPassword}
          className="self-start"
        >
          Change Password
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="font-semibold text-text-primary">Sessions</h3>
        <p className="text-sm text-text-secondary">
          Log out from all devices where you&apos;re currently signed in.
        </p>
        <Button variant="secondary" onClick={handleLogoutAll} isLoading={loggingOutAll} className="self-start">
          <LogOut className="h-4 w-4" /> Log Out All Devices
        </Button>
      </Card>
    </div>
  );
}