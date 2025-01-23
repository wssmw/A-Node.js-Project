const articleService = require('../service/article.service')

class ArticleController {
  async create(ctx) {
    try {
      const { title, content, summary, tags, category } = ctx.request.body
      const { id: userId } = ctx.userinfo

      // 验证必填字段
      if (!title || !content || !summary || !category) {
        ctx.status = 400
        ctx.body = {
          code: 400,
          message: '标题、内容、摘要和分类不能为空'
        }
        return
      }

      // 验证标签
      if (!Array.isArray(tags)) {
        ctx.status = 400
        ctx.body = {
          code: 400,
          message: '标签必须是数组'
        }
        return
      }

      const result = await articleService.createArticle({
        title,
        content,
        summary,
        tags,
        category,
        userId
      })

      ctx.body = {
        code: 200,
        message: '文章创建成功',
        data: {
          id: result.insertId
        }
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        code: 500,
        message: '服务器内部错误',
        error: error.message
      }
    }
  }
}

module.exports = new ArticleController() 