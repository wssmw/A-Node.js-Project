/**
 * 文章浏览记录表结构定义
 */
const articleViews = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    article_id: 'VARCHAR(6) NOT NULL COMMENT "文章ID"',
    user_id: 'VARCHAR(12) DEFAULT NULL COMMENT "用户ID，未登录时为空"',
    ip: 'VARCHAR(50) NOT NULL COMMENT "访问者IP"',
    user_agent: 'VARCHAR(500) DEFAULT NULL COMMENT "浏览器信息"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(article_id) REFERENCES articles(id)',
    'FOREIGN KEY ': '(user_id) REFERENCES users(id)',
};

module.exports = articleViews;
