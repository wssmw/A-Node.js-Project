/**
 * 文章表结构定义
 */
const articles = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    title: 'VARCHAR(100) NOT NULL COMMENT "文章标题"',
    content: 'TEXT NOT NULL COMMENT "文章内容"',
    summary: 'VARCHAR(255) NOT NULL COMMENT "文章摘要"',
    cover_url: 'VARCHAR(255) DEFAULT NULL COMMENT "文章封面图片URL"',
    user_id: 'INT NOT NULL COMMENT "作者ID"',
    category_id: 'INT NOT NULL COMMENT "分类ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新时间"',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(category_id) REFERENCES categories(id)'
};

module.exports = articles;
