/**
 * 用户关注表结构定义
 */
const userFollows = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    follower_id: 'INT NOT NULL COMMENT "关注者ID"',
    following_id: 'INT NOT NULL COMMENT "被关注者ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(follower_id) REFERENCES users(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(following_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY': 'unique_follow (follower_id, following_id) COMMENT "防止重复关注"'
};

module.exports = userFollows; 