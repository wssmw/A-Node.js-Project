const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    likeArticle,
    likeComment,
    getUserLikedArticles,
    getUserLikedComments
} = require('../controller/like.controller');

const likeRouter = new Router({ prefix: '/like' });

// 点赞/取消点赞文章
likeRouter.post('/article', verifyAuth, likeArticle);

// 点赞/取消点赞评论
likeRouter.post('/comment', verifyAuth, likeComment);

// 获取用户点赞的文章列表
likeRouter.post('/getUserLikedArticles', verifyAuth, getUserLikedArticles);

// 获取用户点赞的评论列表
likeRouter.post('/getUserLikedComments', verifyAuth, getUserLikedComments);

module.exports = likeRouter;
