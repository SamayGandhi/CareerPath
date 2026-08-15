/**
 * RegisterForm.jsx
 * -----------------------------------------
 * Registration form per approved UX spec (B.3): userType presented as
 * visually distinct icon-cards (not a plain dropdown) since it's the
 * single most consequential input driving the Recommendation Engine's
 * Strategy Pattern selection.
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  Briefcase,
  RefreshCw,
  BookOpen,
  UserRoundCog,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import FormField from '../../../components/ui/molecules/FormField';
import Button from '../../../components/ui/atoms/Button';
import { classNames } from '../../../utils';
import { ROUTES } from '../../../routes/routeConfig';
import { USER_TYPES, USER_TYPE_LABELS } from '../../../constants';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, 'Must include a number and a special character'),
  userType: z.enum(Object.values(USER_TYPES), { errorMap: () => ({ message: 'Please select who you are' }) }),
});

const USER_TYPE_ICONS = {
  schoolStudent: School,
  collegeStudent: GraduationCap,
  fresher: BookOpen,
  workingProfessional: Briefcase,
  careerSwitcher: RefreshCw,
  selfLearner: UserRoundCog,
};

export default function RegisterForm() {
  const [serverError, setServerError] = useState(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (formData) => {
    setServerError(null);
    try {
      await registerUser(formData);
      navigate(ROUTES.ONBOARDING, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Start your personalized path to a new career.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Full Name" name="fullName" register={register} error={errors.fullName} />
        <FormField
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Which best describes you?</label>
          <Controller
            name="userType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {Object.values(USER_TYPES).map((type) => {
                  const Icon = USER_TYPE_ICONS[type];
                  const isSelected = field.value === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => field.onChange(type)}
                      className={classNames(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-expo duration-150',
                        isSelected
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-border-subtle bg-surface text-text-secondary hover:border-border-strong'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{USER_TYPE_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.userType && <span className="mt-1 block text-xs text-danger">{errors.userType.message}</span>}
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}