"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.getIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
let io;
const getIO = () => {
    if (!io)
        throw new Error('Socket.IO not initialized');
    return io;
};
exports.getIO = getIO;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    // Auth middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const secret = process.env.JWT_SECRET;
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            socket.data.userId = decoded.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        logger_1.logger.info(`Socket connected: ${socket.id} (user: ${userId})`);
        // Auto-join user's personal room for notifications
        socket.join(`user-${userId}`);
        // Join admin room if admin
        socket.on('join:admin', () => {
            socket.join('admin-room');
            logger_1.logger.info(`Socket ${socket.id} joined admin room`);
        });
        // Join specific ticket room (for real-time ticket updates)
        socket.on('join:ticket', (ticketId) => {
            socket.join(`ticket-${ticketId}`);
            logger_1.logger.info(`Socket ${socket.id} joined ticket room: ${ticketId}`);
        });
        socket.on('leave:ticket', (ticketId) => {
            socket.leave(`ticket-${ticketId}`);
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
        socket.on('error', (error) => {
            logger_1.logger.error(`Socket error: ${error.message}`);
        });
    });
    logger_1.logger.info('✅ Socket.IO initialized');
    return io;
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=socketManager.js.map