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

    async findArticleById(id, userId = null) {
        try {
            // 1. 查询文章基本信息
            const statement = `
        SELECT 
          a.*,
          u.username as author_name,
          u.nickname as author_nickname,
          c.name as category_name,
          (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
          (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
          ${userId ? `EXISTS (SELECT 1 FROM article_likes WHERE article_id = a.id AND user_id = ?) as has_liked` : 'FALSE as has_liked'}
        FROM articles a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ?
      `;
            const params = userId ? [userId, id] : [id];
            console.log('SQL:', statement);
            console.log('Params:', params);
            const [articles] = await connection.execute(statement, params);
            console.log('Query Result:', articles[0]);

            if (!articles[0]) return null;

            // 2. 查询文章的标签
            const [tags] = await connection.execute(
                `
        SELECT t.id, t.name
        FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = ?
      `,
                [id]
            );

            // 3. 合并文章信息和标签
            return {
                ...articles[0],
                tags,
            };
        } catch (error) {
            console.error('查询文章错误:', error);
            throw error;
        }
    }

    async findArticles(offset = 0, limit = 10, options = {}, userId = null) {
        try {
            // 1. 构建基础查询
            let sql = `
        SELECT 
          a.*,
          u.username as author_name,
          u.nickname as author_nickname,
          c.name as category_name,
          (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
          (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
          ${userId ? `EXISTS (SELECT 1 FROM article_likes WHERE article_id = a.id AND user_id = ?) as has_liked` : 'FALSE as has_liked'}
        FROM articles a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
      `;
            const params = [];
            if (userId) {
                params.push(userId);
            }

            // 2. 添加条件查询
            const conditions = [];
            if (options.category) {
                conditions.push('a.category_id = ?');
                params.push(options.category);
            }
            if (options.userId) {
                conditions.push('a.user_id = ?');
                params.push(options.userId);
            }
            if (options.keyword) {
                conditions.push('(a.title LIKE ? OR a.content LIKE ?)');
                params.push(`%${options.keyword}%`, `%${options.keyword}%`);
            }

            if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }

            // 3. 添加排序和分页
            sql += ` ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

            // 4. 执行查询
            const [articles] = await connection.execute(sql, params);

            // 5. 查询每篇文章的标签
            for (const article of articles) {
                const [tags] = await connection.execute(
                    `
          SELECT t.id, t.name
          FROM tags t
          JOIN article_tags at ON t.id = at.tag_id
          WHERE at.article_id = ?
        `,
                    [article.id]
                );
                article.tags = tags;
            }

            // 6. 查询总数（不包含 LIMIT 和 OFFSET 参数）
            let countSql = `
        SELECT COUNT(*) as total 
        FROM articles a
      `;
            if (conditions.length > 0) {
                countSql += ` WHERE ${conditions.join(' AND ')}`;
            }
            const [countResult] = await connection.execute(
                countSql,
                params.slice(userId ? 1 : 0)
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
}

module.exports = new ArticleService();
