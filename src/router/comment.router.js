const Router = require('koa-router');
const {
    verifyAuth,
    verifyAuthOptional,
} = require('../middleware/login.middleware');
const {
    create,
    remove,
    getCommentList,
    getCommentById,
} = require('../controller/comment.controller');

const commentRouter = new Router({ prefix: '/comment' });

// 创建评论（需要登录）
commentRouter.post('/create', verifyAuth, create);

// 删除评论（需要登录）
commentRouter.post('/deleteCommentById', verifyAuth, remove);

// 获取文章评论列表（可选登录）
commentRouter.post('/getCommentList', verifyAuthOptional, getCommentList);

// 获取评论详情（可选登录）
commentRouter.post('/getCommentById', verifyAuthOptional, getCommentById);

module.exports = commentRouter;
