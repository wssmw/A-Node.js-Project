/**
 * 用户详情表结构定义
 */
const userProfiles = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    user_id: 'VARCHAR(12) NOT NULL UNIQUE COMMENT "用户ID"',
    bio: 'TEXT DEFAULT NULL COMMENT "个人简介"',
    qq: 'VARCHAR(20) DEFAULT NULL COMMENT "QQ号"',
    wechat: 'VARCHAR(50) DEFAULT NULL COMMENT "微信号"',
    github: 'VARCHAR(100) DEFAULT NULL COMMENT "GitHub主页"',
    website: 'VARCHAR(255) DEFAULT NULL COMMENT "个人网站"',
    location: 'VARCHAR(100) DEFAULT NULL COMMENT "所在地"',
    occupation: 'VARCHAR(100) DEFAULT NULL COMMENT "职业"',
    company: 'VARCHAR(100) DEFAULT NULL COMMENT "公司"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id) ON DELETE CASCADE',
};

module.exports = userProfiles;
