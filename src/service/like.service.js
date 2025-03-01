const connection = require('../app/database');

class LikeService {
    // 文章点赞
    async likeArticle(userId, articleId) {
        try {
            // 检查是否已经点赞
            const checkStatement = `
                SELECT id FROM article_likes 
                WHERE user_id = ? AND article_id = ?
            `;
            const [existing] = await connection.execute(checkStatement, [userId, articleId]);

            if (existing.length > 0) {
                // 如果已经点赞，则取消点赞
                const unlikeStatement = `
                    DELETE FROM article_likes 
                    WHERE user_id = ? AND article_id = ?
                `;
                await connection.execute(unlikeStatement, [userId, articleId]);
                return { action: 'unlike' };
            } else {
                // 如果未点赞，则添加点赞
                const likeStatement = `
                    INSERT INTO article_likes (user_id, article_id) 
                    VALUES (?, ?)
                `;
                await connection.execute(likeStatement, [userId, articleId]);
                return { action: 'like' };
            }
        } catch (error) {
            console.error('文章点赞操作失败:', error);
            throw error;
        }
    }

    // 取消文章点赞
    async unlikeArticle(userId, articleId) {
        const statement = `
            DELETE FROM article_likes 
            WHERE user_id = ? AND article_id = ?
        `;
        const [result] = await connection.execute(statement, [
            userId,
            articleId,
        ]);
        return result.affectedRows > 0;
    }

    // 检查用户是否已点赞文章
    async hasLikedArticle(userId, articleId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM article_likes 
            WHERE user_id = ? AND article_id = ?
        `;
        const [result] = await connection.execute(statement, [
            userId,
            articleId,
        ]);
        return result[0].count > 0;
    }

    // 评论点赞
    async likeComment(userId, commentId) {
        try {
            // 检查是否已经点赞
            const checkStatement = `
                SELECT id FROM comment_likes 
                WHERE user_id = ? AND comment_id = ?
            `;
            const [existing] = await connection.execute(checkStatement, [userId, commentId]);

            if (existing.length > 0) {
                // 如果已经点赞，则取消点赞
                const unlikeStatement = `
                    DELETE FROM comment_likes 
                    WHERE user_id = ? AND comment_id = ?
                `;
                await connection.execute(unlikeStatement, [userId, commentId]);
                return { action: 'unlike' };
            } else {
                // 如果未点赞，则添加点赞
                const likeStatement = `
                    INSERT INTO comment_likes (user_id, comment_id) 
                    VALUES (?, ?)
                `;
                await connection.execute(likeStatement, [userId, commentId]);
                return { action: 'like' };
            }
        } catch (error) {
            console.error('评论点赞操作失败:', error);
            throw error;
        }
    }

    // 取消评论点赞
    async unlikeComment(userId, commentId) {
        const statement = `
            DELETE FROM comment_likes 
            WHERE user_id = ? AND comment_id = ?
        `;
        const [result] = await connection.execute(statement, [
            userId,
            commentId,
        ]);
        return result.affectedRows > 0;
    }

    // 检查用户是否已点赞评论
    async hasLikedComment(userId, commentId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM comment_likes 
            WHERE user_id = ? AND comment_id = ?
        `;
        const [result] = await connection.execute(statement, [
            userId,
            commentId,
        ]);
        return result[0].count > 0;
    }

    // 获取文章点赞数
    async getArticleLikeCount(articleId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM article_likes 
            WHERE article_id = ?
        `;
        const [result] = await connection.execute(statement, [articleId]);
        return result[0].count;
    }

    // 获取评论点赞数
    async getCommentLikeCount(commentId) {
        const statement = `
            SELECT COUNT(*) as count 
            FROM comment_likes 
            WHERE comment_id = ?
        `;
        const [result] = await connection.execute(statement, [commentId]);
        return result[0].count;
    }

    // 获取用户点赞的文章列表
    async getUserLikedArticles(userId, offset = 0, limit = 10) {
        try {
            const statement = `
                SELECT 
                    a.id,
                    a.title,
                    a.summary,
                    a.cover_url,
                    a.created_at,
                    a.user_id as author_id,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    c.id as category_id,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
                    TRUE as has_liked
                FROM article_likes al
                JOIN articles a ON al.article_id = a.id
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE al.user_id = ?
                ORDER BY al.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const [articles] = await connection.execute(statement, [userId]);

            // 获取每篇文章的标签
            for (let article of articles) {
                const tagStatement = `
                    SELECT t.id, t.name
                    FROM tags t
                    INNER JOIN article_tags at ON t.id = at.tag_id
                    WHERE at.article_id = ?
                `;
                const [tags] = await connection.execute(tagStatement, [article.id]);
                article.tags = tags;
            }

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM article_likes 
                WHERE user_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [userId]);

            return {
                articles,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('获取用户点赞文章失败:', error);
            throw error;
        }
    }

    // 获取用户点赞的评论列表
    async getUserLikedComments(userId, offset = 0, limit = 10) {
        try {
            const statement = `
                SELECT 
                    c.id,
                    c.content,
                    c.created_at,
                    c.article_id,
                    a.title as article_title,
                    u.id as author_id,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    u.avatar_url as author_avatar,
                    (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count,
                    TRUE as has_liked
                FROM comment_likes cl
                JOIN comments c ON cl.comment_id = c.id
                JOIN users u ON c.user_id = u.id
                JOIN articles a ON c.article_id = a.id
                WHERE cl.user_id = ?
                ORDER BY cl.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const [comments] = await connection.execute(statement, [userId]);

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM comment_likes 
                WHERE user_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [userId]);

            return {
                comments,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('获取用户点赞评论失败:', error);
            throw error;
        }
    }
}

module.exports = new LikeService();
