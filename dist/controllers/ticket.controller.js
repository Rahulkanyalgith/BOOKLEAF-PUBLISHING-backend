"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.assignTicketToSelf = exports.generateAiDraft = exports.respondToTicket = exports.updateTicket = exports.getTicketByIdAdmin = exports.getAllTickets = exports.getMyTicketById = exports.getMyTickets = exports.createTicket = void 0;
const ticket_validator_1 = require("../validators/ticket.validator");
const ticket_service_1 = require("../services/ticket.service");
const aiService_1 = require("../ai/aiService");
const aiJobLog_service_1 = require("../services/aiJobLog.service");
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
// Author: create ticket
const createTicket = async (req, res, next) => {
    try {
        const parsed = ticket_validator_1.createTicketSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const ticket = await ticket_service_1.ticketService.createTicket({
            ...parsed.data,
            authorId: req.user.id,
        });
        res.status(201).json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
};
exports.createTicket = createTicket;
// Author: get own tickets
const getMyTickets = async (req, res, next) => {
    try {
        const tickets = await ticket_service_1.ticketService.getAuthorTickets(req.user.id);
        res.json({ success: true, data: tickets });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyTickets = getMyTickets;
// Author: get single ticket (own only)
const getMyTicketById = async (req, res, next) => {
    try {
        const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ticket = await ticket_service_1.ticketService.getTicketById(ticketId, req.user.id);
        res.json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyTicketById = getMyTicketById;
// Admin: get all tickets with filters
const getAllTickets = async (req, res, next) => {
    try {
        const { search, status, priority, category, assignedTo, page, limit, dateFrom, dateTo } = req.query;
        const result = await ticket_service_1.ticketService.getAllTickets({
            search: search,
            status: status,
            priority: priority,
            category: category,
            assignedTo: assignedTo,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            dateFrom: dateFrom,
            dateTo: dateTo,
        });
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllTickets = getAllTickets;
// Admin: get any ticket
const getTicketByIdAdmin = async (req, res, next) => {
    try {
        const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ticket = await ticket_service_1.ticketService.getTicketById(ticketId);
        res.json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
};
exports.getTicketByIdAdmin = getTicketByIdAdmin;
// Admin: update ticket status/priority/category
const updateTicket = async (req, res, next) => {
    try {
        const parsed = ticket_validator_1.updateTicketSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ticket = await ticket_service_1.ticketService.updateTicketStatus(ticketId, parsed.data, req.user.id);
        res.json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
};
exports.updateTicket = updateTicket;
// Admin: respond to ticket (or add internal note)
const respondToTicket = async (req, res, next) => {
    try {
        const parsed = ticket_validator_1.respondSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const message = await ticket_service_1.ticketService.addResponse(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, req.user.id, parsed.data.message, parsed.data.isInternal, 'ADMIN');
        res.status(201).json({ success: true, data: message });
    }
    catch (err) {
        next(err);
    }
};
exports.respondToTicket = respondToTicket;
// Admin: generate AI draft response
const generateAiDraft = async (req, res, next) => {
    try {
        const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ticket = await ticket_service_1.ticketService.getTicketById(ticketId);
        const previousMessages = ticket.messages
            .filter((m) => !m.isInternal)
            .slice(-5)
            .map((m) => ({
            sender: m.sender.name,
            message: m.message,
            createdAt: m.createdAt.toISOString(),
        }));
        const result = await (0, aiService_1.generateDraftResponse)({
            subject: ticket.subject,
            description: ticket.description,
            category: ticket.category,
            priority: ticket.priority,
            authorName: ticket.author.name,
            bookTitle: ticket.book?.title,
            previousMessages,
        });
        await (0, aiJobLog_service_1.logAiJob)(ticketId, 'draft', result.success ? 'success' : 'failed', result.success ? 'draft_generated' : undefined, result.error);
        if (!result.success) {
            res.status(503).json({
                success: false,
                error: 'AI draft generation failed. Please write your response manually.',
                aiError: result.error,
            });
            return;
        }
        // Mark ticket as AI draft generated
        await client_1.prisma.ticket.update({
            where: { id: ticketId },
            data: { aiDraftGenerated: true },
        });
        res.json({ success: true, data: { draft: result.draft } });
    }
    catch (err) {
        next(err);
    }
};
exports.generateAiDraft = generateAiDraft;
// Admin: assign ticket to self
const assignTicketToSelf = async (req, res, next) => {
    try {
        const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ticket = await client_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket)
            throw (0, errorHandler_1.createError)('Ticket not found', 404);
        const updated = await client_1.prisma.ticket.update({
            where: { id: ticketId },
            data: { assignedTo: req.user.id, status: 'IN_PROGRESS' },
            include: { assignedUser: { select: { id: true, name: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.assignTicketToSelf = assignTicketToSelf;
// Admin: get analytics
const getAnalytics = async (_req, res, next) => {
    try {
        const [totalTickets, openTickets, resolvedTickets, criticalTickets, byCategory, byPriority, byStatus, recentTickets,] = await Promise.all([
            client_1.prisma.ticket.count(),
            client_1.prisma.ticket.count({ where: { status: 'OPEN' } }),
            client_1.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
            client_1.prisma.ticket.count({ where: { priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
            client_1.prisma.ticket.groupBy({ by: ['category'], _count: { id: true } }),
            client_1.prisma.ticket.groupBy({ by: ['priority'], _count: { id: true } }),
            client_1.prisma.ticket.groupBy({ by: ['status'], _count: { id: true } }),
            client_1.prisma.ticket.findMany({
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
    }
    catch (err) {
        next(err);
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=ticket.controller.js.map