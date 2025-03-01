/**
 * 文章浏览记录表结构定义
 */
const articleViews = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    article_id: 'INT NOT NULL COMMENT "文章ID"',
    user_id: 'INT DEFAULT NULL COMMENT "用户ID，未登录时为空"',
    ip: 'VARCHAR(50) NOT NULL COMMENT "访问者IP"',
    user_agent: 'VARCHAR(500) DEFAULT NULL COMMENT "浏览器信息"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(article_id) REFERENCES articles(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(user_id) REFERENCES users(id) ON DELETE SET NULL'
};

module.exports = articleViews; 