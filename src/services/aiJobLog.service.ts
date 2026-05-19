import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

export const logAiJob = async (
  ticketId: string,
  jobType: string,
  status: 'pending' | 'success' | 'failed',
  result?: string,
  errorMsg?: string
) => {
  try {
    await prisma.aiJobLog.create({
      data: { ticketId, jobType, status, result, errorMsg },
    });
  } catch (err) {
    logger.error('Failed to log AI job:', err);
  }
};

export const getAiJobLogs = async (ticketId?: string) => {
  return prisma.aiJobLog.findMany({
    where: ticketId ? { ticketId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
};
