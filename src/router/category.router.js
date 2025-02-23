const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    create,
    remove,
    update,
    getCategoryList,
    getCategoryById,
} = require('../controller/category.controller');

const categoryRouter = new Router({ prefix: '/category' });

// 创建分类
categoryRouter.post('/create', verifyAuth, create);

// 删除分类
categoryRouter.post('/deleteCategoryById', verifyAuth, remove);

// 更新分类
categoryRouter.post('/updateCategory', verifyAuth, update);

// 获取分类列表
categoryRouter.get('/getCategoryList', getCategoryList);

// 获取单个分类
categoryRouter.post('/getCategoryById', getCategoryById);

module.exports = categoryRouter; 