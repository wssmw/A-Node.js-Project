const connection = require('../app/database');

class CommentService {
    // 创建评论
    async create(userId, articleId, content, parentId = null) {
        const statement = `
            INSERT INTO comments (user_id, article_id, content, parent_id)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await connection.execute(statement, [userId, articleId, content, parentId]);
        return result;
    }

    // 删除评论
    async remove(commentId, userId) {
        // 检查是否是评论作者
        const checkStatement = `SELECT user_id FROM comments WHERE id = ?`;
        const [checkResult] = await connection.execute(checkStatement, [commentId]);
        
        if (checkResult.length === 0) {
            throw new Error('评论不存在');
        }
        
        if (checkResult[0].user_id !== userId) {
            throw new Error('无权删除此评论');
        }

        const statement = `DELETE FROM comments WHERE id = ?`;
        const [result] = await connection.execute(statement, [commentId]);
        return result;
    }

    // 获取文章的评论列表
    async getByArticleId(articleId) {
        const statement = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                c.parent_id,
                u.id as user_id,
                u.username,
                u.nickname,
                u.avatar_url
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at DESC
        `;
        const [result] = await connection.execute(statement, [articleId]);
        
        // 构建评论树结构
        const commentMap = new Map();
        const rootComments = [];

        // 首先将所有评论放入 Map
        result.forEach(comment => {
            commentMap.set(comment.id, {...comment, replies: []});
        });

        // 构建树结构
        result.forEach(comment => {
            if (comment.parent_id) {
                const parentComment = commentMap.get(comment.parent_id);
                if (parentComment) {
                    parentComment.replies.push(commentMap.get(comment.id));
                }
            } else {
                rootComments.push(commentMap.get(comment.id));
            }
        });

        return rootComments;
    }

    // 获取评论详情
    async getById(commentId) {
        const statement = `
            SELECT 
                c.*,
                u.username,
                u.nickname,
                u.avatar_url
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
        const [result] = await connection.execute(statement, [commentId]);
        return result[0];
    }
}

module.exports = new CommentService(); 