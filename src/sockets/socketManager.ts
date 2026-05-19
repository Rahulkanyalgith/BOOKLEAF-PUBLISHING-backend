import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

let io: SocketServer;

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware for socket connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Auto-join user's personal room for notifications
    socket.join(`user-${userId}`);

    // Join admin room if admin
    socket.on('join:admin', () => {
      socket.join('admin-room');
      logger.info(`Socket ${socket.id} joined admin room`);
    });

    // Join specific ticket room (for real-time ticket updates)
    socket.on('join:ticket', (ticketId: string) => {
      socket.join(`ticket-${ticketId}`);
      logger.info(`Socket ${socket.id} joined ticket room: ${ticketId}`);
    });

    socket.on('leave:ticket', (ticketId: string) => {
      socket.leave(`ticket-${ticketId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};
