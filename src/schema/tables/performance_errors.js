/**
 * 性能监控错误表
 */
const performance_errors = {
    id: 'VARCHAR(12) PRIMARY KEY COMMENT "12位随机字符串ID"',
    report_id: 'VARCHAR(12) NOT NULL COMMENT "报告ID"',
    type: 'VARCHAR(50) NOT NULL COMMENT "错误类型（javascript/resource/promise等）"',
    message: 'TEXT DEFAULT NULL COMMENT "错误消息"',
    filename: 'VARCHAR(500) DEFAULT NULL COMMENT "文件名"',
    lineno: 'INT DEFAULT NULL COMMENT "行号"',
    colno: 'INT DEFAULT NULL COMMENT "列号"',
    stack: 'TEXT DEFAULT NULL COMMENT "错误堆栈"',
    timestamp: 'BIGINT NOT NULL COMMENT "时间戳"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    'FOREIGN KEY': '(report_id) REFERENCES performance_reports(id) ON DELETE CASCADE',
    INDEX: 'idx_report_id (report_id)',
    INDEX: 'idx_type (type)',
    INDEX: 'idx_timestamp (timestamp)',
};

module.exports = performance_errors;
