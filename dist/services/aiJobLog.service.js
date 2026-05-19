"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiJobLogs = exports.logAiJob = void 0;
const client_1 = require("../prisma/client");
const logger_1 = require("../utils/logger");
const logAiJob = async (ticketId, jobType, status, result, errorMsg) => {
    try {
        await client_1.prisma.aiJobLog.create({
            data: { ticketId, jobType, status, result, errorMsg },
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to log AI job:', err);
    }
};
exports.logAiJob = logAiJob;
const getAiJobLogs = async (ticketId) => {
    return client_1.prisma.aiJobLog.findMany({
        where: ticketId ? { ticketId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
};
exports.getAiJobLogs = getAiJobLogs;
//# sourceMappingURL=aiJobLog.service.js.map