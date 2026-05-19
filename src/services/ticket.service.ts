import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/errorHandler';
import { classifyTicket, detectPriority } from '../ai/aiService';
import { getIO } from '../sockets/socketManager';
import { logger } from '../utils/logger';
import { logAiJob } from './aiJobLog.service';
import { notificationService } from './notification.service';

export interface CreateTicketInput {
  subject: string;
  description: string;
  bookId?: string;
  authorId: string;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const ticketService = {
  async createTicket(input: CreateTicketInput) {
    // Verify book belongs to author if bookId is provided
    if (input.bookId) {
      const book = await prisma.book.findFirst({
        where: { id: input.bookId, authorId: input.authorId },
      });
      if (!book) throw createError('Book not found or does not belong to you', 404);
    }

    // Create ticket with defaults first
    const ticket = await prisma.ticket.create({
      data: {
        authorId: input.authorId,
        bookId: input.bookId || null,
        subject: input.subject,
        description: input.description,
        category: 'GENERAL_INQUIRY',
        priority: 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, isbn: true } },
      },
    });

    // Run AI classification & priority asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        const [classResult, priorityResult] = await Promise.all([
          classifyTicket(ticket.subject, ticket.description),
          detectPriority(ticket.subject, ticket.description, 'GENERAL_INQUIRY'),
        ]);

        const updatedTicket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            category: classResult.category,
            aiCategory: classResult.category,
            priority: priorityResult.priority,
            aiPriority: priorityResult.priority,
            aiClassified: classResult.success,
          },
          include: {
            author: { select: { id: true, name: true, email: true } },
            book: { select: { id: true, title: true, isbn: true } },
          },
        });

        // Log AI jobs
        await Promise.all([
          logAiJob(ticket.id, 'classify', classResult.success ? 'success' : 'failed', classResult.category, classResult.error),
          logAiJob(ticket.id, 'priority', priorityResult.success ? 'success' : 'failed', priorityResult.priority, priorityResult.error),
        ]);

        // Emit real-time update to admin room
        const io = getIO();
        io.to('admin-room').emit('ticket:classified', { ticketId: ticket.id, ticket: updatedTicket });
        logger.info(`AI classified ticket ${ticket.id}: ${classResult.category} / ${priorityResult.priority}`);
      } catch (err) {
        logger.error('Background AI classification error:', err);
      }
    });

    return ticket;
  },

  async getAuthorTickets(authorId: string) {
    return prisma.ticket.findMany({
      where: { authorId },
      include: {
        book: { select: { id: true, title: true, isbn: true } },
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
        assignedUser: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getTicketById(id: string, authorId?: string) {
    const where: Record<string, unknown> = { id };
    if (authorId) where.authorId = authorId;

    const messagesInclude = authorId
      ? {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' as const },
          include: { sender: { select: { id: true, name: true, role: true } } },
        }
      : {
          orderBy: { createdAt: 'asc' as const },
          include: { sender: { select: { id: true, name: true, role: true } } },
        };

    const ticket = await prisma.ticket.findFirst({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, isbn: true } },
        messages: messagesInclude,
        assignedUser: { select: { id: true, name: true } },
      },
    });
    if (!ticket) throw createError('Ticket not found', 404);
    return ticket;
  },

  async getAllTickets(filters: TicketFilters) {
    const { search, status, priority, category, assignedTo, page = 1, limit = 20, dateFrom, dateTo } = filters;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true, isbn: true } },
          assignedUser: { select: { id: true, name: true } },
          messages: { select: { id: true }, where: { isInternal: false } },
        },
        orderBy: [
          { status: 'asc' },
          { priority: 'asc' },
          { createdAt: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateTicketStatus(
    ticketId: string,
    updates: {
      status?: TicketStatus;
      priority?: TicketPriority;
      category?: TicketCategory;
      assignedTo?: string;
    },
    adminId: string
  ) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw createError('Ticket not found', 404);

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { ...updates, updatedAt: new Date() },
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    // Real-time notification to author
    const io = getIO();
    io.to(`user-${ticket.authorId}`).emit('ticket:updated', { ticketId, ticket: updated });
    io.to('admin-room').emit('ticket:updated', { ticketId, ticket: updated });

    // Create notification for author
    if (updates.status) {
      await notificationService.create({
        userId: ticket.authorId,
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.subject}" status has been updated to ${updates.status?.replace('_', ' ')}.`,
      });
    }

    logger.info(`Admin ${adminId} updated ticket ${ticketId}`);
    return updated;
  },

  async addResponse(
    ticketId: string,
    senderId: string,
    message: string,
    isInternal: boolean,
    senderType: 'AUTHOR' | 'ADMIN'
  ) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw createError('Ticket not found', 404);

    const newMessage = await prisma.message.create({
      data: {
        ticketId,
        senderId,
        senderType,
        message,
        isInternal,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Update ticket timestamp and status
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date(), status: senderType === 'ADMIN' ? 'PENDING_AUTHOR' : ticket.status },
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, isbn: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    // Emit real-time updates
    const io = getIO();
    const eventPayload = { ticketId, message: newMessage };
    io.to(`ticket-${ticketId}`).emit('ticket:message', eventPayload);
    io.to(`user-${ticket.authorId}`).emit('ticket:updated', { ticketId, ticket: updatedTicket });
    io.to('admin-room').emit('ticket:updated', { ticketId, ticket: updatedTicket });

    if (senderType === 'ADMIN' && !isInternal) {
      // Notify the author
      await notificationService.create({
        userId: ticket.authorId,
        title: 'New Response on Your Ticket',
        message: `The BookLeaf support team responded to your ticket: "${ticket.subject}".`,
      });
    }

    return newMessage;
  },
};
