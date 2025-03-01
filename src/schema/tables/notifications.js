/**
 * 通知表结构定义
 */
const notifications = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    user_id: 'INT NOT NULL COMMENT "接收通知的用户ID"',
    from_user_id: 'INT NOT NULL COMMENT "触发通知的用户ID"',
    type: 'VARCHAR(50) NOT NULL COMMENT "通知类型：like_article/like_comment/comment_article/reply_comment"',
    content: 'TEXT COMMENT "通知内容"',
    target_id: 'INT COMMENT "相关的目标ID（文章ID/评论ID等）"',
    is_read: 'BOOLEAN DEFAULT FALSE COMMENT "是否已读"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(from_user_id) REFERENCES users(id) ON DELETE CASCADE'
};

module.exports = notifications; 