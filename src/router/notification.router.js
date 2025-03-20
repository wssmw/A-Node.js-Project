const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    getNotifications,
    markAsRead,
    getUnreadCount,
    markAllAsRead,
} = require('../controller/notification.controller');

const notificationRouter = new Router({ prefix: '/notification' });

// 获取通知列表
notificationRouter.post('/list', verifyAuth, getNotifications);

// 标记通知为已读
notificationRouter.post('/read', verifyAuth, markAsRead);

// 标记所有通知为已读
notificationRouter.post('/read/all', verifyAuth, markAllAsRead);

// 获取未读通知数量
notificationRouter.get('/unread', verifyAuth, getUnreadCount);

module.exports = notificationRouter;
