import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getMyBooks: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBookById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllBooksAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=book.controller.d.ts.map