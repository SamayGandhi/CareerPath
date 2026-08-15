/**
 * ForgotPasswordForm.jsx
 * -----------------------------------------
 * Per approved UX spec (B.4): generic confirmation state after
 * submission, regardless of whether the email exists (matches backend's
 * enumeration-safe design).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { authApi } from '../auth.api';
import FormField from '../../../components/ui/molecules/FormField';
import Button from '../../../components/ui/atoms/Button';
import { ROUTES } from '../../../routes/routeConfig';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
});

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setServerError(null);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      setServerError(error.message);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <MailCheck className="h-12 w-12 text-brand" />
        <h1 className="text-xl font-semibold text-text-primary">Check your email</h1>
        <p className="text-sm text-text-secondary">
          If an account with that email exists, we&apos;ve sent a password reset link.
        </p>
        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-brand hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Forgot your password?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send Reset Link
        </Button>
      </form>

      <Link to={ROUTES.LOGIN} className="text-center text-sm font-medium text-brand hover:underline">
        Back to login
      </Link>
    </div>
  );
}