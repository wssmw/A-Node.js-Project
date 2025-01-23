/**
 * 分类表结构定义
 */
const categories = {
  id: 'INT PRIMARY KEY AUTO_INCREMENT',
  name: 'VARCHAR(50) NOT NULL UNIQUE COMMENT "分类名称"',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
}

module.exports = categories 