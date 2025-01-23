const connection = require('../app/database')

class ArticleService {
  async createArticle(articleData) {
    const { title, content, summary, tags = [], category, userId } = articleData
    
    // 获取连接
    const connection = await require('../app/database').getConnection()
    
    try {
      // 开启事务
      await connection.beginTransaction()

      // 1. 创建文章
      const [articleResult] = await connection.execute(`
        INSERT INTO articles 
        (title, content, summary, category_id, user_id) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        title, 
        content,
        summary, 
        category, 
        userId
      ])
      
      const articleId = articleResult.insertId
      console.log(articleId,'articleId')
      // 2. 创建文章-标签关联
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagId of tags) {
            console.log(tagId,'tagId')
          await connection.execute(`
            INSERT INTO article_tags (article_id, tag_id) 
            VALUES (?, ?)
          `, [articleId, tagId])
        }
      }

      // 提交事务
      await connection.commit()
      
      return articleResult

    } catch (error) {
      // 如果出错，回滚事务
      await connection.rollback()
      console.error('创建文章错误:', error)
      throw error
    } finally {
      // 释放连接
      connection.release()
    }
  }

  async findArticleById(id) {
    try {
      // 1. 查询文章基本信息
      const [articles] = await connection.execute(`
        SELECT a.*, u.username as author_name, c.name as category_name
        FROM articles a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ?
      `, [id])

      if (!articles[0]) return null

      // 2. 查询文章的标签
      const [tags] = await connection.execute(`
        SELECT t.id, t.name
        FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = ?
      `, [id])

      // 3. 合并文章信息和标签
      return {
        ...articles[0],
        tags
      }
    } catch (error) {
      console.error('查询文章错误:', error)
      throw error
    }
  }
}

module.exports = new ArticleService() 