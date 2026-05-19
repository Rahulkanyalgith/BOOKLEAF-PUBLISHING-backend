"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDraftResponse = exports.detectPriority = exports.classifyTicket = void 0;
const openaiClient_1 = require("./openaiClient");
const promptBuilder_1 = require("./promptBuilder");
const logger_1 = require("../utils/logger");
/**
 * AI Service Layer — sits between controllers/services and OpenAI.
 * Handles all AI-specific logic including parsing and fallbacks.
 */
const VALID_CATEGORIES = [
    'ROYALTY_PAYMENTS',
    'ISBN_METADATA',
    'PRINTING_QUALITY',
    'DISTRIBUTION_AVAILABILITY',
    'BOOK_STATUS_PRODUCTION',
    'GENERAL_INQUIRY',
];
const VALID_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const classifyTicket = async (subject, description) => {
    const prompt = (0, promptBuilder_1.buildClassificationPrompt)({ subject, description });
    const result = await (0, openaiClient_1.callOpenAI)({
        userPrompt: prompt,
        maxTokens: 20,
        temperature: 0.1,
    });
    if (!result.success || !result.content) {
        logger_1.logger.warn('AI classification failed, using GENERAL_INQUIRY as fallback');
        return { category: 'GENERAL_INQUIRY', success: false, error: result.error };
    }
    const rawCategory = result.content.trim().toUpperCase().replace(/[^A-Z_]/g, '');
    if (VALID_CATEGORIES.includes(rawCategory)) {
        return { category: rawCategory, success: true };
    }
    logger_1.logger.warn(`AI returned invalid category: "${result.content}", using GENERAL_INQUIRY`);
    return { category: 'GENERAL_INQUIRY', success: true };
};
exports.classifyTicket = classifyTicket;
const detectPriority = async (subject, description, category) => {
    const prompt = (0, promptBuilder_1.buildPriorityPrompt)({ subject, description, category });
    const result = await (0, openaiClient_1.callOpenAI)({
        userPrompt: prompt,
        maxTokens: 10,
        temperature: 0.1,
    });
    if (!result.success || !result.content) {
        logger_1.logger.warn('AI priority detection failed, using MEDIUM as fallback');
        return { priority: 'MEDIUM', success: false, error: result.error };
    }
    const rawPriority = result.content.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (VALID_PRIORITIES.includes(rawPriority)) {
        return { priority: rawPriority, success: true };
    }
    logger_1.logger.warn(`AI returned invalid priority: "${result.content}", using MEDIUM`);
    return { priority: 'MEDIUM', success: true };
};
exports.detectPriority = detectPriority;
const generateDraftResponse = async (params) => {
    const prompt = (0, promptBuilder_1.buildDraftResponsePrompt)(params);
    const result = await (0, openaiClient_1.callOpenAI)({
        userPrompt: prompt,
        maxTokens: 500,
        temperature: 0.6,
    });
    if (!result.success || !result.content) {
        logger_1.logger.warn('AI draft generation failed');
        return {
            draft: '',
            success: false,
            error: result.error || 'Failed to generate draft',
        };
    }
    return { draft: result.content, success: true };
};
exports.generateDraftResponse = generateDraftResponse;
//# sourceMappingURL=aiService.js.map