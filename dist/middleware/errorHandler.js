"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
const logger_1 = require("../utils/logger");
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    logger_1.logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack });
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map