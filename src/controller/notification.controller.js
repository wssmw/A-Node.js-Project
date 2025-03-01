const notificationService = require('../service/notification.service');
const { handeleSuccessReturnMessage, handeleErrorReturnMessage } = require('../utils');

class NotificationController {
    // 获取通知列表
    async getNotifications(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { page = 1, pageSize = 10 } = ctx.request.body;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const notifications = await notificationService.getUserNotifications(
                userId, 
                offset, 
                parseInt(pageSize)
            );

            handeleSuccessReturnMessage(ctx, '获取成功', { notifications });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取通知失败: ' + error.message);
        }
    }

    // 标记通知为已读
    async markAsRead(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { notificationId } = ctx.request.body;

            await notificationService.markAsRead(notificationId, userId);
            handeleSuccessReturnMessage(ctx, '标记成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '标记失败: ' + error.message);
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