/**
 * 性能监控网络请求表
 */
const performance_network_requests = {
    id: 'VARCHAR(12) PRIMARY KEY COMMENT "12位随机字符串ID"',
    report_id: 'VARCHAR(12) NOT NULL COMMENT "报告ID"',
    url: 'VARCHAR(500) NOT NULL COMMENT "请求URL"',
    method: 'VARCHAR(10) DEFAULT NULL COMMENT "请求方法（GET/POST等）"',
    status: 'INT DEFAULT NULL COMMENT "响应状态码"',
    duration: 'INT DEFAULT NULL COMMENT "请求时长（毫秒）"',
    timestamp: 'BIGINT NOT NULL COMMENT "时间戳"',
    request_size: 'BIGINT DEFAULT NULL COMMENT "请求大小（字节）"',
    response_size: 'BIGINT DEFAULT NULL COMMENT "响应大小（字节）"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    'FOREIGN KEY': '(report_id) REFERENCES performance_reports(id) ON DELETE CASCADE',
    INDEX: 'idx_report_id (report_id)',
    INDEX: 'idx_status (status)',
    INDEX: 'idx_timestamp (timestamp)',
};

module.exports = performance_network_requests;
