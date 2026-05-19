"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBooksAdmin = exports.getBookById = exports.getMyBooks = void 0;
const book_service_1 = require("../services/book.service");
const getMyBooks = async (req, res, next) => {
    try {
        const books = await book_service_1.bookService.getAuthorBooks(req.user.id);
        res.json({ success: true, data: books });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyBooks = getMyBooks;
const getBookById = async (req, res, next) => {
    try {
        const book = await book_service_1.bookService.getBookById(req.params.id, req.user.id);
        res.json({ success: true, data: book });
    }
    catch (err) {
        next(err);
    }
};
exports.getBookById = getBookById;
const getAllBooksAdmin = async (req, res, next) => {
    try {
        const { search, status, genre, page, limit } = req.query;
        const result = await book_service_1.bookService.getAllBooks({
            search: search,
            status: status,
            genre: genre,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllBooksAdmin = getAllBooksAdmin;
//# sourceMappingURL=book.controller.js.map