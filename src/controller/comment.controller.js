const commentService = require('../service/comment.service');
const {
    handeleErrorReturnMessage,
    handeleSuccessReturnMessage,
} = require('../utils');

class CommentController {
    // 创建评论
    async create(ctx) {
        const { articleId, content, parentId } = ctx.request.body;
        const { id: userId } = ctx.userinfo;

        // 验证评论内容
        if (!content || content.trim().length === 0) {
            handeleErrorReturnMessage(ctx, '评论内容不能为空');
            return;
        }

        const result = await commentService.create(
            userId,
            articleId,
            content,
            parentId
        );
        handeleSuccessReturnMessage(ctx, '评论成功', {
            result,
        });
    }

    // 删除评论
    async remove(ctx) {
        const { commentId } = ctx.request.body;
        const { id: userId } = ctx.user;

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
        const comments = await commentService.getByArticleId(articleId);
        handeleSuccessReturnMessage(ctx, '成功', {
            comments,
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
        handeleSuccessReturnMessage(ctx, '成功', {
            comment,
        });
    }
}

module.exports = new CommentController();
