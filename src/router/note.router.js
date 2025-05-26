const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const noteController = require('../controller/note.controller');

const noteRouter = new Router({ prefix: '/note' });

// 创建小记
noteRouter.post('/create', verifyAuth, noteController.create);
// 获取小记详情
noteRouter.post('/getById', verifyAuth, noteController.getById);
// 获取小记列表
noteRouter.get('/list', verifyAuth, noteController.list);
// 更新小记
noteRouter.post('/update', verifyAuth, noteController.update);
// 删除小记
noteRouter.post('/delete', verifyAuth, noteController.delete);

module.exports = noteRouter;
