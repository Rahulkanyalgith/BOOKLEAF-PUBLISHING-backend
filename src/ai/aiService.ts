import { TicketCategory, TicketPriority } from '@prisma/client';
import { callOpenAI } from './openaiClient';
import { buildClassificationPrompt, buildPriorityPrompt, buildDraftResponsePrompt, DraftResponsePromptParams } from './promptBuilder';
import { logger } from '../utils/logger';

/**
 * AI Service Layer — sits between controllers/services and OpenAI.
 * Handles all AI-specific logic including parsing and fallbacks.
 */

const VALID_CATEGORIES: TicketCategory[] = [
  'ROYALTY_PAYMENTS',
  'ISBN_METADATA',
  'PRINTING_QUALITY',
  'DISTRIBUTION_AVAILABILITY',
  'BOOK_STATUS_PRODUCTION',
  'GENERAL_INQUIRY',
];

const VALID_PRIORITIES: TicketPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const classifyTicket = async (
  subject: string,
  description: string
): Promise<{ category: TicketCategory; success: boolean; error?: string }> => {
  const prompt = buildClassificationPrompt({ subject, description });

  const result = await callOpenAI({
    userPrompt: prompt,
    maxTokens: 20,
    temperature: 0.1,
  });

  if (!result.success || !result.content) {
    logger.warn('AI classification failed, using GENERAL_INQUIRY as fallback');
    return { category: 'GENERAL_INQUIRY', success: false, error: result.error };
  }

  const rawCategory = result.content.trim().toUpperCase().replace(/[^A-Z_]/g, '') as TicketCategory;

  if (VALID_CATEGORIES.includes(rawCategory)) {
    return { category: rawCategory, success: true };
  }

  logger.warn(`AI returned invalid category: "${result.content}", using GENERAL_INQUIRY`);
  return { category: 'GENERAL_INQUIRY', success: true };
};

export const detectPriority = async (
  subject: string,
  description: string,
  category: TicketCategory
): Promise<{ priority: TicketPriority; success: boolean; error?: string }> => {
  const prompt = buildPriorityPrompt({ subject, description, category });

  const result = await callOpenAI({
    userPrompt: prompt,
    maxTokens: 10,
    temperature: 0.1,
  });

  if (!result.success || !result.content) {
    logger.warn('AI priority detection failed, using MEDIUM as fallback');
    return { priority: 'MEDIUM', success: false, error: result.error };
  }

  const rawPriority = result.content.trim().toUpperCase().replace(/[^A-Z]/g, '') as TicketPriority;

  if (VALID_PRIORITIES.includes(rawPriority)) {
    return { priority: rawPriority, success: true };
  }

  logger.warn(`AI returned invalid priority: "${result.content}", using MEDIUM`);
  return { priority: 'MEDIUM', success: true };
};

export const generateDraftResponse = async (
  params: DraftResponsePromptParams
): Promise<{ draft: string; success: boolean; error?: string }> => {
  const prompt = buildDraftResponsePrompt(params);

  const result = await callOpenAI({
    userPrompt: prompt,
    maxTokens: 500,
    temperature: 0.6,
  });

  if (!result.success || !result.content) {
    logger.warn('AI draft generation failed');
    return {
      draft: '',
      success: false,
      error: result.error || 'Failed to generate draft',
    };
  }

  return { draft: result.content, success: true };
};
