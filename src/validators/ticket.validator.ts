import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(255),
  description: z.string().min(10),
  bookId: z.string().uuid().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_AUTHOR', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  category: z.enum([
    'ROYALTY_PAYMENTS',
    'ISBN_METADATA',
    'PRINTING_QUALITY',
    'DISTRIBUTION_AVAILABILITY',
    'BOOK_STATUS_PRODUCTION',
    'GENERAL_INQUIRY',
  ]).optional(),
  assignedTo: z.string().uuid().optional(),
});

export const respondSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().default(false),
});
