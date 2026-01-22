/**
 * 性能监控资源表
 */
const performance_resources = {
    id: 'VARCHAR(12) PRIMARY KEY COMMENT "12位随机字符串ID"',
    report_id: 'VARCHAR(12) NOT NULL COMMENT "报告ID"',
    name: 'VARCHAR(500) NOT NULL COMMENT "资源名称/URL"',
    type: 'VARCHAR(50) DEFAULT NULL COMMENT "资源类型（script/css/image等）"',
    duration: 'INT DEFAULT NULL COMMENT "加载时长（毫秒）"',
    size: 'BIGINT DEFAULT NULL COMMENT "资源大小（字节）"',
    start_time: 'INT DEFAULT NULL COMMENT "开始时间（毫秒）"',
    transfer_size: 'BIGINT DEFAULT NULL COMMENT "传输大小（字节）"',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "创建时间"',
    'FOREIGN KEY': '(report_id) REFERENCES performance_reports(id) ON DELETE CASCADE',
    INDEX: 'idx_report_id (report_id)',
    INDEX: 'idx_type (type)',
};

module.exports = performance_resources;
