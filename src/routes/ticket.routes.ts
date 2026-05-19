import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createTicket,
  getMyTickets,
  getMyTicketById,
} from '../controllers/ticket.controller';
import { ticketService } from '../services/ticket.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';

const router = Router();

router.use(authenticate);
router.use(requireRole('AUTHOR'));

router.post('/', createTicket);
router.get('/', getMyTickets);
router.get('/:id', getMyTicketById);

// Author reply to own ticket
router.post('/:id/reply', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }
    const msg = await ticketService.addResponse(req.params.id, req.user!.id, message, false, 'AUTHOR');
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
});

export default router;
