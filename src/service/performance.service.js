const db = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class PerformanceService {
    /**
     * 验证并清理整数值，确保在 INT 范围内
     * @param {any} value 原始值
     * @param {number} maxValue 最大值，默认 INT 最大值
     * @returns {number|null} 清理后的值
     */
    sanitizeInt(value, maxValue = 2147483647) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
            return null;
        }
        // 确保值在合理范围内
        if (num < 0 || num > maxValue) {
            return null;
        }
        return Math.floor(num);
    }

    /**
     * 验证并清理小数值
     * @param {any} value 原始值
     * @returns {number|null} 清理后的值
     */
    sanitizeDecimal(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
            return null;
        }
        // CLS 值通常是正数，但允许负数（布局偏移）
        return num;
    }

    /**
     * 创建性能报告
     * @param {Object} reportData 性能报告数据
     * @returns {Promise<Object>} 创建的报告ID
     */
    async createReport(reportData) {
        const {
            appId,
            userId,
            url,
            userAgent,
            timestamp,
            webVitals = {},
            pagePerformance = {},
            screen = {},
            viewport = {},
            ip,
        } = reportData;

        const connection = await require('../app/database').getConnection();
        const reportId = generateEntityId();

        try {
            await connection.beginTransaction();

            // 1. 插入主报告记录
            await connection.execute(
                `
                INSERT INTO performance_reports (
                    id, app_id, user_id, url, user_agent, timestamp,
                    fcp, lcp, fid, cls,
                    dns_time, tcp_time, ttfb, dom_ready_time, page_load_time,
                    screen_width, screen_height, avail_width, avail_height,
                    viewport_width, viewport_height, ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    reportId,
                    appId,
                    userId || null,
                    url,
                    userAgent || null,
                    timestamp,
                    this.sanitizeInt(webVitals.fcp),
                    this.sanitizeInt(webVitals.lcp),
                    this.sanitizeInt(webVitals.fid),
                    this.sanitizeDecimal(webVitals.cls),
                    this.sanitizeInt(pagePerformance.dnsTime),
                    this.sanitizeInt(pagePerformance.tcpTime),
                    this.sanitizeInt(pagePerformance.ttfb),
                    this.sanitizeInt(pagePerformance.domReadyTime),
                    this.sanitizeInt(pagePerformance.pageLoadTime),
                    this.sanitizeInt(screen.width),
                    this.sanitizeInt(screen.height),
                    this.sanitizeInt(screen.availWidth),
                    this.sanitizeInt(screen.availHeight),
                    this.sanitizeInt(viewport.width),
                    this.sanitizeInt(viewport.height),
                    ip || null,
                ]
            );

            // 2. 插入资源数据
            if (reportData.resources && Array.isArray(reportData.resources)) {
                for (const resource of reportData.resources) {
                    const resourceId = generateEntityId();
                    await connection.execute(
                        `
                        INSERT INTO performance_resources (
                            id, report_id, name, type, duration, size, start_time, transfer_size
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            resourceId,
                            reportId,
                            resource.name || '',
                            resource.type || null,
                            this.sanitizeInt(resource.duration),
                            this.sanitizeInt(resource.size, 9223372036854775807), // BIGINT max
                            this.sanitizeInt(resource.startTime),
                            this.sanitizeInt(resource.transferSize, 9223372036854775807), // BIGINT max
                        ]
                    );
                }
            }

            // 3. 插入错误数据
            if (reportData.errors && Array.isArray(reportData.errors)) {
                for (const error of reportData.errors) {
                    const errorId = generateEntityId();
                    await connection.execute(
                        `
                        INSERT INTO performance_errors (
                            id, report_id, type, message, filename, lineno, colno, stack, timestamp
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            errorId,
                            reportId,
                            error.type || 'javascript',
                            error.message || null,
                            error.filename || null,
                            this.sanitizeInt(error.lineno),
                            this.sanitizeInt(error.colno),
                            error.stack || null,
                            error.timestamp || timestamp,
                        ]
                    );
                }
            }

            // 4. 插入网络请求数据
            if (
                reportData.networkRequests &&
                Array.isArray(reportData.networkRequests)
            ) {
                for (const request of reportData.networkRequests) {
                    const requestId = generateEntityId();
                    await connection.execute(
                        `
                        INSERT INTO performance_network_requests (
                            id, report_id, url, method, status, duration, timestamp, request_size, response_size
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            requestId,
                            reportId,
                            request.url || '',
                            request.method || null,
                            this.sanitizeInt(request.status, 999), // HTTP 状态码最大 999
                            this.sanitizeInt(request.duration),
                            request.timestamp || timestamp,
                            this.sanitizeInt(request.requestSize, 9223372036854775807), // BIGINT max
                            this.sanitizeInt(request.responseSize, 9223372036854775807), // BIGINT max
                        ]
                    );
                }
            }

            await connection.commit();
            return { id: reportId };
        } catch (error) {
            await connection.rollback();
            console.error('创建性能报告错误:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 获取性能报告列表
     * @param {Object} options 查询选项
     * @returns {Promise<Object>} 报告列表和总数
     */
    async getReports(options = {}) {
        const {
            appId,
            userId,
            page = 1,
            pageSize = 10,
            startTime,
            endTime,
        } = options;

        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        const whereConditions = [];
        const params = [];

        if (appId) {
            whereConditions.push('app_id = ?');
            params.push(appId);
        }

        if (userId) {
            whereConditions.push('user_id = ?');
            params.push(userId);
        }

        if (startTime) {
            whereConditions.push('timestamp >= ?');
            params.push(startTime);
        }

        if (endTime) {
            whereConditions.push('timestamp <= ?');
            params.push(endTime);
        }

        const whereClause =
            whereConditions.length > 0
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

        try {
            // 查询报告列表
            const statement = `
                SELECT *
                FROM performance_reports
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const [reports] = await db.execute(statement, params);

            // 查询总数
            const countStatement = `
                SELECT COUNT(*) as total
                FROM performance_reports
                ${whereClause}
            `;
            const [countResult] = await db.execute(countStatement, params);

            return {
                reports,
                total: countResult[0].total,
            };
        } catch (error) {
            console.error('查询性能报告列表错误:', error);
            throw error;
        }
    }

    /**
     * 根据ID获取性能报告详情
     * @param {string} reportId 报告ID
     * @returns {Promise<Object>} 报告详情
     */
    async getReportById(reportId) {
        try {
            // 查询主报告
            const [reports] = await db.execute(
                'SELECT * FROM performance_reports WHERE id = ?',
                [reportId]
            );

            if (reports.length === 0) {
                return null;
            }

            const report = reports[0];

            // 查询资源
            const [resources] = await db.execute(
                'SELECT * FROM performance_resources WHERE report_id = ?',
                [reportId]
            );
            report.resources = resources;

            // 查询错误
            const [errors] = await db.execute(
                'SELECT * FROM performance_errors WHERE report_id = ?',
                [reportId]
            );
            report.errors = errors;

            // 查询网络请求
            const [networkRequests] = await db.execute(
                'SELECT * FROM performance_network_requests WHERE report_id = ?',
                [reportId]
            );
            report.networkRequests = networkRequests;

            return report;
        } catch (error) {
            console.error('查询性能报告详情错误:', error);
            throw error;
        }
    }

    /**
     * 获取性能统计信息
     * @param {Object} options 查询选项
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics(options = {}) {
        const { appId, startTime, endTime } = options;

        const whereConditions = [];
        const params = [];

        if (appId) {
            whereConditions.push('app_id = ?');
            params.push(appId);
        }

        if (startTime) {
            whereConditions.push('timestamp >= ?');
            params.push(startTime);
        }

        if (endTime) {
            whereConditions.push('timestamp <= ?');
            params.push(endTime);
        }

        const whereClause =
            whereConditions.length > 0
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

        try {
            const statement = `
                SELECT
                    COUNT(*) as total_reports,
                    AVG(fcp) as avg_fcp,
                    AVG(lcp) as avg_lcp,
                    AVG(fid) as avg_fid,
                    AVG(cls) as avg_cls,
                    AVG(ttfb) as avg_ttfb,
                    AVG(page_load_time) as avg_page_load_time,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT url) as unique_urls
                FROM performance_reports
                ${whereClause}
            `;

            const [stats] = await db.execute(statement, params);

            // 查询错误统计
            const errorStatement = `
                SELECT
                    COUNT(*) as total_errors,
                    type,
                    COUNT(*) as count
                FROM performance_errors pe
                INNER JOIN performance_reports pr ON pe.report_id = pr.id
                ${whereClause}
                GROUP BY type
            `;

            const [errorStats] = await db.execute(errorStatement, params);

            return {
                ...stats[0],
                errorStats,
            };
        } catch (error) {
            console.error('查询性能统计错误:', error);
            throw error;
        }
    }
}

module.exports = new PerformanceService();
