/**
 * user.validation.js
 * -----------------------------------------
 * Zod schemas for User self-service and admin endpoints.
 */

const { z } = require('zod');
const { USER_TYPES, USER_ROLES, ACCOUNT_STATUS } = require('../../config/constants');
const { PASSWORD_REGEX } = require('../auth/password.util');

const updateMeSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  userType: z.enum(Object.values(USER_TYPES)).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, 'Password must contain at least one number and one special character'),
});

const deleteAccountSchema = z.object({
  password: z.string({ required_error: 'Password confirmation is required' }).min(1),
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  role: z.enum(Object.values(USER_ROLES)).optional(),
  userType: z.enum(Object.values(USER_TYPES)).optional(),
  accountStatus: z.enum(Object.values(ACCOUNT_STATUS)).optional(),
  q: z.string().trim().optional(),
});

const adminUpdateUserSchema = z.object({
  role: z.enum(Object.values(USER_ROLES)).optional(),
  accountStatus: z.enum(Object.values(ACCOUNT_STATUS)).optional(),
});

const userIdParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
});

module.exports = {
  updateMeSchema,
  changePasswordSchema,
  deleteAccountSchema,
  listUsersQuerySchema,
  adminUpdateUserSchema,
  userIdParamSchema,
};