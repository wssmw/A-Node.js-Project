const articleService = require('../service/article.service');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');
const { getFileUrl } = require('../middleware/file.middleware');

// 添加上传目录常量
const { SERVER_HOST, SERVER_PORT } = process.env;

// 复用相同的安全删除函数
async function safeDeleteFile(filePath) {
    try {
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('删除文件失败:', error);
        return false;
    }
}

class ArticleController {
    async create(ctx) {
        try {
            const { title, content, summary, tags, category, cover_url } =
                ctx.request.body;
            const { id: userId } = ctx.userinfo;

            // 验证必填字段
            if (!title || !content || !summary || !category) {
                ctx.status = 400;
                ctx.body = {
                    code: 400,
                    message: '标题、内容、摘要和分类不能为空',
                };
                return;
            }

            // 验证标签
            if (!Array.isArray(tags)) {
                ctx.status = 400;
                ctx.body = {
                    code: 400,
                    message: '标签必须是数组',
                };
                return;
            }

            const result = await articleService.createArticle({
                title,
                content,
                summary,
                cover_url,
                tags,
                category,
                userId,
            });
            handeleSuccessReturnMessage(ctx, '文章创建成功', {
                id: result.insertId,
            });
        } catch (error) {
            // 如果出错且上传了文件，删除文件
            if (ctx.file) {
                const filePath = ctx.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async uploadFile(ctx) {
        const files = ctx.request.files || ctx.files;
        if (!files || files.length === 0) {
            handeleErrorReturnMessage(ctx, '请上传文件');
            return;
        }

        try {
            // 获取第一个文件
            const file = files[0];
            handeleSuccessReturnMessage(ctx, '上传成功', {
                url: getFileUrl(file.path)
            });
        } catch (error) {
            // 如果出错，删除已上传的文件
            if (files && files.length > 0) {
                await safeDeleteFile(files[0].path);
            }
            handeleErrorReturnMessage(ctx, '上传失败: ' + error.message);
        }
    }

    async findById(ctx) {
        try {
            const { id } = ctx.params;
            const userId = ctx.userinfo ? ctx.userinfo.id : null;
            const article = await articleService.findArticleById(id, userId);

            if (!article) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '文章不存在',
                };
                return;
            }
            handeleSuccessReturnMessage(ctx, '成功', {
                ...article,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async find(ctx) {
        try {
            const {
                page = 1,
                pageSize = 10,
                category,
                userId: authorId,
                keyword,
            } = ctx.request.body;
            const userId = ctx.userinfo ? ctx.userinfo.id : null;

            // 确保参数类型正确
            const offset = Math.max(0, parseInt(page) - 1) * parseInt(pageSize);
            const limit = parseInt(pageSize);

            const result = await articleService.findArticles(
                offset,
                limit,
                {
                    category: category ? parseInt(category) : undefined,
                    userId: authorId ? parseInt(authorId) : undefined,
                    keyword,
                },
                userId
            );

            handeleSuccessReturnMessage(ctx, '成功', {
                articles: result.articles,
                total: result.total,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 获取当前用户的文章列表
    async getUserArticles(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { page = 1, pageSize = 10 } = ctx.request.body;

            // 计算偏移量
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const limit = parseInt(pageSize);

            const result = await articleService.getUserArticles(userId, offset, limit);

            handeleSuccessReturnMessage(ctx, '获取成功', {
                articles: result.articles,
                total: result.total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取文章列表失败: ' + error.message);
        }
    }
}

module.exports = new ArticleController();
