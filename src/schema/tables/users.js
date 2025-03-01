/**
 * 用户表结构定义
 */
const users = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    username: 'VARCHAR(30) NOT NULL UNIQUE COMMENT "账号"',
    password: 'VARCHAR(255) NOT NULL COMMENT "密码"',
    nickname: 'VARCHAR(30) DEFAULT NULL COMMENT "昵称，如果为空则使用username"',
    avatar_url: 'VARCHAR(255) DEFAULT NULL COMMENT "头像地址"',
    email: 'VARCHAR(100) DEFAULT NULL COMMENT "邮箱"',
    phone: 'VARCHAR(20) DEFAULT NULL COMMENT "手机号"',
    role: 'TINYINT DEFAULT 1 COMMENT "角色：1-普通用户 2-管理员"',
    status: 'TINYINT DEFAULT 1 COMMENT "状态：1-正常 2-禁用"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
};

module.exports = users;
