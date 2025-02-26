const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    toggleArticleLike,
    toggleCommentLike,
    getArticleLikeStatus,
    getCommentLikeStatus,
} = require('../controller/like.controller');

const likeRouter = new Router({ prefix: '/like' });

// 文章点赞/取消点赞
likeRouter.post('/article', verifyAuth, toggleArticleLike);

// 评论点赞/取消点赞
likeRouter.post('/comment', verifyAuth, toggleCommentLike);

// 获取文章点赞状态
likeRouter.get('/article/:articleId', verifyAuth, getArticleLikeStatus);

// 获取评论点赞状态
likeRouter.get('/comment/:commentId', verifyAuth, getCommentLikeStatus);

module.exports = likeRouter;
