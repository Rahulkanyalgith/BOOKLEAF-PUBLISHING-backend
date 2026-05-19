import { prisma } from '../prisma/client';
import { getIO } from '../sockets/socketManager';
import { logger } from '../utils/logger';

export const notificationService = {
  async create(input: { userId: string; title: string; message: string }) {
    try {
      const notification = await prisma.notification.create({ data: input });
      const io = getIO();
      io.to(`user-${input.userId}`).emit('notification:new', notification);
      return notification;
    } catch (err) {
      logger.error('Failed to create notification:', err);
    }
  },

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
