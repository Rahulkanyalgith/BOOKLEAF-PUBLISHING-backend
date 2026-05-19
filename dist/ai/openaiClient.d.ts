export interface OpenAICallOptions {
    systemPrompt?: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
}
export interface OpenAIResult {
    success: boolean;
    content?: string;
    error?: string;
    tokensUsed?: number;
}
/**
 * Core OpenAI API caller with error handling.
 * All other AI services go through this function.
 */
export declare const callOpenAI: (options: OpenAICallOptions) => Promise<OpenAIResult>;
//# sourceMappingURL=openaiClient.d.ts.map