const Router = require('koa-router');
const {
    report,
    getReports,
    getReportById,
    getStatistics,
} = require('../controller/performance.controller');

const performanceRouter = new Router({ prefix: '/performance' });

// 接收性能报告（不需要登录，前端直接调用）
performanceRouter.post('/report', report);

// 获取性能报告列表（可选登录，管理员可查看所有，普通用户只能查看自己的）
performanceRouter.post('/reports', getReports);

// 获取性能报告详情
performanceRouter.get('/report/:id', getReportById);

// 获取性能统计信息
performanceRouter.post('/statistics', getStatistics);

module.exports = performanceRouter;
