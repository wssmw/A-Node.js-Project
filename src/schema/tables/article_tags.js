/**
 * 文章-标签关联表结构定义
 */
const articleTags = {
  id: 'INT PRIMARY KEY AUTO_INCREMENT',
  article_id: 'INT NOT NULL COMMENT "文章ID"',
  tag_id: 'INT NOT NULL COMMENT "标签ID"',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'FOREIGN KEY': '(article_id) REFERENCES articles(id), FOREIGN KEY (tag_id) REFERENCES tags(id)',
  'UNIQUE KEY': 'article_tag_unique (article_id, tag_id) COMMENT "确保文章标签关系唯一"'
}

module.exports = articleTags 