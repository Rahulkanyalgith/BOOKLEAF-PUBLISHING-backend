import { prisma } from '../prisma/client';
import { createError } from '../middleware/errorHandler';

export const bookService = {
  async getAuthorBooks(authorId: string) {
    return prisma.book.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getBookById(id: string, authorId: string) {
    const book = await prisma.book.findFirst({
      where: { id, authorId },
    });
    if (!book) throw createError('Book not found', 404);
    return book;
  },

  async getAllBooks(filters: {
    search?: string;
    status?: string;
    genre?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, genre, page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (genre) where.genre = { contains: genre, mode: 'insensitive' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
