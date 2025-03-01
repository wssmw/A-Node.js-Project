const Router = require('koa-router');
const {
    verifyAuth,
    verifyAuthOptional,
} = require('../middleware/login.middleware');
const {
    create,
    findById,
    find,
    uploadFile,
    getUserArticles,
    getHotArticles,
    getLatestArticles,
} = require('../controller/article.controller');
const { upload } = require('../middleware/file.middleware');

const articleRouter = new Router({ prefix: '/article' });

// 创建文章（需要登录），使用已有的文件中间件，但字段名改为 'cover'
articleRouter.post('/create', verifyAuth, create);
//
articleRouter.post('/upload', verifyAuth, upload.any(), uploadFile);

// 获取文章列表（可选登录）
articleRouter.post('/getArticle', verifyAuthOptional, find);

// 获取文章详情（可选登录）
articleRouter.get('/getArticle/:id', verifyAuthOptional, findById);

// 获取当前用户的文章列表（需要登录）
articleRouter.post('/getUserArticles', verifyAuth, getUserArticles);

// 获取热门文章
articleRouter.post('/getHotArticles', getHotArticles);

// 获取最新文章
articleRouter.post('/getLatestArticles', getLatestArticles);

module.exports = articleRouter;
