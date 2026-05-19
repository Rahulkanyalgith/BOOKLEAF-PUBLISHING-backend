"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callOpenAI = void 0;
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("../utils/logger");
const openaiClient = new openai_1.default({
    apiKey: process.env.GROK_API_KEY,
});
/**
 * Core OpenAI API caller with error handling.
 * All other AI services go through this function.
 */
const callOpenAI = async (options) => {
    const { userPrompt, systemPrompt = 'You are a helpful assistant for BookLeaf publishing platform.', maxTokens = 600, temperature = 0.4, } = options;
    try {
        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey || apiKey === 'sk-your-grok-api-key-here') {
            logger_1.logger.warn('GROK API key not configured — AI features disabled');
            return { success: false, error: 'GROK API key not configured' };
        }
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: maxTokens,
            temperature,
        });
        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
            return { success: false, error: 'Empty response from OpenAI' };
        }
        logger_1.logger.info(`Grok call successful. Tokens used: ${response.usage?.total_tokens}`);
        return {
            success: true,
            content,
            tokensUsed: response.usage?.total_tokens,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
        logger_1.logger.error('OpenAI API error:', message);
        return { success: false, error: message };
    }
};
exports.callOpenAI = callOpenAI;
//# sourceMappingURL=openaiClient.js.map