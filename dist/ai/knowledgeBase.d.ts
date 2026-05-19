/**
 * BookLeaf Knowledge Base - used for context injection in AI prompts.
 * Each section is keyed for lightweight retrieval (only relevant chunks injected).
 */
export interface KnowledgeSection {
    keywords: string[];
    context: string;
}
export declare const knowledgeBase: Record<string, KnowledgeSection>;
/**
 * Lightweight retrieval: returns only the relevant knowledge sections
 * based on keyword matching in the ticket subject + description.
 */
export declare const retrieveRelevantContext: (text: string) => string;
//# sourceMappingURL=knowledgeBase.d.ts.map