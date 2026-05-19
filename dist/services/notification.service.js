"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const client_1 = require("../prisma/client");
const socketManager_1 = require("../sockets/socketManager");
const logger_1 = require("../utils/logger");
exports.notificationService = {
    async create(input) {
        try {
            const notification = await client_1.prisma.notification.create({ data: input });
            const io = (0, socketManager_1.getIO)();
            io.to(`user-${input.userId}`).emit('notification:new', notification);
            return notification;
        }
        catch (err) {
            logger_1.logger.error('Failed to create notification:', err);
        }
    },
    async getUserNotifications(userId) {
        return client_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    },
    async markRead(id, userId) {
        return client_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    },
    async markAllRead(userId) {
        return client_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    },
};
//# sourceMappingURL=notification.service.js.map