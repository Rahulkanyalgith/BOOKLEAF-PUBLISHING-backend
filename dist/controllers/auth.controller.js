"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new author
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 */
const register = async (req, res, next) => {
    try {
        const parsed = auth_validator_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const result = await auth_service_1.authService.register(parsed.data);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
const login = async (req, res, next) => {
    try {
        const parsed = auth_validator_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const result = await auth_service_1.authService.login(parsed.data);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const getProfile = async (req, res, next) => {
    try {
        const user = await auth_service_1.authService.getProfile(req.user.id);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map