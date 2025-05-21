const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');
const notificationService = require('./notification.service');
const socketService = require('./socket.service');

class CollectionService {
    // 创建收藏夹
    async createCollection(userId, name, description = null, isPublic = true) {
        const id = generateEntityId();
        const statement = `
            INSERT INTO collections (id, user_id, name, description, is_public)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(statement, [
            id,
            userId,
            name,
            description,
            isPublic,
        ]);
        return { ...result, id };
    }

    // 更新收藏夹
    async updateCollection(collectionId, userId, updates) {
        const allowedFields = ['name', 'description', 'is_public'];
        const updateFields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (updateFields.length === 0) return null;

        const statement = `
            UPDATE collections 
            SET ${updateFields.join(', ')}
            WHERE id = ? AND user_id = ?
        `;
        values.push(collectionId, userId);

        const [result] = await connection.execute(statement, values);
        return result;
    }

    // 删除收藏夹
    async deleteCollection(collectionId, userId) {
        const statement = `
            DELETE FROM collections 
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await connection.execute(statement, [
            collectionId,
            userId,
        ]);
        return result;
    }

    // 获取当前用户的收藏夹列表（包括私密的）
    async getCurrentUserCollections(userId) {
        const statement = `
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM collection_articles WHERE collection_id = c.id) as article_count
            FROM collections c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        const [collections] = await connection.execute(statement, [userId]);
        return collections;
    }

    // 获取其他用户的收藏夹列表（只能看到公开的）
    async getOtherUserCollections(userId) {
        const statement = `
            SELECT 
                c.*,
                u.username as creator_name,
                u.nickname as creator_nickname,
                (SELECT COUNT(*) FROM collection_articles WHERE collection_id = c.id) as article_count
            FROM collections c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND c.is_public = true
            ORDER BY c.created_at DESC
        `;
        const [collections] = await connection.execute(statement, [userId]);
        return collections;
    }

    // 获取收藏夹详情
    async getCollectionById(collectionId, userId = null) {
        const statement = `
            SELECT 
                c.*,
                u.username as creator_name,
                u.nickname as creator_nickname,
                (SELECT COUNT(*) FROM collection_articles WHERE collection_id = c.id) as article_count
            FROM collections c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ? AND (c.is_public = true OR c.user_id = ?)
        `;
        const [collections] = await connection.execute(statement, [
            collectionId,
            userId,
        ]);
        return collections[0];
    }

    // 添加文章到收藏夹
    async addArticleToCollection(collectionId, articleId, userId) {
        const connection = await require('../app/database').getConnection();
        await connection.beginTransaction();

        try {
            // 1. 检查收藏夹权限
            const collection = await this.getCollectionById(
                collectionId,
                userId
            );
            if (!collection || collection.user_id !== userId) {
                throw new Error('没有权限操作此收藏夹');
            }

            // 2. 添加文章到收藏夹
            const id = generateEntityId();
            const statement = `
                INSERT INTO collection_articles (id, collection_id, article_id)
                VALUES (?, ?, ?)
            `;
            await connection.execute(statement, [id, collectionId, articleId]);

            // 3. 获取文章信息
            const [article] = await connection.execute(
                'SELECT user_id, title FROM articles WHERE id = ?',
                [articleId]
            );

            // 4. 创建通知
            if (article[0] && article[0].user_id !== userId) {
                // 获取收藏者信息
                const [collector] = await connection.execute(
                    'SELECT id, username, nickname, avatar_url FROM users WHERE id = ?',
                    [userId]
                );

                const notification = {
                    userId: article[0].user_id,
                    fromUserId: userId,
                    type: 'collect_article',
                    content: `收藏了你的文章《${article[0].title}》`,
                    targetId: articleId,
                    createdAt: new Date(),
                    fromUser: {
                        id: collector[0].id,
                        username: collector[0].username,
                        nickname: collector[0].nickname,
                        avatarUrl: collector[0].avatar_url,
                    },
                };

                try {
                    // 保存通知到数据库
                    await notificationService.createNotification(notification);

                    // 发送实时通知
                    socketService.sendNotification(
                        article[0].user_id,
                        notification
                    );
                } catch (notificationError) {
                    console.error('通知创建或发送失败:', notificationError);
                    // 通知失败不影响收藏操作，继续提交事务
                }
            }

            await connection.commit();
            return { id };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 从收藏夹移除文章
    async removeArticleFromCollection(collectionId, articleId, userId) {
        // 检查收藏夹权限
        const collection = await this.getCollectionById(collectionId, userId);
        if (!collection || collection.user_id !== userId) {
            throw new Error('没有权限操作此收藏夹');
        }

        const statement = `
            DELETE FROM collection_articles 
            WHERE collection_id = ? AND article_id = ?
        `;
        const [result] = await connection.execute(statement, [
            collectionId,
            articleId,
        ]);
        return result;
    }

    // 获取收藏夹中的文章列表
    async getCollectionArticles(
        collectionId,
        userId = null,
        offset = 0,
        limit = 10
    ) {
        try {
            // 确保参数是数字类型
            const safeCollectionId = parseInt(collectionId);
            const safeLimit = parseInt(limit);
            const safeOffset = parseInt(offset);

            // 检查访问权限
            const collection = await this.getCollectionById(
                safeCollectionId,
                userId
            );
            if (!collection) {
                throw new Error('收藏夹不存在或无权访问');
            }

            const statement = `
                SELECT 
                    a.*,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
                    ca.created_at as collected_at
                FROM collection_articles ca
                JOIN articles a ON ca.article_id = a.id
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE ca.collection_id = ?
                ORDER BY ca.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [articles] = await connection.execute(statement, [
                safeCollectionId,
            ]);

            // 获取每篇文章的标签
            for (let article of articles) {
                const tagStatement = `
                    SELECT t.id, t.name
                    FROM tags t
                    INNER JOIN article_tags at ON t.id = at.tag_id
                    WHERE at.article_id = ?
                `;
                const [tags] = await connection.execute(tagStatement, [
                    article.id,
                ]);
                article.tags = tags;
            }

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM collection_articles 
                WHERE collection_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [
                safeCollectionId,
            ]);

            return {
                articles,
                total: countResult[0].total,
            };
        } catch (error) {
            console.error('获取收藏夹文章失败:', error);
            throw error;
        }
    }
}

module.exports = new CollectionService();
