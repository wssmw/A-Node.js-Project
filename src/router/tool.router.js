const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    getAllTools,
    getToolsByCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    createTool,
    updateTool,
    deleteTool,
} = require('../controller/tool.controller');

const toolRouter = new Router({ prefix: '/tools' });

// 获取所有工具
toolRouter.get('/', getAllTools);

// 获取指定分类的工具
toolRouter.get('/:categoryKey', getToolsByCategory);

// 管理接口 - 需要验证权限
toolRouter.post('/createToolCategory', verifyAuth, createCategory);
toolRouter.post('/updateToolCategory', verifyAuth, updateCategory);
toolRouter.delete('/deleteToolCategory', verifyAuth, deleteCategory);

toolRouter.post('/createTool', verifyAuth, createTool);
toolRouter.post('/updateTool', verifyAuth, updateTool);
toolRouter.delete('/deleteTool', verifyAuth, deleteTool);

module.exports = toolRouter;
