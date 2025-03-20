const notificationService = require('../service/notification.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class NotificationController {
    // 获取所有通知
    async getNotifications(ctx) {
        try {
            const { page = 1, pageSize = 10, type } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            console.log(page, pageSize, type, 'page, pageSize, type');
            const result = await notificationService.getNotifications(
                userId,
                parseInt(page),
                parseInt(pageSize),
                type
            );
            console.log(result, 'result');
            handeleSuccessReturnMessage(ctx, '获取成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 获取用户的通知列表
    async getUserNotifications(ctx) {
        try {
            const { page = 1, pageSize = 10 } = ctx.request.query;
            const { id: userId } = ctx.userinfo;

            const result = await notificationService.getUserNotifications(
                userId,
                parseInt(page),
                parseInt(pageSize)
            );

            handeleSuccessReturnMessage(ctx, '获取成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 标记通知为已读
    async markAsRead(ctx) {
        try {
            const { notificationId } = ctx.params;
            const { id: userId } = ctx.userinfo;

            const success = await notificationService.markAsRead(
                notificationId,
                userId
            );

            if (success) {
                handeleSuccessReturnMessage(ctx, '标记成功');
            } else {
                handeleErrorReturnMessage(ctx, '标记失败');
            }
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 标记所有通知为已读
    async markAllAsRead(ctx) {
        try {
            const { id: userId } = ctx.userinfo;

            const count = await notificationService.markAllAsRead(userId);
            handeleSuccessReturnMessage(ctx, '标记成功', { count });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 删除通知
    async deleteNotification(ctx) {
        try {
            const { notificationId } = ctx.params;
            const { id: userId } = ctx.userinfo;

            const success = await notificationService.deleteNotification(
                notificationId,
                userId
            );

            if (success) {
                handeleSuccessReturnMessage(ctx, '删除成功');
            } else {
                handeleErrorReturnMessage(ctx, '删除失败');
            }
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 获取未读通知数量
    async getUnreadCount(ctx) {
        try {
            const { id: userId } = ctx.userinfo;

            const count = await notificationService.getUnreadCount(userId);
            handeleSuccessReturnMessage(ctx, '获取成功', { count });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }
}

module.exports = new NotificationController();
