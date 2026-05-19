import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyTickets: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyTicketById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllTickets: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTicketByIdAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const respondToTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateAiDraft: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const assignTicketToSelf: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAnalytics: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ticket.controller.d.ts.map