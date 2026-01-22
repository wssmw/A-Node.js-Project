/**
 * 性能监控报告主表
 */
const performance_reports = {
    id: 'VARCHAR(12) PRIMARY KEY COMMENT "12位随机字符串ID"',
    app_id: 'VARCHAR(100) NOT NULL COMMENT "应用ID"',
    user_id: 'VARCHAR(100) DEFAULT NULL COMMENT "用户ID"',
    url: 'VARCHAR(500) NOT NULL COMMENT "页面URL"',
    user_agent: 'VARCHAR(500) DEFAULT NULL COMMENT "用户代理"',
    timestamp: 'BIGINT NOT NULL COMMENT "时间戳"',
    // Web Vitals
    fcp: 'INT DEFAULT NULL COMMENT "首次内容绘制时间（毫秒）"',
    lcp: 'INT DEFAULT NULL COMMENT "最大内容绘制时间（毫秒）"',
    fid: 'INT DEFAULT NULL COMMENT "首次输入延迟（毫秒）"',
    cls: 'DECIMAL(10,4) DEFAULT NULL COMMENT "累积布局偏移"',
    // 页面性能指标
    dns_time: 'INT DEFAULT NULL COMMENT "DNS查询时间（毫秒）"',
    tcp_time: 'INT DEFAULT NULL COMMENT "TCP连接时间（毫秒）"',
    ttfb: 'INT DEFAULT NULL COMMENT "首字节时间（毫秒）"',
    dom_ready_time: 'INT DEFAULT NULL COMMENT "DOM就绪时间（毫秒）"',
    page_load_time: 'INT DEFAULT NULL COMMENT "页面加载时间（毫秒）"',
    // 屏幕信息
    screen_width: 'INT DEFAULT NULL COMMENT "屏幕宽度"',
    screen_height: 'INT DEFAULT NULL COMMENT "屏幕高度"',
    avail_width: 'INT DEFAULT NULL COMMENT "可用宽度"',
    avail_height: 'INT DEFAULT NULL COMMENT "可用高度"',
    // 视口信息
    viewport_width: 'INT DEFAULT NULL COMMENT "视口宽度"',
    viewport_height: 'INT DEFAULT NULL COMMENT "视口高度"',
    // IP地址
    ip: 'VARCHAR(50) DEFAULT NULL COMMENT "IP地址"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    INDEX: 'idx_app_id (app_id)',
    INDEX: 'idx_user_id (user_id)',
    INDEX: 'idx_timestamp (timestamp)',
    INDEX: 'idx_created_at (created_at)',
};

module.exports = performance_reports;
