/**
 * 评论表结构定义
 */
const comments = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    content: 'TEXT NOT NULL COMMENT "评论内容"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "评论者ID"',
    article_id: 'VARCHAR(6) NOT NULL COMMENT "文章ID"',
    parent_id: 'VARCHAR(6) DEFAULT NULL COMMENT "父评论ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(article_id) REFERENCES articles(id)',
    'FOREIGN KEY  ': '(parent_id) REFERENCES comments(id)',
};

module.exports = comments;
