const commentService = require('../service/comment.service');
const {
    handeleErrorReturnMessage,
    handeleSuccessReturnMessage,
} = require('../utils');

class CommentController {
    // 创建评论
    async create(ctx) {
        try {
            const { content, articleId, parentId } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            console.log('id>>>', userId);
            // 验证评论内容
            if (!content || content.trim().length === 0) {
                return handeleErrorReturnMessage(ctx, '评论内容不能为空');
            }

            const result = await commentService.create(
                userId,
                articleId,
                content,
                parentId
            );

            // 如果是回复评论，获取完整的评论信息
            let commentInfo = null;
            if (result.insertId) {
                commentInfo = await commentService.getById(result.insertId);
            }

            handeleSuccessReturnMessage(ctx, '评论成功', {
                comment: commentInfo,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 删除评论
    async remove(ctx) {
        const { commentId } = ctx.request.body;
        const { id: userId } = ctx.userinfo;

        try {
            await commentService.remove(commentId, userId);
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 获取文章评论列表
    async getCommentList(ctx) {
        const { articleId } = ctx.request.body;
        const { offset = 0, limit = 10 } = ctx.query;
        const userId = ctx.userinfo ? ctx.userinfo.id : null;
        console.log('id>>>', userId);

        const result = await commentService.getByArticleId(articleId, userId);

        handeleSuccessReturnMessage(ctx, '获取成功', {
            comments: result.comments,
            total: result.total,
            offset: parseInt(offset),
            limit: parseInt(limit),
        });
    }

    // 获取评论详情
    async getCommentById(ctx) {
        const { commentId } = ctx.request.body;
        const comment = await commentService.getById(commentId);

        if (!comment) {
            handeleErrorReturnMessage(ctx, '评论不存在');
            return;
        }

        handeleSuccessReturnMessage(ctx, '获取成功', {
            comment,
        });
    }
}

module.exports = new CommentController();
