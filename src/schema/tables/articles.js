/**
 * 文章表结构定义
 */
const articles = {
  id: 'INT PRIMARY KEY AUTO_INCREMENT',
  title: 'VARCHAR(255) NOT NULL COMMENT "文章标题"',
  content: 'TEXT NOT NULL COMMENT "文章内容"',
  summary: 'TEXT NOT NULL COMMENT "文章摘要"',
  category_id: 'INT NOT NULL COMMENT "分类ID"',
  user_id: 'INT NOT NULL COMMENT "作者ID"',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'FOREIGN KEY': '(user_id) REFERENCES users(id), FOREIGN KEY (category_id) REFERENCES categories(id)'
}

module.exports = articles  