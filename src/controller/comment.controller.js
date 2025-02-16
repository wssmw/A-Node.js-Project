const commentService = require('../service/comment.service');

class CommentController {
    // 创建评论
    async create(ctx) {
        const { articleId, content, parentId } = ctx.request.body;
        const { id: userId } = ctx.user;

        // 验证评论内容
        if (!content || content.trim().length === 0) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: '评论内容不能为空'
            };
            return;
        }

        const result = await commentService.create(userId, articleId, content, parentId);
        ctx.body = {
            code: 200,
            message: '评论成功',
            data: result
        };
    }

    // 删除评论
    async remove(ctx) {
        const { commentId } = ctx.request.body;
        const { id: userId } = ctx.user;

        try {
            await commentService.remove(commentId, userId);
            ctx.body = {
                code: 200,
                message: '删除成功'
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: error.message
            };
        }
    }

    // 获取文章评论列表
    async getCommentList(ctx) {
        const { articleId } = ctx.query;
        const comments = await commentService.getByArticleId(articleId);
        ctx.body = {
            code: 200,
            data: comments
        };
    }

    // 获取评论详情
    async getCommentById(ctx) {
        const { commentId } = ctx.request.body;
        const comment = await commentService.getById(commentId);
        
        if (!comment) {
            ctx.status = 404;
            ctx.body = {
                code: 404,
                message: '评论不存在'
            };
            return;
        }

        ctx.body = {
            code: 200,
            data: comment
        };
    }
}

module.exports = new CommentController(); 