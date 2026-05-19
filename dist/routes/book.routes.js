"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const book_controller_1 = require("../controllers/book.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)('AUTHOR', 'ADMIN'));
router.get('/', book_controller_1.getMyBooks);
router.get('/:id', book_controller_1.getBookById);
exports.default = router;
//# sourceMappingURL=book.routes.js.map