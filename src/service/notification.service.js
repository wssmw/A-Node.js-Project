const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class NotificationService {
    // 获取所有通知
    async getNotifications(userId, page = 1, pageSize = 10, type = null) {
        const offset = (page - 1) * pageSize;
        let statement = `
            SELECT 
                n.*,
                u.username as from_username,
                u.nickname as from_nickname,
                u.avatar_url as from_avatar
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            WHERE n.user_id = ?
        `;

        const params = [userId];

        // 如果指定了通知类型，添加类型过滤
        if (type) {
            statement += ' AND n.type = ?';
            params.push(type);
        }

        statement += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const [notifications] = await connection.execute(statement, params);

        // 获取总数
        let countStatement = `
            SELECT COUNT(*) as total 
            FROM notifications 
            WHERE user_id = ?
        `;
        const countParams = [userId];

        if (type) {
            countStatement += ' AND type = ?';
            countParams.push(type);
        }

        const [countResult] = await connection.execute(
            countStatement,
            countParams
        );

        return {
            notifications,
            total: countResult[0].total,
            page,
            pageSize,
            type,
        };
    }

    // 创建通知
    async createNotification(notification) {
        const id = generateEntityId();
        const statement = `
            INSERT INTO notifications (
                id, user_id, from_user_id, type, content, 
                target_id, is_read, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        console.log(notification, 'notification');
        const [result] = await connection.execute(statement, [
            id,
            notification.userId,
            notification.fromUserId,
            notification.type,
            notification.content,
            notification.targetId,
            false,
            notification.createdAt,
        ]);

        return result.insertId;
    }

    // 获取用户的通知列表
    async getUserNotifications(userId, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
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
            LIMIT ? OFFSET ?
        `;

        const [notifications] = await connection.execute(statement, [
            userId,
            pageSize,
            offset,
        ]);

        // 获取总数
        const countStatement = `
            SELECT COUNT(*) as total 
            FROM notifications 
            WHERE user_id = ?
        `;
        const [countResult] = await connection.execute(countStatement, [
            userId,
        ]);

        return {
            notifications,
            total: countResult[0].total,
            page,
            pageSize,
        };
    }

    // 标记通知为已读
    async markAsRead(notificationId, userId) {
        const statement = `
            UPDATE notifications 
            SET is_read = true 
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await connection.execute(statement, [
            notificationId,
            userId,
        ]);
        return result.affectedRows > 0;
    }

    // 标记所有通知为已读
    async markAllAsRead(userId) {
        const statement = `
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = ? AND is_read = false
        `;
        const [result] = await connection.execute(statement, [userId]);
        return result.affectedRows;
    }

    // 删除通知
    async deleteNotification(notificationId, userId) {
        const statement = `
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await connection.execute(statement, [
            notificationId,
            userId,
        ]);
        return result.affectedRows > 0;
    }

    // 获取未读通知数量
    async getUnreadCount(userId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = ? AND is_read = false
        `;
        const [result] = await connection.execute(statement, [userId]);
        return result[0].count;
    }
}

module.exports = new NotificationService();
