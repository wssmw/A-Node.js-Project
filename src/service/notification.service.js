const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class NotificationService {
    // 创建通知
    async createNotification(data) {
        console.log('createNotification', data);
        try {
            const {
                userId, // 接收通知的用户
                fromUserId, // 触发通知的用户
                type, // 通知类型
                content, // 通知内容
                targetId, // 相关的目标ID
            } = data;

            const id = generateEntityId();

            const statement = `
                INSERT INTO notifications 
                (id, user_id, from_user_id, type, content, target_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(statement, [
                id,
                userId,
                fromUserId,
                type,
                content,
                targetId,
            ]);

            if (!result.insertId) {
                console.error('通知创建失败:', data);
                throw new Error('通知创建失败');
            }

            return { ...result, id };
        } catch (error) {
            console.error('创建通知失败:', error);
            throw error;
        }
    }

    // 获取用户的通知列表
    async getUserNotifications(userId, offset = 0, limit = 10) {
        const statement = `
            SELECT 
                n.*,
                u.username as from_username,
                u.nickname as from_nickname,
                u.avatar_url as from_avatar
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        const [notifications] = await connection.execute(statement, [userId]);
        return notifications;
    }

    // 标记通知为已读
    async markAsRead(notificationId, userId) {
        const statement = `
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = ? AND user_id = ?
        `;
        await connection.execute(statement, [notificationId, userId]);
    }

    // 获取未读通知数量
    async getUnreadCount(userId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = ? AND is_read = FALSE
        `;
        const [result] = await connection.execute(statement, [userId]);
        return result[0].count;
    }
}

module.exports = new NotificationService();
