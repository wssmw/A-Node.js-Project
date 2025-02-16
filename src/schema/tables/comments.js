/**
 * 评论表结构定义
 */
const comments = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    content: 'TEXT NOT NULL COMMENT "评论内容"',
    user_id: 'INT NOT NULL COMMENT "评论者ID"',
    article_id: 'INT NOT NULL COMMENT "文章ID"',
    parent_id: 'INT DEFAULT NULL COMMENT "父评论ID，用于回复功能"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间"',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(article_id) REFERENCES articles(id)',
    'FOREIGN KEY  ': '(parent_id) REFERENCES comments(id)'
};

module.exports = comments; 