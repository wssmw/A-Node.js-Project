const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    followUser,
    followTag,
    getFollowingUsers,
    getFollowingTags,
} = require('../controller/follow.controller');

const followRouter = new Router({ prefix: '/follow' });

// 关注/取消关注用户
followRouter.post('/user', verifyAuth, followUser);

// 关注/取消关注标签
followRouter.post('/tag', verifyAuth, followTag);

// 获取关注的用户列表
followRouter.post('/getFollowingUsers', getFollowingUsers);

// 获取关注的标签列表
followRouter.post('/getFollowingTags', getFollowingTags);

module.exports = followRouter;
