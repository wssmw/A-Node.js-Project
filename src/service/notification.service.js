const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class NotificationService {
    // 获取所有通知
    async getNotifications(userId, page = 1, pageSize = 10, type = null) {
        // 确保参数是数字类型
        const safePage = parseInt(page);
        const safePageSize = parseInt(pageSize);
        const offset = (safePage - 1) * safePageSize;

        let statement = `
            SELECT 
                n.*,
                u.username as from_username,
                u.nickname as from_nickname,
                u.avatar_url as from_avatar,
                CASE 
                    WHEN n.type = 'comment_article' THEN (
                        SELECT JSON_OBJECT(
                            'title', a.title,
                            'content', c.content
                        )
                        FROM articles a
                        LEFT JOIN comments c ON n.target_id = c.article_id AND c.user_id = n.from_user_id
                        WHERE a.id = n.target_id
                    )
                    WHEN n.type = 'reply_comment' THEN (
                        SELECT JSON_OBJECT(
                            'title', a.title,
                            'content', c.content,
                            'parentContent', pc.content
                        )
                        FROM articles a
                        LEFT JOIN comments c ON n.target_id = c.article_id AND c.user_id = n.from_user_id
                        LEFT JOIN comments pc ON c.parent_id = pc.id
                        WHERE a.id = n.target_id
                    )
                    ELSE NULL
                END as extra_content
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            WHERE n.user_id = ?
        `;

        const params = [userId];

        // 如果指定了通知类型，添加类型过滤
        if (type) {
            if (Array.isArray(type)) {
                // 如果是数组，使用 IN 查询，将数组展开为多个问号
                const placeholders = type.map(() => '?').join(',');
                statement += ` AND n.type IN (${placeholders})`;
                params.push(...type);
            } else {
                // 如果是单个类型，使用等号查询
                statement += ' AND n.type = ?';
                params.push(type);
            }
        }

        statement += ` ORDER BY n.created_at DESC LIMIT ${offset},${safePageSize}`;
        const [notifications] = await connection.execute(statement, params);
        // 获取总数
        let countStatement = `
            SELECT COUNT(*) as total 
            FROM notifications 
            WHERE user_id = ?
        `;
        const countParams = [userId];

        if (type) {
            if (Array.isArray(type)) {
                // 如果是数组，使用 IN 查询，将数组展开为多个问号
                const placeholders = type.map(() => '?').join(',');
                countStatement += ` AND type IN (${placeholders})`;
                countParams.push(...type);
            } else {
                // 如果是单个类型，使用等号查询
                countStatement += ' AND type = ?';
                countParams.push(type);
            }
        }

        const [countResult] = await connection.execute(
            countStatement,
            countParams
        );

        // 处理通知数据，添加额外内容
        const processedNotifications = notifications.map(notification => {
            const result = {
                ...notification,
                fromUser: {
                    id: notification.from_user_id,
                    username: notification.from_username,
                    nickname: notification.from_nickname,
                    avatarUrl: notification.from_avatar,
                },
            };

            // 删除原始字段
            delete result.from_user_id;
            delete result.from_username;
            delete result.from_nickname;
            delete result.from_avatar;

            // 处理额外内容
            if (notification.extra_content) {
                try {
                    const extraContent = notification.extra_content;
                    if (notification.type === 'comment_article') {
                        result.articleTitle = extraContent.title;
                        result.commentContent = extraContent.content;
                    } else if (notification.type === 'reply_comment') {
                        result.articleTitle = extraContent.title;
                        result.commentContent = extraContent.content;
                        result.parentCommentContent =
                            extraContent.parentContent;
                    }
                } catch (error) {
                    console.error('解析额外内容失败:', error);
                }
            }
            delete result.extra_content;
            return result;
        });

        return {
            notifications: processedNotifications,
            total: countResult[0].total,
            page: safePage,
            pageSize: safePageSize,
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
        // 确保参数是数字类型
        const safePage = parseInt(page);
        const safePageSize = parseInt(pageSize);
        const offset = (safePage - 1) * safePageSize;

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
            safePageSize,
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
            page: safePage,
            pageSize: safePageSize,
        };
    }

    // 标记通知为已读
    async markAsRead(notificationId, userId, type = null) {
        // 如果没有提供任何参数，直接返回
        if (!notificationId && !userId && !type) {
            return 0;
        }

        let statement = `
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = ?
        `;
        const params = [userId];

        if (notificationId) {
            // 如果提供了通知ID，则只标记该通知
            statement += ' AND id = ?';
            params.push(notificationId);
        } else if (type) {
            // 如果提供了类型，则标记该类型的所有通知
            if (Array.isArray(type)) {
                // 如果是数组，使用 IN 查询
                const placeholders = type.map(() => '?').join(',');
                statement += ` AND type IN (${placeholders})`;
                params.push(...type);
            } else {
                // 如果是单个类型，使用等号查询
                statement += ' AND type = ?';
                params.push(type);
            }
        } else {
            // 如果没有提供任何参数，则标记所有通知
            statement += ' AND is_read = false';
        }

        const [result] = await connection.execute(statement, params);
        return result.affectedRows;
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
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN type = 'like_article' THEN 1 ELSE 0 END) as like_article_count,
                SUM(CASE WHEN type = 'like_comment' THEN 1 ELSE 0 END) as like_comment_count,
                SUM(CASE WHEN type = 'comment_article' THEN 1 ELSE 0 END) as comment_article_count,
                SUM(CASE WHEN type = 'reply_comment' THEN 1 ELSE 0 END) as reply_comment_count,
                SUM(CASE WHEN type = 'follow_user' THEN 1 ELSE 0 END) as follow_user_count,
                SUM(CASE WHEN type = 'collect_article' THEN 1 ELSE 0 END) as collect_article_count
            FROM notifications 
            WHERE user_id = ? AND is_read = false
        `;
        const [result] = await connection.execute(statement, [userId]);
        return {
            total: result[0].total || 0,
            byType: {
                like_article: result[0].like_article_count || 0,
                like_comment: result[0].like_comment_count || 0,
                comment_article: result[0].comment_article_count || 0,
                reply_comment: result[0].reply_comment_count || 0,
                follow_user: result[0].follow_user_count || 0,
                collect_article: result[0].collect_article_count || 0,
            },
        };
    }
}

module.exports = new NotificationService();
