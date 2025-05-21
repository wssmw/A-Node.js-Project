/**
 * 文章-标签关联表结构定义
 */
const articleTags = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    article_id: 'VARCHAR(6) NOT NULL COMMENT "文章ID"',
    tag_id: 'INT NOT NULL COMMENT "标签ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(article_id) REFERENCES articles(id)',
    'FOREIGN KEY ': '(tag_id) REFERENCES tags(id)',
    'UNIQUE KEY': 'article_tag (article_id, tag_id) COMMENT "防止重复添加标签"',
};

module.exports = articleTags;
