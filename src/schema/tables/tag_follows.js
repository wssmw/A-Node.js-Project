/**
 * 标签关注表结构定义
 */
const tagFollows = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "用户ID"',
    tag_id: 'INT NOT NULL COMMENT "标签ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(tag_id) REFERENCES tags(id)',
    'UNIQUE KEY': 'unique_follow (user_id, tag_id) COMMENT "防止重复关注"',
};

module.exports = tagFollows;
