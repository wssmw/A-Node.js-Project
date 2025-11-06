/**
 * AI对话表结构定义
 */
const aiConversations = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "用户ID"',
    title: 'VARCHAR(255) DEFAULT NULL COMMENT "对话标题，默认为第一条消息的前50个字符"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
};

module.exports = aiConversations;

