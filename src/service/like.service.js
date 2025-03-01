const connection = require('../app/database');

class LikeService {
    // 文章点赞
    async likeArticle(userId, articleId) {
        try {
            const statement = `
                INSERT INTO article_likes (user_id, article_id)
                VALUES (?, ?)
            `;
            await connection.execute(statement, [userId, articleId]);
            return true;
        } catch (error) {
            // 如果是唯一键冲突，说明已经点赞过
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
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
            const statement = `
                INSERT INTO comment_likes (user_id, comment_id)
                VALUES (?, ?)
            `;
            await connection.execute(statement, [userId, commentId]);
            return true;
        } catch (error) {
            // 如果是唯一键冲突，说明已经点赞过
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
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
}

module.exports = new LikeService();
