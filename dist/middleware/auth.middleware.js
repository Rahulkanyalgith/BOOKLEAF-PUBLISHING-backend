"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../prisma/client");
const errorHandler_1 = require("./errorHandler");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw (0, errorHandler_1.createError)('No authentication token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw (0, errorHandler_1.createError)('Server configuration error', 500);
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await client_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, name: true },
        });
        if (!user)
            throw (0, errorHandler_1.createError)('User not found or token invalid', 401);
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next((0, errorHandler_1.createError)('Invalid or expired token', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            next((0, errorHandler_1.createError)('Access denied: insufficient permissions', 403));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map