/**
 * AI消息表结构定义
 */
const aiMessages = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    conversation_id: 'VARCHAR(6) NOT NULL COMMENT "对话ID"',
    role: 'VARCHAR(20) NOT NULL COMMENT "角色：user-用户, assistant-AI助手"',
    content: 'TEXT NOT NULL COMMENT "消息内容"',
    sequence: 'INT NOT NULL COMMENT "消息序号，用于在同一对话中保持消息顺序"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE',
};

module.exports = aiMessages;

