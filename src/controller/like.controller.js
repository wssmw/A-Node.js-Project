const likeService = require('../service/like.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class LikeController {
    // 文章点赞/取消点赞
    async toggleArticleLike(ctx) {
        try {
            const { articleId } = ctx.request.body;
            const { id: userId } = ctx.userinfo;

            // 检查是否已点赞
            const hasLiked = await likeService.hasLikedArticle(
                userId,
                articleId
            );

            if (hasLiked) {
                // 如果已点赞，则取消点赞
                await likeService.unlikeArticle(userId, articleId);
                handeleSuccessReturnMessage(ctx, '取消点赞成功');
            } else {
                // 如果未点赞，则添加点赞
                await likeService.likeArticle(userId, articleId);
                handeleSuccessReturnMessage(ctx, '点赞成功');
            }
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 评论点赞/取消点赞
    async toggleCommentLike(ctx) {
        try {
            const { commentId } = ctx.request.body;
            const { id: userId } = ctx.userinfo;

            // 检查是否已点赞
            const hasLiked = await likeService.hasLikedComment(
                userId,
                commentId
            );

            if (hasLiked) {
                // 如果已点赞，则取消点赞
                await likeService.unlikeComment(userId, commentId);
                handeleSuccessReturnMessage(ctx, '取消点赞成功');
            } else {
                // 如果未点赞，则添加点赞
                await likeService.likeComment(userId, commentId);
                handeleSuccessReturnMessage(ctx, '点赞成功');
            }
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 获取文章点赞状态
    async getArticleLikeStatus(ctx) {
        try {
            const { articleId } = ctx.params;
            const { id: userId } = ctx.userinfo;

            const hasLiked = await likeService.hasLikedArticle(
                userId,
                articleId
            );
            const likeCount = await likeService.getArticleLikeCount(articleId);

            handeleSuccessReturnMessage(ctx, '获取成功', {
                hasLiked,
                likeCount,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 获取评论点赞状态
    async getCommentLikeStatus(ctx) {
        try {
            const { commentId } = ctx.params;
            const { id: userId } = ctx.userinfo;

            const hasLiked = await likeService.hasLikedComment(
                userId,
                commentId
            );
            const likeCount = await likeService.getCommentLikeCount(commentId);

            handeleSuccessReturnMessage(ctx, '获取成功', {
                hasLiked,
                likeCount,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 点赞/取消点赞文章
    async likeArticle(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { articleId } = ctx.request.body;

            if (!articleId) {
                handeleErrorReturnMessage(ctx, '文章ID不能为空');
                return;
            }

            const result = await likeService.likeArticle(userId, articleId);
            handeleSuccessReturnMessage(
                ctx,
                result.action === 'like' ? '点赞成功' : '取消点赞成功'
            );
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 点赞/取消点赞评论
    async likeComment(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { commentId } = ctx.request.body;

            if (!commentId) {
                handeleErrorReturnMessage(ctx, '评论ID不能为空');
                return;
            }

            const result = await likeService.likeComment(userId, commentId);
            handeleSuccessReturnMessage(
                ctx,
                result.action === 'like' ? '点赞成功' : '取消点赞成功'
            );
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 获取用户点赞的文章列表
    async getUserLikedArticles(ctx) {
        try {
            const { page = 1, pageSize = 10, userId } = ctx.request.body;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const result = await likeService.getUserLikedArticles(
                userId,
                offset,
                pageSize
            );

            handeleSuccessReturnMessage(ctx, '获取成功', {
                articles: result.articles,
                total: result.total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 获取用户点赞的评论列表
    async getUserLikedComments(ctx) {
        try {
            const { page = 1, pageSize = 10, userId } = ctx.request.body;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const result = await likeService.getUserLikedComments(
                userId,
                offset,
                pageSize
            );

            handeleSuccessReturnMessage(ctx, '获取成功', {
                comments: result.comments,
                total: result.total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }
}

module.exports = new LikeController();
