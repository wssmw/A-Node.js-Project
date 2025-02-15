const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    create,
    remove,
    update,
    getTagList,
    getTagById,
} = require('../controller/tag.controller');

const tagRouter = new Router({ prefix: '/tag' });

// 创建标签
tagRouter.post('/create', verifyAuth, create);

// 删除标签
tagRouter.post('/deleteTagById', verifyAuth, remove);

// 更新标签
tagRouter.post('/updateTag', verifyAuth, update);

// 获取标签列表
tagRouter.get('/getTagList', getTagList);

// 获取单个标签
tagRouter.post('/getTagById', getTagById);

module.exports = tagRouter;
