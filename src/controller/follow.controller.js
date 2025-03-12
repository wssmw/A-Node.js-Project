const followService = require('../service/follow.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class FollowController {
    // 关注/取消关注用户
    async followUser(ctx) {
        try {
            const { id: followerId } = ctx.userinfo;
            const { userId: followingId } = ctx.request.body;

            if (!followingId) {
                handeleErrorReturnMessage(ctx, '用户ID不能为空');
                return;
            }

            if (followerId === followingId) {
                handeleErrorReturnMessage(ctx, '不能关注自己');
                return;
            }

            const result = await followService.followUser(
                followerId,
                followingId
            );
            handeleSuccessReturnMessage(
                ctx,
                result.action === 'follow' ? '关注成功' : '取消关注成功'
            );
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 关注/取消关注标签
    async followTag(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { tagId } = ctx.request.body;

            if (!tagId) {
                handeleErrorReturnMessage(ctx, '标签ID不能为空');
                return;
            }

            const result = await followService.followTag(userId, tagId);
            handeleSuccessReturnMessage(
                ctx,
                result.action === 'follow' ? '关注成功' : '取消关注成功'
            );
        } catch (error) {
            handeleErrorReturnMessage(ctx, '操作失败: ' + error.message);
        }
    }

    // 获取关注的用户列表
    async getFollowingUsers(ctx) {
        try {
            const { page = 1, pageSize = 10, userId } = ctx.request.body;
            console.log(userId, 'userId');
            if (!userId) {
                console.log('这里纸吸管');
                handeleErrorReturnMessage(ctx, '请传入用户ID:userId');
            }
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const users = await followService.getFollowingUsers(
                userId,
                offset,
                parseInt(pageSize)
            );

            handeleSuccessReturnMessage(ctx, '获取成功', { users });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 获取关注的标签列表
    async getFollowingTags(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { page = 1, pageSize = 10 } = ctx.request.body;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const tags = await followService.getFollowingTags(
                userId,
                offset,
                parseInt(pageSize)
            );

            handeleSuccessReturnMessage(ctx, '获取成功', { tags });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }
}

module.exports = new FollowController();
