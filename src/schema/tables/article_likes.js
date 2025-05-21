/**
 * 文章点赞表结构定义
 */
const articleLikes = {
    id: 'VARCHAR(6) PRIMARY KEY COMMENT "6位随机字符串ID"',
    article_id: 'VARCHAR(6) NOT NULL COMMENT "文章ID"',
    user_id: 'VARCHAR(12) NOT NULL COMMENT "用户ID"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'FOREIGN KEY':
        '(article_id) REFERENCES articles(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'UNIQUE KEY':
        'article_like_unique (article_id, user_id) COMMENT "确保用户对文章的点赞唯一"',
};

module.exports = articleLikes;
