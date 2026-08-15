/**
 * LoginForm.jsx
 * -----------------------------------------
 * Login form per approved UX spec (B.2): email/password, generic
 * error banner (never field-specific, to avoid revealing which field
 * was wrong — matches backend's INVALID_CREDENTIALS design).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormField from '../../../components/ui/molecules/FormField';
import Button from '../../../components/ui/atoms/Button';
import { ROUTES } from '../../../routes/routeConfig';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginForm() {
  const [serverError, setServerError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    setServerError(null);
    try {
      await login(formData);
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Log in to continue your learning journey.</p>
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
          placeholder="you@example.com"
          register={register}
          error={errors.email}
        />
        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            error={errors.password}
          />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="mt-1.5 block text-right text-xs text-brand hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Log In
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}