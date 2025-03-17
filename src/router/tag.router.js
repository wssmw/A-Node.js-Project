const Router = require('koa-router');
const {
    verifyAuth,
    verifyAuthOptional,
} = require('../middleware/login.middleware');
const {
    create,
    remove,
    update,
    getTagList,
    getTagById,
} = require('../controller/tag.controller');

const tagRouter = new Router({ prefix: '/tag' });

// 创建标签（需要登录）
tagRouter.post('/create', verifyAuth, create);

// 删除标签（需要登录）
tagRouter.post('/deleteTagById', verifyAuth, remove);

// 更新标签（需要登录）
tagRouter.post('/updateTag', verifyAuth, update);

// 获取标签列表（可选登录）
tagRouter.get('/getTagList', verifyAuthOptional, getTagList);

// 获取单个标签（可选登录）
tagRouter.post('/getTagById', verifyAuthOptional, getTagById);

module.exports = tagRouter;
