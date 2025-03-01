const connection = require('../app/database');

class ArticleService {
    async createArticle(articleData) {
        const {
            title,
            content,
            summary,
            tags = [],
            category,
            userId,
            cover_url = null,
        } = articleData;

        // 获取连接
        const connection = await require('../app/database').getConnection();

        try {
            // 开启事务
            await connection.beginTransaction();

            // 1. 创建文章
            const [articleResult] = await connection.execute(
                `
        INSERT INTO articles 
        (title, content, summary, cover_url, category_id, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
                [title, content, summary, cover_url, category, userId]
            );

            const articleId = articleResult.insertId;
            console.log(articleId, 'articleId');
            // 2. 创建文章-标签关联
            if (Array.isArray(tags) && tags.length > 0) {
                for (const tagId of tags) {
                    console.log(tagId, 'tagId');
                    await connection.execute(
                        `
            INSERT INTO article_tags (article_id, tag_id) 
            VALUES (?, ?)
          `,
                        [articleId, tagId]
                    );
                }
            }

            // 提交事务
            await connection.commit();

            return articleResult;
        } catch (error) {
            // 如果出错，回滚事务
            await connection.rollback();
            console.error('创建文章错误:', error);
            throw error;
        } finally {
            // 释放连接
            connection.release();
        }
    }

    async findArticleById(id, userId = null, ip = null, userAgent = null) {
        try {
            // 先记录浏览
            if (ip) {
                await this.recordView(id, userId, ip, userAgent);
            }

            // 查询文章信息
            const statement = `
                SELECT 
                    a.*,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
                    (SELECT COUNT(*) FROM collection_articles WHERE article_id = a.id) as collection_count,
                    (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as view_count,
                    (SELECT COUNT(DISTINCT ip) FROM article_views WHERE article_id = a.id) as unique_view_count,
                    ${userId ? 'EXISTS(SELECT 1 FROM article_likes WHERE article_id = a.id AND user_id = ?) as has_liked' : 'FALSE as has_liked'},
                    ${userId ? 'EXISTS(SELECT 1 FROM collection_articles ca JOIN collections c ON ca.collection_id = c.id WHERE ca.article_id = a.id AND c.user_id = ?) as has_collected' : 'FALSE as has_collected'}
                FROM articles a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE a.id = ?
            `;
            
            const params = userId ? [userId, userId, id] : [id];
            const [articles] = await connection.execute(statement, params);

            if (articles.length === 0) {
                return null;
            }

            const article = articles[0];

            // 查询文章标签
            const tagStatement = `
                SELECT t.id, t.name
                FROM tags t
                INNER JOIN article_tags at ON t.id = at.tag_id
                WHERE at.article_id = ?
            `;
            const [tags] = await connection.execute(tagStatement, [id]);
            article.tags = tags;

            return article;
        } catch (error) {
            console.error('查询文章详情错误:', error);
            throw error;
        }
    }

    async findArticles(offset = 0, limit = 10, options = {}, userId = null) {
        try {
            const { category, keyword, userId: authorId } = options;
            const whereConditions = [];
            const params = [];

            if (category) {
                whereConditions.push('a.category_id = ?');
                params.push(category);
            }

            if (authorId) {
                whereConditions.push('a.user_id = ?');
                params.push(authorId);
            }

            if (keyword) {
                whereConditions.push('(a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)');
                const likeKeyword = `%${keyword}%`;
                params.push(likeKeyword, likeKeyword, likeKeyword);
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}` 
                : '';

            // 查询文章列表
            const statement = `
                SELECT 
                    a.*,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
                    (SELECT COUNT(*) FROM collection_articles WHERE article_id = a.id) as collection_count,
                    (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as view_count,
                    (SELECT COUNT(DISTINCT ip) FROM article_views WHERE article_id = a.id) as unique_view_count,
                    ${userId ? 'EXISTS(SELECT 1 FROM article_likes WHERE article_id = a.id AND user_id = ?) as has_liked' : 'FALSE as has_liked'},
                    ${userId ? 'EXISTS(SELECT 1 FROM collection_articles ca JOIN collections c ON ca.collection_id = c.id WHERE ca.article_id = a.id AND c.user_id = ?) as has_collected' : 'FALSE as has_collected'}
                FROM articles a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                ${whereClause}
                ORDER BY a.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;

            // 如果有用户ID，添加到参数列表
            if (userId) {
                params.unshift(userId, userId);
            }

            const [articles] = await connection.execute(statement, params);

            // 获取每篇文章的标签
            for (let article of articles) {
                const tagStatement = `
                    SELECT t.id, t.name
                    FROM tags t
                    INNER JOIN article_tags at ON t.id = at.tag_id
                    WHERE at.article_id = ?
                `;
                const [tags] = await connection.execute(tagStatement, [article.id]);
                article.tags = tags;
            }

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM articles a 
                ${whereClause}
            `;
            const [countResult] = await connection.execute(countStatement, 
                whereConditions.length > 0 ? params.slice(userId ? 2 : 0) : []
            );

            return {
                articles,
                total: countResult[0].total,
            };
        } catch (error) {
            console.error('查询文章列表错误:', error);
            throw error;
        }
    }

    // 获取用户的所有文章
    async getUserArticles(userId, offset = 0, limit = 10) {
        try {
            // 确保参数是数字类型
            const safeLimit = parseInt(limit);
            const safeOffset = parseInt(offset);
            const safeUserId = parseInt(userId);

            // 获取文章列表
            const statement = `
                SELECT 
                    a.id,
                    a.title,
                    a.summary,
                    a.cover_url,
                    a.created_at,
                    a.updated_at,
                    c.id as category_id,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;
            
            const [articles] = await connection.execute(statement, [safeUserId]);

            // 获取每篇文章的标签
            for (let article of articles) {
                const tagStatement = `
                    SELECT t.id, t.name
                    FROM tags t
                    INNER JOIN article_tags at ON t.id = at.tag_id
                    WHERE at.article_id = ?
                `;
                const [tags] = await connection.execute(tagStatement, [article.id]);
                article.tags = tags;
            }

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM articles 
                WHERE user_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [safeUserId]);

            return {
                articles,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('获取用户文章失败:', error);
            throw error;
        }
    }

    // 记录文章浏览
    async recordView(articleId, userId, ip, userAgent) {
        try {
            // 检查最近2小时内是否已经浏览过
            const checkStatement = `
                SELECT id 
                FROM article_views 
                WHERE article_id = ? 
                AND ip = ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                ${userId ? 'AND user_id = ?' : ''}
                LIMIT 1
            `;
            
            const checkParams = userId ? [articleId, ip, userId] : [articleId, ip];
            const [existingViews] = await connection.execute(checkStatement, checkParams);

            // 如果2小时内没有浏览记录，才记录新的浏览
            if (existingViews.length === 0) {
                const insertStatement = `
                    INSERT INTO article_views (article_id, user_id, ip, user_agent)
                    VALUES (?, ?, ?, ?)
                `;
                await connection.execute(insertStatement, [articleId, userId, ip, userAgent]);
            }
        } catch (error) {
            console.error('记录文章浏览失败:', error);
            throw error;
        }
    }

    // 获取热门文章
    async getHotArticles(limit = 10, days = 7) {
        try {
            // 确保参数是数字类型
            const safeLimit = parseInt(limit);
            const safeDays = parseInt(days);

            const statement = `
                SELECT 
                    a.id,
                    a.title,
                    (
                        (SELECT COUNT(*) FROM article_views av 
                         WHERE av.article_id = a.id 
                         AND av.created_at > DATE_SUB(NOW(), INTERVAL ${safeDays} DAY)
                        ) * 1 + 
                        (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) * 2 + 
                        (SELECT COUNT(*) FROM collection_articles WHERE article_id = a.id) * 3
                    ) as hot_score
                FROM articles a
                ORDER BY hot_score DESC
                LIMIT ${safeLimit}
            `;

            const [articles] = await connection.execute(statement, []);
            return articles;
        } catch (error) {
            console.error('获取热门文章失败:', error);
            throw error;
        }
    }

    // 获取最新文章
    async getLatestArticles(limit = 10) {
        try {
            // 确保参数是数字类型
            const safeLimit = parseInt(limit);

            const statement = `
                SELECT 
                    a.*,
                    u.username as author_name,
                    u.nickname as author_nickname,
                    c.name as category_name,
                    (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
                    (SELECT COUNT(*) FROM collection_articles WHERE article_id = a.id) as collection_count,
                    (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as view_count,
                    (SELECT COUNT(DISTINCT ip) FROM article_views WHERE article_id = a.id) as unique_view_count
                FROM articles a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit}
            `;

            const [articles] = await connection.execute(statement, []);

            // 获取每篇文章的标签
            for (let article of articles) {
                const tagStatement = `
                    SELECT t.id, t.name
                    FROM tags t
                    INNER JOIN article_tags at ON t.id = at.tag_id
                    WHERE at.article_id = ?
                `;
                const [tags] = await connection.execute(tagStatement, [article.id]);
                article.tags = tags;
            }

            return articles;
        } catch (error) {
            console.error('获取最新文章失败:', error);
            throw error;
        }
    }
}

module.exports = new ArticleService();
