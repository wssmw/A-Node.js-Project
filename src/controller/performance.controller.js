const performanceService = require('../service/performance.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class PerformanceController {
    /**
     * 接收性能报告
     */
    async report(ctx) {
        try {
            const reportData = ctx.request.body;

            // 获取IP地址
            let ip = ctx.ip;
            // 如果是 IPv6 格式，提取 IPv4 部分
            if (ip.includes('::ffff:')) {
                ip = ip.split('::ffff:')[1];
            }
            // 如果是代理 IP，取第一个
            if (ip.includes(',')) {
                ip = ip.split(',')[0].trim();
            }

            // 添加IP到报告数据
            reportData.ip = ip;

            // 验证必填字段
            if (!reportData.appId || !reportData.url || !reportData.timestamp) {
                handeleErrorReturnMessage(
                    ctx,
                    'appId、url和timestamp为必填字段',
                    400
                );
                return;
            }

            const result = await performanceService.createReport(reportData);
            handeleSuccessReturnMessage(ctx, '性能报告提交成功', result);
        } catch (error) {
            console.error('性能报告提交失败:', error);
            handeleErrorReturnMessage(
                ctx,
                '性能报告提交失败: ' + error.message,
                500
            );
        }
    }

    /**
     * 获取性能报告列表
     */
    async getReports(ctx) {
        try {
            const {
                appId,
                userId,
                page = 1,
                pageSize = 10,
                startTime,
                endTime,
            } = ctx.request.body;

            const result = await performanceService.getReports({
                appId,
                userId,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                startTime,
                endTime,
            });

            handeleSuccessReturnMessage(ctx, '获取成功', result);
        } catch (error) {
            console.error('获取性能报告列表失败:', error);
            handeleErrorReturnMessage(
                ctx,
                '获取性能报告列表失败: ' + error.message,
                500
            );
        }
    }

    /**
     * 获取性能报告详情
     */
    async getReportById(ctx) {
        try {
            const { id } = ctx.params;

            if (!id) {
                handeleErrorReturnMessage(ctx, '报告ID不能为空', 400);
                return;
            }

            const report = await performanceService.getReportById(id);

            if (!report) {
                handeleErrorReturnMessage(ctx, '报告不存在', 404);
                return;
            }

            handeleSuccessReturnMessage(ctx, '获取成功', report);
        } catch (error) {
            console.error('获取性能报告详情失败:', error);
            handeleErrorReturnMessage(
                ctx,
                '获取性能报告详情失败: ' + error.message,
                500
            );
        }
    }

    /**
     * 获取性能统计信息
     */
    async getStatistics(ctx) {
        try {
            const { appId, startTime, endTime } = ctx.request.body;

            const statistics = await performanceService.getStatistics({
                appId,
                startTime,
                endTime,
            });

            handeleSuccessReturnMessage(ctx, '获取成功', statistics);
        } catch (error) {
            console.error('获取性能统计失败:', error);
            handeleErrorReturnMessage(
                ctx,
                '获取性能统计失败: ' + error.message,
                500
            );
        }
    }
}

module.exports = new PerformanceController();
