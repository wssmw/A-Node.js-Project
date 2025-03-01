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
}

module.exports = new LikeController();
