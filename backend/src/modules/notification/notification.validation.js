/**
 * notification.validation.js
 * -----------------------------------------
 * Zod schemas for the Notifications module. Note: notifications are
 * never created directly by client requests (per the approved API
 * contract, endpoint 17.5 is system-internal only) — so there is no
 * "create" validation schema here; all creation happens via internal
 * service-to-service calls from other modules (e.g. Roadmap Engine).
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const listNotificationsQuerySchema = z.object({
  cursor: objectIdSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  isRead: z.coerce.boolean().optional(),
});

const notificationIdParamSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
};