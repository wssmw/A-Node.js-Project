const connection = require('../app/database');
const TABLES = require('./tables');

/**
 * 检查表是否存在
 * @param {string} tableName 表名
 * @returns {Promise<boolean>}
 */
async function checkTableExists(tableName) {
    try {
        const [rows] = await connection.execute(
            `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?
    `,
            [tableName]
        );
        return rows[0].count > 0;
    } catch (error) {
        console.error(`检查表 ${tableName} 是否存在时出错:`, error);
        throw error;
    }
}

/**
 * 获取表的当前列信息
 * @param {string} tableName 表名
 */
async function getTableColumns(tableName) {
    const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `, [tableName]);
    return columns;
}

/**
 * 检查表结构是否需要更新
 * @param {string} tableName 表名
 * @returns {Promise<boolean>}
 */
async function checkTableNeedsUpdate(tableName) {
    const currentColumns = await getTableColumns(tableName);
    const fields = TABLES[tableName];
    
    // 将当前列转换为Set以便快速查找
    const currentColumnSet = new Set(
        currentColumns.map(col => col.COLUMN_NAME.toLowerCase())
    );

    // 检查是否有新字段需要添加
    for (const fieldName of Object.keys(fields)) {
        if (fieldName === 'FOREIGN KEY' || fieldName === 'FOREIGN KEY ' || 
            fieldName === 'FOREIGN KEY  ' || fieldName === 'UNIQUE KEY') {
            continue;
        }
        if (!currentColumnSet.has(fieldName.toLowerCase())) {
            return true;
        }
    }

    return false;
}

/**
 * 更新表结构
 * @param {string} tableName 表名
 */
async function updateTable(tableName) {
    try {
        const fields = TABLES[tableName];
        const currentColumns = await getTableColumns(tableName);
        
        // 将当前列转换为Map以便快速查找
        const currentColumnMap = new Map(
            currentColumns.map(col => [col.COLUMN_NAME.toLowerCase(), col])
        );

        // 处理新增和修改的字段
        for (const [fieldName, definition] of Object.entries(fields)) {
            // 跳过特殊键
            if (fieldName === 'FOREIGN KEY' || fieldName === 'FOREIGN KEY ' || 
                fieldName === 'FOREIGN KEY  ' || fieldName === 'UNIQUE KEY') {
                continue;
            }

            // 转换为小写进行比较
            const lowerFieldName = fieldName.toLowerCase();

            if (!currentColumnMap.has(lowerFieldName)) {
                // 新增字段
                const addColumnSql = `ALTER TABLE ${tableName} ADD COLUMN ${fieldName} ${definition}`;
                try {
                    await connection.execute(addColumnSql);
                    console.log(`表 ${tableName} 新增字段 ${fieldName} 成功`);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log(`字段 ${fieldName} 已存在，跳过`);
                        continue;
                    }
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error(`更新表 ${tableName} 结构失败:`, error);
        throw error;
    }
}

/**
 * 生成建表SQL
 * @param {string} tableName 表名
 * @param {object} fields 字段定义
 */
function generateCreateTableSQL(tableName, fields) {
    // 如果已经是完整的 CREATE TABLE 语句，直接返回
    if (typeof fields === 'string') {
        return fields;
    }

    const fieldDefinitions = [];

    for (const [field, definition] of Object.entries(fields)) {
        if (
            field === 'FOREIGN KEY' ||
            field === 'FOREIGN KEY ' ||
            field === 'UNIQUE KEY'
        ) {
            fieldDefinitions.push(`${field} ${definition}`);
        } else {
            fieldDefinitions.push(`${field} ${definition}`);
        }
    }

    return `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${fieldDefinitions.join(',\n      ')}
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
}

/**
 * 初始化或更新数据库表
 */
async function initDatabase() {
    try {
        const tableOrder = [
            'users',
            'user_profiles',  // 添加用户详情表
            'categories',
            'tags',
            'articles',
            'article_tags',
            'comments',
            'article_likes',
            'comment_likes',
            'collections',
            'collection_articles',
            'article_views',
            'user_follows',
            'tag_follows',  
            'notifications',
        ];

        for (const tableName of tableOrder) {
            const exists = await checkTableExists(tableName);

            if (!exists) {
                // 创建新表
                const fields = TABLES[tableName];
                const sql = generateCreateTableSQL(tableName, fields);
                try {
                    await connection.execute(sql);
                    console.log(`表 ${tableName} 创建成功`);
                } catch (error) {
                    console.error(`创建表 ${tableName} 失败:`, error);
                    console.error('SQL:', sql);
                    throw error;
                }
            } else {
                // 检查并更新已存在的表
                const needsUpdate = await checkTableNeedsUpdate(tableName);
                if (needsUpdate) {
                    await updateTable(tableName);
                    console.log(`表 ${tableName} 结构已更新`);
                }
            }
        }
        console.log('数据库初始化/更新完成');
    } catch (error) {
        console.error('数据库初始化/更新失败:', error);
        throw error;
    }
}

// 执行初始化
initDatabase().catch(console.error);

module.exports = {
    initDatabase,
    TABLES,
    checkTableExists,
    checkTableNeedsUpdate,
    updateTable,
};
