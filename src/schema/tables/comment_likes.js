/**
 * 评论点赞表结构定义
 */
const commentLikes = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    comment_id: 'INT NOT NULL COMMENT "评论ID"',
    user_id: 'INT NOT NULL COMMENT "用户ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY':
        '(comment_id) REFERENCES comments(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY':
        'comment_like_unique (comment_id, user_id) COMMENT "确保用户对评论的点赞唯一"',
};

module.exports = commentLikes;
