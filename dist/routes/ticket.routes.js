"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const ticket_service_1 = require("../services/ticket.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)('AUTHOR'));
router.post('/', ticket_controller_1.createTicket);
router.get('/', ticket_controller_1.getMyTickets);
router.get('/:id', ticket_controller_1.getMyTicketById);
// Author reply to own ticket
router.post('/:id/reply', async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) {
            res.status(400).json({ success: false, error: 'Message is required' });
            return;
        }
        const msg = await ticket_service_1.ticketService.addResponse(req.params.id, req.user.id, message, false, 'AUTHOR');
        res.status(201).json({ success: true, data: msg });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map