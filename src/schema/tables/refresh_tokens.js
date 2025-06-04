/**
 * 刷新令牌表结构定义
 */
const refreshTokens = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "用户ID"',
    token: 'TEXT NOT NULL COMMENT "刷新令牌"',
    expires_at: 'TIMESTAMP NOT NULL COMMENT "过期时间"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY': 'unique_token (token(255)) COMMENT "确保令牌唯一"',
};

module.exports = refreshTokens;
