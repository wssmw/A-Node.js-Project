/**
 * 收藏夹-文章关联表结构定义
 */
const collectionArticles = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    collection_id: 'INT NOT NULL COMMENT "收藏夹ID"',
    article_id: 'INT NOT NULL COMMENT "文章ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY': '(collection_id) REFERENCES collections(id) ON DELETE CASCADE',
    'FOREIGN KEY ': '(article_id) REFERENCES articles(id) ON DELETE CASCADE',
    'UNIQUE KEY': 'collection_article (collection_id, article_id) COMMENT "防止重复收藏"'
};

module.exports = collectionArticles; 