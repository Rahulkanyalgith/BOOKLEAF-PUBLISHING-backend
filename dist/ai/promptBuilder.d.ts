import { TicketCategory, TicketPriority } from '@prisma/client';
export interface ClassificationPromptParams {
    subject: string;
    description: string;
}
export interface PriorityPromptParams {
    subject: string;
    description: string;
    category: TicketCategory;
}
export interface DraftResponsePromptParams {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    authorName: string;
    bookTitle?: string;
    previousMessages?: Array<{
        sender: string;
        message: string;
        createdAt: string;
    }>;
}
export declare const buildClassificationPrompt: (params: ClassificationPromptParams) => string;
export declare const buildPriorityPrompt: (params: PriorityPromptParams) => string;
export declare const buildDraftResponsePrompt: (params: DraftResponsePromptParams) => string;
//# sourceMappingURL=promptBuilder.d.ts.map