import { Response, NextFunction } from 'express';
import {
  createTicketSchema,
  updateTicketSchema,
  respondSchema,
} from '../validators/ticket.validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { ticketService } from '../services/ticket.service';
import { generateDraftResponse } from '../ai/aiService';
import { logAiJob } from '../services/aiJobLog.service';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/errorHandler';


// Author: create ticket
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const ticket = await ticketService.createTicket({
      ...parsed.data,
      authorId: req.user!.id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// Author: get own tickets
export const getMyTickets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await ticketService.getAuthorTickets(req.user!.id);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

// Author: get single ticket (own only)
export const getMyTicketById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await ticketService.getTicketById(ticketId, req.user!.id);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// Admin: get all tickets with filters
export const getAllTickets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, priority, category, assignedTo, page, limit, dateFrom, dateTo } = req.query;
    const result = await ticketService.getAllTickets({
      search: search as string,
      status: status as never,
      priority: priority as never,
      category: category as never,
      assignedTo: assignedTo as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Admin: get any ticket
export const getTicketByIdAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await ticketService.getTicketById(ticketId);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// Admin: update ticket status/priority/category
export const updateTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await ticketService.updateTicketStatus(ticketId, parsed.data, req.user!.id);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// Admin: respond to ticket (or add internal note)
export const respondToTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const message = await ticketService.addResponse(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      req.user!.id,
      parsed.data.message,
      parsed.data.isInternal,
      'ADMIN'
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// Admin: generate AI draft response
export const generateAiDraft = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await ticketService.getTicketById(ticketId);

    type TicketMessage = {
      isInternal: boolean;
      sender: { name: string };
      message: string;
      createdAt: Date;
    };

    const previousMessages = (ticket.messages as TicketMessage[])
      .filter((m) => !m.isInternal)
      .slice(-5)
      .map((m) => ({
        sender: m.sender.name,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      }));

    const result = await generateDraftResponse({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      authorName: ticket.author.name,
      bookTitle: ticket.book?.title,
      previousMessages,
    });

    await logAiJob(
      ticketId,
      'draft',
      result.success ? 'success' : 'failed',
      result.success ? 'draft_generated' : undefined,
      result.error
    );

    if (!result.success) {
      res.status(503).json({
        success: false,
        error: 'AI draft generation failed. Please write your response manually.',
        aiError: result.error,
      });
      return;
    }

    // Mark ticket as AI draft generated
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { aiDraftGenerated: true },
    });

    res.json({ success: true, data: { draft: result.draft } });
  } catch (err) {
    next(err);
  }
};

// Admin: assign ticket to self
export const assignTicketToSelf = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw createError('Ticket not found', 404);

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedTo: req.user!.id, status: 'IN_PROGRESS' },
      include: { assignedUser: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: get analytics
export const getAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      criticalTickets,
      byCategory,
      byPriority,
      byStatus,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.groupBy({ by: ['category'], _count: { id: true } }),
      prisma.ticket.groupBy({ by: ['priority'], _count: { id: true } }),
      prisma.ticket.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { author: { select: { name: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        resolvedTickets,
        criticalTickets,
        byCategory,
        byPriority,
        byStatus,
        recentTickets,
      },
    });
  } catch (err) {
    next(err);
  }
};
