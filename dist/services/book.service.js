"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
exports.bookService = {
    async getAuthorBooks(authorId) {
        return client_1.prisma.book.findMany({
            where: { authorId },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getBookById(id, authorId) {
        const book = await client_1.prisma.book.findFirst({
            where: { id, authorId },
        });
        if (!book)
            throw (0, errorHandler_1.createError)('Book not found', 404);
        return book;
    },
    async getAllBooks(filters) {
        const { search, status, genre, page = 1, limit = 20 } = filters;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { isbn: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (genre)
            where.genre = { contains: genre, mode: 'insensitive' };
        const [books, total] = await Promise.all([
            client_1.prisma.book.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                },
            }),
            client_1.prisma.book.count({ where }),
        ]);
        return { books, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
};
//# sourceMappingURL=book.service.js.map