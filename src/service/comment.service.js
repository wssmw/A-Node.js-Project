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

        // 删除此评论及其所有回复
        const statement = `DELETE FROM comments WHERE id = ? OR parent_id = ?`;
        const [result] = await connection.execute(statement, [commentId, commentId]);
        return result;
    }

    // 获取文章的评论列表
    async getByArticleId(articleId) {
        // 获取主评论
        const statement = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                c.user_id,
                u.username,
                u.nickname,
                u.avatar_url,
                (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as reply_count
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ? AND c.parent_id IS NULL
            ORDER BY c.created_at DESC
        `;
        const [mainComments] = await connection.execute(statement, [articleId]);

        // 获取所有回复（包括回复主评论的和回复回复的）
        for (let comment of mainComments) {
            const replyStatement = `
                WITH RECURSIVE reply_chain AS (
                    -- 直接回复主评论的评论
                    SELECT 
                        c.id,
                        c.content,
                        c.created_at,
                        c.parent_id,
                        c.user_id,
                        u.username,
                        u.nickname,
                        u.avatar_url,
                        parent_c.user_id as reply_to_user_id,
                        parent_u.username as reply_to_username,
                        parent_u.nickname as reply_to_nickname,
                        parent_u.avatar_url as reply_to_avatar_url,
                        ? as root_comment_id
                    FROM comments c
                    LEFT JOIN users u ON c.user_id = u.id
                    LEFT JOIN comments parent_c ON c.parent_id = parent_c.id
                    LEFT JOIN users parent_u ON parent_c.user_id = parent_u.id
                    WHERE c.parent_id = ?

                    UNION ALL

                    -- 回复其他回复的评论
                    SELECT 
                        c.id,
                        c.content,
                        c.created_at,
                        c.parent_id,
                        c.user_id,
                        u.username,
                        u.nickname,
                        u.avatar_url,
                        parent_c.user_id as reply_to_user_id,
                        parent_u.username as reply_to_username,
                        parent_u.nickname as reply_to_nickname,
                        parent_u.avatar_url as reply_to_avatar_url,
                        rc.root_comment_id
                    FROM comments c
                    LEFT JOIN users u ON c.user_id = u.id
                    LEFT JOIN comments parent_c ON c.parent_id = parent_c.id
                    LEFT JOIN users parent_u ON parent_c.user_id = parent_u.id
                    INNER JOIN reply_chain rc ON c.parent_id = rc.id
                )
                SELECT * FROM reply_chain
                ORDER BY created_at ASC
            `;
            const [replies] = await connection.execute(replyStatement, [comment.id, comment.id]);

            // 格式化评论数据
            comment.user = {
                id: comment.user_id,
                username: comment.username,
                nickname: comment.nickname,
                avatar_url: comment.avatar_url
            };

            // 格式化回复数据
            comment.replies = replies.map(reply => ({
                id: reply.id,
                content: reply.content,
                created_at: reply.created_at,
                user: {
                    id: reply.user_id,
                    username: reply.username,
                    nickname: reply.nickname,
                    avatar_url: reply.avatar_url
                },
                reply_to: {
                    id: reply.reply_to_user_id,
                    username: reply.reply_to_username,
                    nickname: reply.reply_to_nickname,
                    avatar_url: reply.reply_to_avatar_url
                }
            }));

            // 删除多余的字段
            delete comment.user_id;
            delete comment.username;
            delete comment.nickname;
            delete comment.avatar_url;
        }

        // 获取主评论总数
        const countStatement = `
            SELECT COUNT(*) as total 
            FROM comments 
            WHERE article_id = ? AND parent_id IS NULL
        `;
        const [countResult] = await connection.execute(countStatement, [articleId]);

        return {
            comments: mainComments,
            total: countResult[0].total
        };
    }

    // 获取评论详情
    async getById(commentId) {
        const statement = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                c.parent_id,
                c.user_id,
                u.username,
                u.nickname,
                u.avatar_url
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
        const [result] = await connection.execute(statement, [commentId]);

        if (result[0]) {
            const comment = {
                id: result[0].id,
                content: result[0].content,
                created_at: result[0].created_at,
                parent_id: result[0].parent_id,
                user: {
                    id: result[0].user_id,
                    username: result[0].username,
                    nickname: result[0].nickname,
                    avatar_url: result[0].avatar_url
                }
            };

            // 如果是回复，获取被回复的评论信息
            if (comment.parent_id) {
                const parentStatement = `
                    SELECT 
                        c.id,
                        c.user_id,
                        u.username,
                        u.nickname,
                        u.avatar_url
                    FROM comments c
                    LEFT JOIN users u ON c.user_id = u.id
                    WHERE c.id = ?
                `;
                const [parentResult] = await connection.execute(parentStatement, [comment.parent_id]);
                if (parentResult[0]) {
                    comment.reply_to = {
                        id: parentResult[0].user_id,
                        username: parentResult[0].username,
                        nickname: parentResult[0].nickname,
                        avatar_url: parentResult[0].avatar_url
                    };
                }
            }

            return comment;
        }
        
        return null;
    }
}

module.exports = new CommentService(); 