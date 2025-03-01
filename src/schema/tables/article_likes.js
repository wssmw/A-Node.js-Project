/**
 * 文章点赞表结构定义
 */
const articleLikes = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    article_id: 'INT NOT NULL COMMENT "文章ID"',
    user_id: 'INT NOT NULL COMMENT "用户ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY':
        '(article_id) REFERENCES articles(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY':
        'article_like_unique (article_id, user_id) COMMENT "确保用户对文章的点赞唯一"',
};

module.exports = articleLikes;
