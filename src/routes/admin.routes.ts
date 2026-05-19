import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  getAllTickets,
  getTicketByIdAdmin,
  updateTicket,
  respondToTicket,
  generateAiDraft,
  assignTicketToSelf,
  getAnalytics,
} from '../controllers/ticket.controller';
import { getAllBooksAdmin } from '../controllers/book.controller';
import { getAiJobLogs } from '../services/aiJobLog.service';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

// Analytics
router.get('/analytics', getAnalytics);

// Ticket queue
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketByIdAdmin);
router.patch('/tickets/:id/status', updateTicket);
router.post('/tickets/:id/respond', respondToTicket);
router.post('/tickets/:id/ai-draft', generateAiDraft);
router.post('/tickets/:id/assign', assignTicketToSelf);

// Books (admin view)
router.get('/books', getAllBooksAdmin);

// AI job logs
router.get('/ai-logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await getAiJobLogs(req.query.ticketId as string | undefined);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
