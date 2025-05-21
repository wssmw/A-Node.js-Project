const connection = require('../app/database');

class CategoryService {
    // 创建分类
    async create(name, svg_icon) {
        const statement = `INSERT INTO categories (name, svg_icon) VALUES (?, ?)`;
        const [result] = await connection.execute(statement, [name, svg_icon]);
        return result;
    }

    // 删除分类
    async remove(categoryId) {
        // 首先检查分类是否被文章使用
        const checkStatement = `
            SELECT COUNT(*) as count 
            FROM articles 
            WHERE category_id = ?
        `;
        const [checkResult] = await connection.execute(checkStatement, [
            categoryId,
        ]);

        if (checkResult[0].count > 0) {
            throw new Error('该分类下有文章，无法删除');
        }

        const statement = `DELETE FROM categories WHERE id = ?`;
        const [result] = await connection.execute(statement, [categoryId]);
        return result;
    }

    // 更新分类
    async update(categoryId, name, svg_icon) {
        const statement = `UPDATE categories SET name = ?, svg_icon = ? WHERE id = ?`;
        const [result] = await connection.execute(statement, [
            name,
            svg_icon,
            categoryId,
        ]);
        return result;
    }

    // 获取分类列表
    async getList() {
        // 获取分类列表
        const statement = `
            SELECT 
                c.id, 
                c.name, 
                c.svg_icon,
                c.created_at, 
                c.updated_at,
                COUNT(a.id) as article_count
            FROM categories c
            LEFT JOIN articles a ON c.id = a.category_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        const [categories] = await connection.execute(statement);

        // 获取总数
        const countStatement = `SELECT COUNT(*) as total FROM categories`;
        const [countResult] = await connection.execute(countStatement);

        return {
            categories,
            total: countResult[0].total,
        };
    }

    // 获取单个分类
    async getById(categoryId) {
        const statement = `
            SELECT 
                c.id, 
                c.name, 
                c.svg_icon,
                c.created_at, 
                c.updated_at,
                COUNT(a.id) as article_count
            FROM categories c
            LEFT JOIN articles a ON c.id = a.category_id
            WHERE c.id = ?
            GROUP BY c.id
        `;
        const [result] = await connection.execute(statement, [categoryId]);
        return result[0];
    }

    // 检查分类名是否存在
    async isNameExist(name, excludeId = null) {
        let statement = `SELECT COUNT(*) as count FROM categories WHERE name = ?`;
        const params = [name];

        if (excludeId) {
            statement += ` AND id != ?`;
            params.push(excludeId);
        }

        const [result] = await connection.execute(statement, params);
        return result[0].count > 0;
    }
}

module.exports = new CategoryService();
