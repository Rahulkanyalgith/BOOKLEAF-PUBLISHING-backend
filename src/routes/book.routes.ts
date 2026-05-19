import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getMyBooks, getBookById } from '../controllers/book.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('AUTHOR', 'ADMIN'));

router.get('/', getMyBooks);
router.get('/:id', getBookById);

export default router;
