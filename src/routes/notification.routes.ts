import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markRead(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllRead(req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
