/**
 * 分类表结构定义
 */
const categories = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    name: 'VARCHAR(50) NOT NULL UNIQUE COMMENT "分类名称"',
    svg_icon: 'TEXT COMMENT "分类图标SVG"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
};

module.exports = categories;
