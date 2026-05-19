import { TicketCategory, TicketPriority } from '@prisma/client';
import { DraftResponsePromptParams } from './promptBuilder';
export declare const classifyTicket: (subject: string, description: string) => Promise<{
    category: TicketCategory;
    success: boolean;
    error?: string;
}>;
export declare const detectPriority: (subject: string, description: string, category: TicketCategory) => Promise<{
    priority: TicketPriority;
    success: boolean;
    error?: string;
}>;
export declare const generateDraftResponse: (params: DraftResponsePromptParams) => Promise<{
    draft: string;
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=aiService.d.ts.map