const connection = require('../app/database');
const TABLES = require('./tables');
const fs = require('fs');
const path = require('path');

// 缓存文件路径
const CACHE_FILE = path.join(__dirname, '.schema-cache.json');

/**
 * 读取缓存
 * @returns {Promise<Object>}
 */
async function readCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = await fs.promises.readFile(CACHE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('读取缓存失败:', error);
    }
    return {};
}

/**
 * 写入缓存
 * @param {Object} cache 缓存数据
 */
async function writeCache(cache) {
    try {
        await fs.promises.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (error) {
        console.warn('写入缓存失败:', error);
    }
}

/**
 * 获取表结构的哈希值
 * @param {string} tableName 表名
 * @param {Object} fields 字段定义
 * @returns {string}
 */
function getTableHash(tableName, fields) {
    return JSON.stringify({
        tableName,
        fields: Object.entries(fields)
            .filter(
                ([key]) =>
                    !key.startsWith('FOREIGN KEY') && key !== 'UNIQUE KEY'
            )
            .sort(([a], [b]) => a.localeCompare(b)),
    });
}

/**
 * 执行SQL语句，带重试机制
 * @param {string} sql SQL语句
 * @param {any[]} params 参数
 * @param {number} maxRetries 最大重试次数
 * @returns {Promise<any>}
 */
async function executeWithRetry(sql, params = [], maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const conn = await connection.getConnection();
            try {
                await conn.beginTransaction();
                const result = await conn.execute(sql, params);
                await conn.commit();
                return result;
            } catch (error) {
                await conn.rollback();
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            lastError = error;
            if (error.code === 'ER_LOCK_DEADLOCK') {
                console.log(`遇到死锁，第 ${i + 1} 次重试...`);
                // 随机延迟一段时间，避免多个重试同时发生
                await new Promise(resolve =>
                    setTimeout(resolve, Math.random() * 1000)
                );
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

/**
 * 检查表是否存在
 * @param {string} tableName 表名
 * @returns {Promise<boolean>}
 */
async function checkTableExists(tableName) {
    try {
        const [rows] = await connection.execute(
            `SELECT COUNT(*) as count 
             FROM information_schema.tables 
             WHERE table_schema = DATABASE() 
             AND table_name = ?`,
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
    const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?`,
        [tableName]
    );
    return columns;
}

/**
 * 获取表的外键约束
 * @param {string} tableName 表名
 */
async function getTableForeignKeys(tableName) {
    const [foreignKeys] = await connection.execute(
        `SELECT CONSTRAINT_NAME
         FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        [tableName]
    );
    return foreignKeys;
}

/**
 * 检查表结构是否需要更新
 * @param {string} tableName 表名
 * @param {Object} cache 缓存数据
 * @returns {Promise<boolean>}
 */
async function checkTableNeedsUpdate(tableName, cache) {
    const currentColumns = await getTableColumns(tableName);
    const fields = TABLES[tableName];
    const currentHash = getTableHash(tableName, fields);

    // 如果缓存中的哈希值相同，说明表结构没有变化
    if (cache[tableName] === currentHash) {
        return false;
    }

    // 将当前列转换为Map以便快速查找
    const currentColumnMap = new Map(
        currentColumns.map(col => [col.COLUMN_NAME.toLowerCase(), col])
    );

    // 检查是否有新字段需要添加或现有字段需要更新
    for (const [fieldName, definition] of Object.entries(fields)) {
        // 跳过特殊键
        if (fieldName.startsWith('FOREIGN KEY') || fieldName === 'UNIQUE KEY') {
            continue;
        }

        const lowerFieldName = fieldName.toLowerCase();

        // 检查字段是否存在
        if (!currentColumnMap.has(lowerFieldName)) {
            return true;
        }

        // 检查字段定义是否需要更新
        const currentColumn = currentColumnMap.get(lowerFieldName);
        const currentDefinition =
            `${currentColumn.COLUMN_TYPE} ${currentColumn.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${currentColumn.COLUMN_DEFAULT ? `DEFAULT ${currentColumn.COLUMN_DEFAULT}` : ''} ${currentColumn.EXTRA}`.trim();
        const newDefinition = definition.trim();

        if (currentDefinition !== newDefinition) {
            return true;
        }
    }

    // 检查是否有需要删除的字段
    for (const column of currentColumns) {
        const lowerFieldName = column.COLUMN_NAME.toLowerCase();
        if (
            !Object.keys(fields).some(
                key => key.toLowerCase() === lowerFieldName
            )
        ) {
            return true;
        }
    }

    return false;
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
        if (field.startsWith('FOREIGN KEY') || field === 'UNIQUE KEY') {
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
 * 更新表结构
 * @param {string} tableName 表名
 */
async function updateTable(tableName) {
    try {
        const fields = TABLES[tableName];
        const currentColumns = await getTableColumns(tableName);
        const foreignKeys = await getTableForeignKeys(tableName);

        // 将当前列转换为Map以便快速查找
        const currentColumnMap = new Map(
            currentColumns.map(col => [col.COLUMN_NAME.toLowerCase(), col])
        );

        // 收集需要更新的字段
        const updates = [];
        const columnsToDrop = [];

        // 处理新增和修改的字段
        for (const [fieldName, definition] of Object.entries(fields)) {
            // 跳过特殊键
            if (
                fieldName.startsWith('FOREIGN KEY') ||
                fieldName === 'UNIQUE KEY'
            ) {
                continue;
            }

            const lowerFieldName = fieldName.toLowerCase();

            if (!currentColumnMap.has(lowerFieldName)) {
                // 新增字段
                updates.push(`ADD COLUMN ${fieldName} ${definition}`);
            } else {
                // 检查字段定义是否需要更新
                const currentColumn = currentColumnMap.get(lowerFieldName);
                const currentDefinition =
                    `${currentColumn.COLUMN_TYPE} ${currentColumn.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${currentColumn.COLUMN_DEFAULT ? `DEFAULT ${currentColumn.COLUMN_DEFAULT}` : ''} ${currentColumn.EXTRA}`.trim();
                const newDefinition = definition.trim();

                // 如果定义不同，则更新字段
                if (currentDefinition !== newDefinition) {
                    // 如果是主键字段，需要特殊处理
                    if (definition.includes('PRIMARY KEY')) {
                        console.log(`跳过主键字段 ${fieldName} 的更新`);
                        continue;
                    }

                    // 移除定义中的索引相关部分，但保留 COMMENT
                    const cleanDefinition = definition
                        .replace(/\s+KEY\s+/gi, ' ')
                        .replace(/\s+INDEX\s+/gi, ' ')
                        .replace(/\s+UNIQUE\s+/gi, ' ')
                        .replace(/\s+PRIMARY\s+/gi, ' ')
                        .replace(/\s+PRIMARY KEY\s+/gi, ' ')
                        .replace(/\s+PRIMARY\s+KEY\s+/gi, ' ')
                        .replace(/\s+AUTO_INCREMENT\s+/gi, ' ')
                        .trim();

                    updates.push(
                        `MODIFY COLUMN ${fieldName} ${cleanDefinition}`
                    );
                }
            }
        }

        // 检查需要删除的字段
        for (const column of currentColumns) {
            const lowerFieldName = column.COLUMN_NAME.toLowerCase();
            if (
                !Object.keys(fields).some(
                    key => key.toLowerCase() === lowerFieldName
                )
            ) {
                // 检查字段是否被外键引用
                const isReferenced = foreignKeys.some(fk =>
                    fk.CONSTRAINT_NAME.toLowerCase().includes(lowerFieldName)
                );

                if (!isReferenced) {
                    columnsToDrop.push(`DROP COLUMN ${column.COLUMN_NAME}`);
                } else {
                    console.log(
                        `警告: 字段 ${column.COLUMN_NAME} 被外键引用，无法删除`
                    );
                }
            }
        }

        // 如果有需要更新的字段，执行更新
        if (updates.length > 0 || columnsToDrop.length > 0) {
            const alterSql = `ALTER TABLE ${tableName} ${[...updates, ...columnsToDrop].join(', ')}`;
            try {
                await executeWithRetry(alterSql);
                console.log(
                    `表 ${tableName} 更新成功，更新了 ${updates.length} 个字段，删除了 ${columnsToDrop.length} 个字段`
                );
            } catch (error) {
                console.error(`更新表 ${tableName} 失败:`, error);
                throw error;
            }
        } else {
            console.log(`表 ${tableName} 无需更新`);
        }
    } catch (error) {
        console.error(`更新表 ${tableName} 结构失败:`, error);
        throw error;
    }
}

/**
 * 初始化或更新数据库表
 */
async function initDatabase() {
    try {
        // 读取缓存
        const cache = await readCache();
        let cacheUpdated = false;

        // 按照依赖关系排序的表创建顺序
        const tableOrder = [
            // 第一层：基础表（无外键依赖）
            'users', // 用户表（最基础的表）
            'categories', // 分类表（独立表）
            'tags', // 标签表（独立表）
            'tool_categories', // 工具分类表（独立表）

            // 第二层：依赖单个基础表
            'user_profiles', // 依赖 users
            'collections', // 依赖 users
            'articles', // 依赖 users, categories
            'tools', // 工具表（独立表）
            'notes', // 依赖 users
            'refresh_tokens', // 依赖 users

            // 第三层：依赖第二层表
            'comments', // 依赖 users, articles
            'article_tags', // 依赖 articles, tags
            'article_likes', // 依赖 articles, users
            'comment_likes', // 依赖 comments, users
            'collection_articles', // 依赖 collections, articles
            'article_views', // 依赖 articles, users
            'user_follows', // 依赖 users (self-reference)
            'tag_follows', // 依赖 users, tags
            'notifications', // 依赖 users
        ];

        for (const tableName of tableOrder) {
            const exists = await checkTableExists(tableName);

            if (!exists) {
                // 创建新表
                const fields = TABLES[tableName];
                const sql = generateCreateTableSQL(tableName, fields);
                try {
                    await executeWithRetry(sql);
                    console.log(`表 ${tableName} 创建成功`);
                    // 更新缓存
                    cache[tableName] = getTableHash(tableName, fields);
                    cacheUpdated = true;
                } catch (error) {
                    console.error(`创建表 ${tableName} 失败:`, error);
                    console.error('SQL:', sql);
                    throw error;
                }
            } else {
                // 检查并更新已存在的表
                const needsUpdate = await checkTableNeedsUpdate(
                    tableName,
                    cache
                );
                if (needsUpdate) {
                    await updateTable(tableName);
                    console.log(`表 ${tableName} 结构已更新`);
                    // 更新缓存
                    cache[tableName] = getTableHash(
                        tableName,
                        TABLES[tableName]
                    );
                    cacheUpdated = true;
                } else {
                    // console.log(`表 ${tableName} 无需更新`);
                }
            }
        }

        // 如果有缓存更新，写入缓存文件
        if (cacheUpdated) {
            await writeCache(cache);
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
