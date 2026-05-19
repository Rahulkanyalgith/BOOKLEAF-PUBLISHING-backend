"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const socketManager_1 = require("./sockets/socketManager");
const swagger_1 = require("./utils/swagger");
const logger_1 = require("./utils/logger");
const client_1 = require("./prisma/client");
const errorHandler_1 = require("./middleware/errorHandler");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const book_routes_1 = __importDefault(require("./routes/book.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.IO
(0, socketManager_1.initializeSocket)(httpServer);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Swagger docs
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BookLeaf API Docs',
}));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/books', book_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
const PORT = parseInt(process.env.PORT || '5000');
async function bootstrap() {
    try {
        await client_1.prisma.$connect();
        logger_1.logger.info('✅ Database connected');
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`🚀 BookLeaf API server running on port ${PORT}`);
            logger_1.logger.info(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
            logger_1.logger.info(`🔌 Socket.IO enabled`);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await client_1.prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map