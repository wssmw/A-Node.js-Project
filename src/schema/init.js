const connection = require('../app/database')
const TABLES = require('./tables')

/**
 * 检查表是否存在
 * @param {string} tableName 表名
 * @returns {Promise<boolean>}
 */
async function checkTableExists(tableName) {
  try {
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?
    `, [tableName])
    return rows[0].count > 0
  } catch (error) {
    console.error(`检查表 ${tableName} 是否存在时出错:`, error)
    throw error
  }
}

/**
 * 获取表的当前结构
 * @param {string} tableName 表名
 * @returns {Promise<Array>}
 */
async function getTableColumns(tableName) {
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
    FROM information_schema.columns 
    WHERE table_schema = DATABASE()
    AND table_name = ?
  `, [tableName])
  return columns
}

/**
 * 检查表结构是否需要更新
 * @param {string} tableName 表名
 * @returns {Promise<boolean>}
 */
async function checkTableNeedsUpdate(tableName) {
  const currentColumns = await getTableColumns(tableName)
  const definedFields = TABLES[tableName]

  // 将当前列转换为更易比较的格式
  const currentColumnMap = currentColumns.reduce((map, col) => {
    map[col.COLUMN_NAME] = {
      type: col.COLUMN_TYPE.toUpperCase(),
      nullable: col.IS_NULLABLE === 'YES',
      default: col.COLUMN_DEFAULT,
      extra: col.EXTRA,
      comment: col.COLUMN_COMMENT
    }
    return map
  }, {})

  // 检查是否有新增或修改的字段
  for (const [fieldName, definition] of Object.entries(definedFields)) {
    if (fieldName === 'FOREIGN KEY') continue // 跳过外键定义

    // 解析定义的字段类型和属性
    const [type, ...props] = definition.split(' ')
    const isNullable = !props.includes('NOT NULL')
    const hasDefault = props.includes('DEFAULT')
    const commentMatch = definition.match(/COMMENT "([^"]*)"/)
    const definedComment = commentMatch ? commentMatch[1] : null

    const currentColumn = currentColumnMap[fieldName]
    
    // 如果字段不存在，或者属性不匹配，则需要更新
    if (!currentColumn || 
        currentColumn.type !== type ||
        currentColumn.nullable !== isNullable ||
        (definedComment && currentColumn.comment !== definedComment)) {
      return true
    }
  }

  // 检查是否有需要删除的字段
  const definedFieldNames = Object.keys(definedFields).filter(name => name !== 'FOREIGN KEY')
  const extraColumns = Object.keys(currentColumnMap).filter(
    colName => !definedFieldNames.includes(colName)
  )

  return extraColumns.length > 0
}

/**
 * 更新表结构
 * @param {string} tableName 表名
 */
async function updateTable(tableName) {
  const fields = TABLES[tableName]
  // 生成ALTER TABLE语句
  // TODO: 实现具体的更新逻辑
  console.log(`表 ${tableName} 结构已更新`)
}

/**
 * 生成建表SQL
 * @param {string} tableName 表名
 * @param {object} fields 字段定义
 */
function generateCreateTableSQL(tableName, fields) {
  const fieldDefinitions = []
  console.log(fields,'fields')
  for (const [field, definition] of Object.entries(fields)) {
    if (field === 'FOREIGN KEY') {
      fieldDefinitions.push(`FOREIGN KEY ${definition}`)
    } else {
      fieldDefinitions.push(`${field} ${definition}`)
    }
  }
  
  return `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${fieldDefinitions.join(',\n      ')}
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `
}

/**
 * 初始化或更新数据库表
 */
async function initDatabase() {
  try {
    // 修改表名从 articleTags 到 article_tags
    const tableOrder = ['users', 'categories', 'tags', 'articles', 'article_tags']
    
    for (const tableName of tableOrder) {
      const exists = await checkTableExists(tableName)
      
      if (!exists) {
        // 表不存在，创建新表
        const fields = TABLES[tableName]
        console.log(TABLES,'fields')
        const sql = generateCreateTableSQL(tableName, fields)
        await connection.execute(sql)
        console.log(`表 ${tableName} 创建成功`)
      }
    }
    console.log('数据库初始化/更新完成')
  } catch (error) {
    console.error('数据库初始化/更新失败:', error)
    throw error
  }
}

// 如果需要初始化数据库，取消下面的注释
initDatabase()

module.exports = {
  initDatabase,
  TABLES,
  checkTableExists,
  checkTableNeedsUpdate,
  updateTable
} 