const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const { create, findById, find } = require('../controller/article.controller');
const { upload } = require('../middleware/file.middleware');

const articleRouter = new Router({ prefix: '/article' });

// 创建文章（需要登录），使用已有的文件中间件，但字段名改为 'cover'
articleRouter.post('/create', verifyAuth, upload.single('cover'), create);

// 获取文章列表（不需要登录）
articleRouter.post('/getArticle', find);

// 获取文章详情（不需要登录）
articleRouter.post('/getArticle/:id', findById);

module.exports = articleRouter;
