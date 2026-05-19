import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bookService } from '../services/book.service';

export const getMyBooks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const books = await bookService.getAuthorBooks(req.user!.id);
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const book = await bookService.getBookById(bookId, req.user!.id);
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const getAllBooksAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, genre, page, limit } = req.query;
    const result = await bookService.getAllBooks({
      search: search as string,
      status: status as string,
      genre: genre as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
