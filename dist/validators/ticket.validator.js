"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondSchema = exports.updateTicketSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    subject: zod_1.z.string().min(3).max(255),
    description: zod_1.z.string().min(10),
    bookId: zod_1.z.string().uuid().optional(),
});
exports.updateTicketSchema = zod_1.z.object({
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_AUTHOR', 'RESOLVED', 'CLOSED']).optional(),
    priority: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    category: zod_1.z.enum([
        'ROYALTY_PAYMENTS',
        'ISBN_METADATA',
        'PRINTING_QUALITY',
        'DISTRIBUTION_AVAILABILITY',
        'BOOK_STATUS_PRODUCTION',
        'GENERAL_INQUIRY',
    ]).optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
});
exports.respondSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    isInternal: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=ticket.validator.js.map