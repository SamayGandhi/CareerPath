/**
 * ResetPasswordForm.jsx
 * -----------------------------------------
 * Reads the reset token from the URL query string, per approved API
 * contract (POST /auth/reset-password with { token, newPassword }).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../auth.api';
import FormField from '../../../components/ui/molecules/FormField';
import Button from '../../../components/ui/atoms/Button';
import { ROUTES } from '../../../routes/routeConfig';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, 'Must include a number and a special character'),
});

export default function ResetPasswordForm() {
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ newPassword }) => {
    setServerError(null);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    } catch (error) {
      setServerError(error.message);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-sm text-text-secondary">
        This reset link is invalid or missing a token.{' '}
        <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-brand hover:underline">
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold text-text-primary">Password reset successfully</h1>
        <p className="mt-2 text-sm text-text-secondary">Redirecting you to log in...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Set a new password</h1>
      </div>

      {serverError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          register={register}
          error={errors.newPassword}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}