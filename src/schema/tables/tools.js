/**
 * 工具表结构定义
 */
const tools = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    category_id: 'INT NOT NULL COMMENT "所属分类ID"',
    name: 'VARCHAR(100) NOT NULL COMMENT "工具名称"',
    description: 'VARCHAR(1000) NOT NULL COMMENT "工具描述"',
    icon_url: 'VARCHAR(255) COMMENT "工具图标URL"',
    svg_icon: 'TEXT COMMENT "分类图标SVG"',
    website: 'VARCHAR(255) NOT NULL COMMENT "工具网站URL"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at:
        'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(category_id) REFERENCES tool_categories(id)',
};

module.exports = tools;
