/**
 * 工具分类表结构定义
 */
const toolCategories = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    category: 'VARCHAR(50) NOT NULL COMMENT "分类名称"',
    icon_url: 'VARCHAR(255) NOT NULL COMMENT "分类图标URL"',
    svg_icon: 'TEXT COMMENT "分类图标SVG"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
};

module.exports = toolCategories;
