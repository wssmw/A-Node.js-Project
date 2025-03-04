/**
 * 用户关注表结构定义
 */
const userFollows = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    follower_id: 'VARCHAR(12) NOT NULL COMMENT "关注者ID"',
    following_id: 'VARCHAR(12) NOT NULL COMMENT "被关注者ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(follower_id) REFERENCES users(id)',
    'FOREIGN KEY ': '(following_id) REFERENCES users(id)',
    'UNIQUE KEY':
        'unique_follow (follower_id, following_id) COMMENT "防止重复关注"',
};

module.exports = userFollows;
