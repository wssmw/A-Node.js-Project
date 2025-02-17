const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    create,
    remove,
    getCommentList,
    getCommentById,
} = require('../controller/comment.controller');

const commentRouter = new Router({ prefix: '/comment' });

// 创建评论
commentRouter.post('/create', verifyAuth, create);

// 删除评论
commentRouter.post('/deleteCommentById', verifyAuth, remove);

// 获取文章评论列表
commentRouter.post('/getCommentList', getCommentList);

// 获取评论详情
commentRouter.post('/getCommentById', getCommentById);

module.exports = commentRouter;
