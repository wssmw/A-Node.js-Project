const notes = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "作者ID"',
    title: 'VARCHAR(100) NOT NULL COMMENT "小记标题"',
    content: 'TEXT NOT NULL COMMENT "小记内容"',
    weather: 'VARCHAR(20) DEFAULT NULL COMMENT "天气"',
    note_time: 'DATETIME NOT NULL COMMENT "用户选择的时间"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(user_id) REFERENCES users(id)',
};

module.exports = notes; 