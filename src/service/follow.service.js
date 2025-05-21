const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');
const notificationService = require('./notification.service');
const socketService = require('./socket.service');

class FollowService {
    // 关注用户
    async followUser(followerId, followingId) {
        try {
            const connection = await require('../app/database').getConnection();
            await connection.beginTransaction();

            try {
                const id = generateEntityId();
                const statement = `
                    INSERT INTO user_follows (id, follower_id, following_id)
                    VALUES (?, ?, ?)
                `;
                await connection.execute(statement, [
                    id,
                    followerId,
                    followingId,
                ]);

                // 获取关注者信息
                const [follower] = await connection.execute(
                    'SELECT id, username, nickname, avatar_url FROM users WHERE id = ?',
                    [followerId]
                );

                // 创建通知
                const notification = {
                    userId: followingId,
                    fromUserId: followerId,
                    type: 'follow_user',
                    content: `关注了你`,
                    targetId: followerId,
                    createdAt: new Date(),
                    fromUser: {
                        id: follower[0].id,
                        username: follower[0].username,
                        nickname: follower[0].nickname,
                        avatarUrl: follower[0].avatar_url,
                    },
                };

                try {
                    // 保存通知到数据库
                    await notificationService.createNotification(notification);

                    // 发送实时通知
                    socketService.sendNotification(followingId, notification);
                } catch (notificationError) {
                    console.error('通知创建或发送失败:', notificationError);
                    // 通知失败不影响关注操作，继续提交事务
                }

                await connection.commit();
                return { action: 'follow', id };
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // 如果已经关注，则取消关注
                const unfollowStatement = `
                    DELETE FROM user_follows 
                    WHERE follower_id = ? AND following_id = ?
                `;
                await connection.execute(unfollowStatement, [
                    followerId,
                    followingId,
                ]);
                return { action: 'unfollow' };
            }
            throw error;
        }
    }

    // 关注标签
    async followTag(userId, tagId) {
        try {
            const id = generateEntityId();
            const statement = `
                INSERT INTO tag_follows (id, user_id, tag_id)
                VALUES (?, ?, ?)
            `;
            await connection.execute(statement, [id, userId, tagId]);
            return { action: 'follow', id };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // 如果已经关注，则取消关注
                const unfollowStatement = `
                    DELETE FROM tag_follows 
                    WHERE user_id = ? AND tag_id = ?
                `;
                await connection.execute(unfollowStatement, [userId, tagId]);
                return { action: 'unfollow' };
            }
            throw error;
        }
    }

    // 获取用户关注的用户列表
    async getFollowingUsers(userId, offset = 0, limit = 10) {
        try {
            // 确保参数是数字类型
            const safeLimit = parseInt(limit);
            const safeOffset = parseInt(offset);

            const statement = `
                SELECT 
                    u.id,
                    u.username,
                    u.nickname,
                    u.avatar_url,
                    u.created_at as joined_at,
                    (SELECT COUNT(*) FROM articles WHERE user_id = u.id) as article_count,
                    (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as follower_count,
                    (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count
                FROM user_follows uf
                JOIN users u ON uf.following_id = u.id
                WHERE uf.follower_id = ?
                ORDER BY uf.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;
            const [users] = await connection.execute(statement, [userId]);
            return users;
        } catch (error) {
            console.error('获取关注用户列表失败:', error);
            throw error;
        }
    }

    // 获取用户关注的标签列表
    async getFollowingTags(userId, offset = 0, limit = 10) {
        try {
            // 确保参数是数字类型
            const safeLimit = parseInt(limit);
            const safeOffset = parseInt(offset);

            const statement = `
                SELECT 
                    t.id,
                    t.name,
                    t.svg_icon,
                    t.created_at,
                    t.updated_at,
                    (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count,
                    (SELECT COUNT(*) FROM tag_follows WHERE tag_id = t.id) as follower_count,
                    EXISTS(
                        SELECT 1 FROM tag_follows 
                        WHERE tag_id = t.id AND user_id = ?
                    ) as has_followed
                FROM tag_follows tf
                JOIN tags t ON tf.tag_id = t.id
                WHERE tf.user_id = ?
                ORDER BY tf.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;
            const [tags] = await connection.execute(statement, [
                userId,
                userId,
            ]);
            return tags;
        } catch (error) {
            console.error('获取关注标签列表失败:', error);
            throw error;
        }
    }

    // 检查是否关注了用户
    async hasFollowedUser(followerId, followingId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM user_follows 
            WHERE follower_id = ? AND following_id = ?
        `;
        const [result] = await connection.execute(statement, [
            followerId,
            followingId,
        ]);
        return result[0].count > 0;
    }

    // 检查是否关注了标签
    async hasFollowedTag(userId, tagId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM tag_follows 
            WHERE user_id = ? AND tag_id = ?
        `;
        const [result] = await connection.execute(statement, [userId, tagId]);
        return result[0].count > 0;
    }
}

module.exports = new FollowService();
