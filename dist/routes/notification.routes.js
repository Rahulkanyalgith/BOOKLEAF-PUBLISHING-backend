"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const notifications = await notification_service_1.notificationService.getUserNotifications(req.user.id);
        res.json({ success: true, data: notifications });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/read', async (req, res, next) => {
    try {
        await notification_service_1.notificationService.markRead(req.params.id, req.user.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/read-all', async (req, res, next) => {
    try {
        await notification_service_1.notificationService.markAllRead(req.user.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map