/**
 * 标签关注表结构定义
 */
const tagFollows = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    user_id: 'INT NOT NULL COMMENT "用户ID"',
    tag_id: 'INT NOT NULL COMMENT "标签ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(tag_id) REFERENCES tags(id) ON DELETE CASCADE',
    'UNIQUE KEY': 'unique_follow (user_id, tag_id) COMMENT "防止重复关注"'
};

module.exports = tagFollows; 