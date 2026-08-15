/**
 * auth.validation.js
 * -----------------------------------------
 * Zod validation schemas for every Authentication endpoint, per the
 * approved API contract's field-level validation rules.
 */

const { z } = require('zod');
const { USER_TYPES } = require('../../config/constants');
const { PASSWORD_REGEX } = require('./password.util');

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(PASSWORD_REGEX, 'Password must contain at least one number and one special character');

const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  userType: z.enum(Object.values(USER_TYPES), {
    errorMap: () => ({ message: 'Please provide a valid user type' }),
  }),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(1),
  newPassword: passwordSchema,
});

const resendVerificationSchema = z.object({
  email: emailSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
};