const connection = require('../app/database');

class TagService {
    // 创建标签
    async create(name, svg_icon = null) {
        try {
            const statement = `INSERT INTO tags (name, svg_icon) VALUES (?, ?)`;
            const [result] = await connection.execute(statement, [
                name,
                svg_icon,
            ]);
            return result;
        } catch (error) {
            console.error('创建标签失败:', error);
            throw new Error('创建标签失败: ' + error.message);
        }
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
    async update(tagId, name, svg_icon = null) {
        try {
            const statement = `UPDATE tags SET name = ?, svg_icon = ? WHERE id = ?`;
            const [result] = await connection.execute(statement, [
                name,
                svg_icon,
                tagId,
            ]);
            return result;
        } catch (error) {
            console.error('更新标签失败:', error);
            throw new Error('更新标签失败: ' + error.message);
        }
    }

    // 获取标签列表
    async getList() {
        // 获取标签列表
        const statement = `
            SELECT 
                t.id, 
                t.name,
                t.svg_icon,
                t.created_at, 
                t.updated_at,
                COUNT(at.article_id) as article_count,
                COUNT(tf.id) as follower_count,
                (COUNT(at.article_id) * 1 + COUNT(tf.id) * 2) as hot_score
            FROM tags t
            LEFT JOIN article_tags at ON t.id = at.tag_id
            LEFT JOIN tag_follows tf ON t.id = tf.tag_id
            GROUP BY t.id
            ORDER BY hot_score DESC, t.created_at DESC
        `;
        const [tags] = await connection.execute(statement);

        // 获取总数
        const countStatement = `SELECT COUNT(*) as total FROM tags`;
        const [countResult] = await connection.execute(countStatement);

        return {
            tags,
            total: countResult[0].total,
        };
    }

    // 获取单个标签
    async getById(tagId) {
        const statement = `
            SELECT 
                t.id, 
                t.name, 
                t.svg_icon,
                t.created_at, 
                t.updated_at,
                COUNT(at.article_id) as article_count,
                COUNT(tf.id) as follower_count,
                (COUNT(at.article_id) * 1 + COUNT(tf.id) * 2) as hot_score
            FROM tags t
            LEFT JOIN article_tags at ON t.id = at.tag_id
            LEFT JOIN tag_follows tf ON t.id = tf.tag_id
            WHERE t.id = ?
            GROUP BY t.id
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
