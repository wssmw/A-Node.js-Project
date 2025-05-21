/**
 * 评论点赞表结构定义
 */
const commentLikes = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    comment_id: 'VARCHAR(6) NOT NULL COMMENT "评论ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "用户ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY':
        'comment_user_like (comment_id, user_id) COMMENT "防止重复点赞"',
};

module.exports = commentLikes;
