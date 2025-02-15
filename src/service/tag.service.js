const connection = require('../app/database');

class TagService {
    // 创建标签
    async create(name) {
        const statement = `INSERT INTO tags (name) VALUES (?)`;
        const [result] = await connection.execute(statement, [name]);
        return result;
    }

    // 删除标签
    async remove(tagId) {
        // 首先检查标签是否被文章使用
        const checkStatement = `
            SELECT COUNT(*) as count 
            FROM article_tags 
            WHERE tag_id = ?
        `;
        const [checkResult] = await connection.execute(checkStatement, [tagId]);
        
        if (checkResult[0].count > 0) {
            throw new Error('该标签已被文章使用，无法删除');
        }

        const statement = `DELETE FROM tags WHERE id = ?`;
        const [result] = await connection.execute(statement, [tagId]);
        return result;
    }

    // 更新标签
    async update(tagId, name) {
        const statement = `UPDATE tags SET name = ? WHERE id = ?`;
        const [result] = await connection.execute(statement, [name, tagId]);
        return result;
    }

    // 获取标签列表
    async getList() {
        const statement = `
            SELECT id, name, created_at, updated_at 
            FROM tags 
            ORDER BY created_at DESC
        `;
        const [result] = await connection.execute(statement);
        return result;
    }

    // 获取单个标签
    async getById(tagId) {
        const statement = `
            SELECT id, name, created_at, updated_at 
            FROM tags 
            WHERE id = ?
        `;
        const [result] = await connection.execute(statement, [tagId]);
        return result[0];
    }

    // 检查标签名是否存在
    async isNameExist(name, excludeId = null) {
        let statement = `SELECT COUNT(*) as count FROM tags WHERE name = ?`;
        const params = [name];
        
        if (excludeId) {
            statement += ` AND id != ?`;
            params.push(excludeId);
        }
        
        const [result] = await connection.execute(statement, params);
        return result[0].count > 0;
    }
}

module.exports = new TagService(); 