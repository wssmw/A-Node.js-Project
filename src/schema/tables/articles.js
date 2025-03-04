/**
 * 文章表结构定义
 */
const articles = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    title: 'VARCHAR(100) NOT NULL COMMENT "文章标题"',
    content: 'TEXT NOT NULL COMMENT "文章内容"',
    summary: 'VARCHAR(255) NOT NULL COMMENT "文章摘要"',
    cover_url: 'VARCHAR(255) DEFAULT NULL COMMENT "文章封面图片URL"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "作者ID"',
    category_id: 'INT NOT NULL COMMENT "分类ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(category_id) REFERENCES categories(id)',
};

module.exports = articles;
