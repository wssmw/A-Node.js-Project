/**
 * 标签表结构定义
 */
const tags = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    name: 'VARCHAR(50) NOT NULL UNIQUE COMMENT "标签名称"',
    svg_icon: 'TEXT DEFAULT NULL COMMENT "标签SVG图标"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
};

module.exports = tags;
