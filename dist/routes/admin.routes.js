"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const book_controller_1 = require("../controllers/book.controller");
const aiJobLog_service_1 = require("../services/aiJobLog.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)('ADMIN'));
// Analytics
router.get('/analytics', ticket_controller_1.getAnalytics);
// Ticket queue
router.get('/tickets', ticket_controller_1.getAllTickets);
router.get('/tickets/:id', ticket_controller_1.getTicketByIdAdmin);
router.patch('/tickets/:id/status', ticket_controller_1.updateTicket);
router.post('/tickets/:id/respond', ticket_controller_1.respondToTicket);
router.post('/tickets/:id/ai-draft', ticket_controller_1.generateAiDraft);
router.post('/tickets/:id/assign', ticket_controller_1.assignTicketToSelf);
// Books (admin view)
router.get('/books', book_controller_1.getAllBooksAdmin);
// AI job logs
router.get('/ai-logs', async (req, res, next) => {
    try {
        const logs = await (0, aiJobLog_service_1.getAiJobLogs)(req.query.ticketId);
        res.json({ success: true, data: logs });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map