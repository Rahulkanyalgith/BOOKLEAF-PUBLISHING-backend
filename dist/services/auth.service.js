"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw (0, errorHandler_1.createError)('JWT secret not configured', 500);
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    });
};
exports.authService = {
    async register(input) {
        const existing = await client_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existing)
            throw (0, errorHandler_1.createError)('Email already registered', 409);
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
        const user = await client_1.prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                password: hashedPassword,
                role: 'AUTHOR',
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        const token = generateToken(user.id);
        logger_1.logger.info(`New author registered: ${user.email}`);
        return { user, token };
    },
    async login(input) {
        const user = await client_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (!user || !(await bcryptjs_1.default.compare(input.password, user.password))) {
            throw (0, errorHandler_1.createError)('Invalid email or password', 401);
        }
        const token = generateToken(user.id);
        logger_1.logger.info(`User logged in: ${user.email} (${user.role})`);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
        };
    },
    async getProfile(userId) {
        const user = await client_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (!user)
            throw (0, errorHandler_1.createError)('User not found', 404);
        return user;
    },
};
//# sourceMappingURL=auth.service.js.map