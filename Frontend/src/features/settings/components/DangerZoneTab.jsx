/**
 * DangerZoneTab.jsx — Visual only. ALL delete-account logic and
 * double-confirmation requirement unchanged.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Input from '../../../components/ui/atoms/Input';
import Button from '../../../components/ui/atoms/Button';
import { userApi } from '../../user/user.api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/feedback/Toast';

export default function DangerZoneTab() {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userApi.deleteMe(password);
      showToast('Account deleted.', 'info');
      logout();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4 border-danger/30 bg-danger/5">
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-semibold">Delete Account</h3>
      </div>
      <p className="text-sm text-text-secondary">
        This action is permanent. Your account will be deactivated and you will be logged out.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Confirm your password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Type <span className="font-semibold">DELETE</span> to confirm
        </label>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
      </div>

      <Button
        variant="danger"
        onClick={handleDelete}
        isLoading={deleting}
        disabled={!password || confirmText !== 'DELETE'}
        className="self-start"
      >
        Permanently Delete Account
      </Button>
    </Card>
  );
}