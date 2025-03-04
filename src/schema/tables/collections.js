/**
 * 收藏夹表结构定义
 */
const collections = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    name: 'VARCHAR(100) NOT NULL COMMENT "收藏夹名称"',
    description: 'TEXT DEFAULT NULL COMMENT "收藏夹描述"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "创建者ID"',
    is_public: 'BOOLEAN DEFAULT true COMMENT "是否公开"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
};

module.exports = collections;
