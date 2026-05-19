import { z } from 'zod';
export declare const createTicketSchema: z.ZodObject<{
    subject: z.ZodString;
    description: z.ZodString;
    bookId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateTicketSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        OPEN: "OPEN";
        IN_PROGRESS: "IN_PROGRESS";
        PENDING_AUTHOR: "PENDING_AUTHOR";
        RESOLVED: "RESOLVED";
        CLOSED: "CLOSED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>>;
    category: z.ZodOptional<z.ZodEnum<{
        ROYALTY_PAYMENTS: "ROYALTY_PAYMENTS";
        ISBN_METADATA: "ISBN_METADATA";
        PRINTING_QUALITY: "PRINTING_QUALITY";
        DISTRIBUTION_AVAILABILITY: "DISTRIBUTION_AVAILABILITY";
        BOOK_STATUS_PRODUCTION: "BOOK_STATUS_PRODUCTION";
        GENERAL_INQUIRY: "GENERAL_INQUIRY";
    }>>;
    assignedTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const respondSchema: z.ZodObject<{
    message: z.ZodString;
    isInternal: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=ticket.validator.d.ts.map