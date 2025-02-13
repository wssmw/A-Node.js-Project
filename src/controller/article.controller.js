const articleService = require('../service/article.service');
const fs = require('fs');
const path = require('path');

// 添加上传目录常量
const { SERVER_HOST, SERVER_PORT } = process.env;

class ArticleController {
    async create(ctx) {
        try {
            const { title, content, summary, tags, category } =
                ctx.request.body;
            const { id: userId } = ctx.userinfo;
            const file = ctx.file; // 获取上传的封面图片

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

            // 处理封面图片
            let cover_url = null;
            if (file) {
                cover_url = file.path;
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

            ctx.body = {
                code: 200,
                message: '文章创建成功',
                success: true,
                data: {
                    id: result.insertId,
                },
            };
        } catch (error) {
            // 如果出错且上传了文件，删除文件
            if (ctx.file) {
                const filePath = ctx.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                error: error.message,
            };
        }
    }

    async findById(ctx) {
        try {
            const { id } = ctx.params;
            const article = await articleService.findArticleById(id);

            if (!article) {
                ctx.status = 404;
                ctx.body = {
                    code: 404,
                    message: '文章不存在',
                };
                return;
            }

            ctx.body = {
                code: 200,
                data: article,
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                error: error.message,
            };
        }
    }

    async find(ctx) {
        try {
            const {
                page = 1,
                pageSize = 10,
                category,
                userId,
                keyword,
            } = ctx.request.body;
            console.log(ctx.request.body, 'page');
            // 确保参数类型正确
            const offset = Math.max(0, parseInt(page) - 1) * parseInt(pageSize);
            const limit = parseInt(pageSize);

            const result = await articleService.findArticles(offset, limit, {
                category: category ? parseInt(category) : undefined,
                userId: userId ? parseInt(userId) : undefined,
                keyword,
            });

            ctx.body = {
                code: 200,
                data: {
                    articles: result.articles.map(item => {
                        if (item.cover_url) {
                            item.cover_url = `http://${SERVER_HOST}:${SERVER_PORT}/${item.cover_url}`;
                        }
                        return item;
                    }),
                    total: result.total,
                },
            };
        } catch (error) {
            console.error('获取文章列表错误:', error);
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                error: error.message,
            };
        }
    }
}

module.exports = new ArticleController();
