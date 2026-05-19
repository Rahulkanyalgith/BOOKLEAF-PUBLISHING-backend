import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openaiClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
});

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
export const callOpenAI = async (options: OpenAICallOptions): Promise<OpenAIResult> => {
  const {
    userPrompt,
    systemPrompt = 'You are a helpful assistant for BookLeaf publishing platform.',
    maxTokens = 600,
    temperature = 0.4,
  } = options;

  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey || apiKey === 'sk-your-grok-api-key-here') {
      logger.warn('GROK API key not configured — AI features disabled');
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

    logger.info(`Grok call successful. Tokens used: ${response.usage?.total_tokens}`);
    return {
      success: true,
      content,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
    logger.error('OpenAI API error:', message);
    return { success: false, error: message };
  }
};
