const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class ToolService {
    // 获取所有工具和分类
    async getAllTools() {
        try {
            // 获取所有分类
            const categoryStatement = `
                SELECT id, category, icon_url, svg_icon
                FROM tool_categories
                ORDER BY id ASC
            `;
            const [categories] = await connection.execute(categoryStatement);

            // 获取所有工具
            const toolStatement = `
                SELECT 
                    t.id,
                    t.category_id,
                    t.name,
                    t.description,
                    t.icon_url,
                    t.svg_icon,
                    t.website
                FROM tools t
                ORDER BY t.id ASC
            `;
            const [tools] = await connection.execute(toolStatement);

            // 组织返回数据结构
            const result = categories.map(category => ({
                id: category.id,
                category: category.category,
                iconUrl: category.icon_url,
                svgIcon: category.svg_icon,
                items: tools
                    .filter(tool => tool.category_id === category.id)
                    .map(tool => ({
                        id: tool.id,
                        name: tool.name,
                        description: tool.description,
                        iconUrl: tool.icon_url,
                        svgIcon: tool.svg_icon,
                        website: tool.website,
                    })),
            }));

            return result;
        } catch (error) {
            console.error('获取工具箱数据失败:', error);
            throw error;
        }
    }

    // 根据分类获取工具
    async getToolsByCategory(categoryKey) {
        const statement = `
            SELECT 
                t.id,
                t.name,
                t.description,
                t.icon_url,
                t.svg_icon,
                t.website
            FROM tools t
            JOIN tool_categories tc ON t.category_id = tc.id
            WHERE tc.id = ?
            ORDER BY t.id ASC
        `;
        const [tools] = await connection.execute(statement, [categoryKey]);
        return tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            iconUrl: tool.icon_url,
            svgIcon: tool.svg_icon,
            website: tool.website,
        }));
    }

    // 创建工具分类
    async createCategory(data) {
        const { category, icon_url } = data;
        const statement = `
            INSERT INTO tool_categories (  category, icon_url)
            VALUES (?, ?)
        `;
        const [result] = await connection.execute(statement, [
            category,
            icon_url,
        ]);
        return result;
    }

    // 更新工具分类
    async updateCategory(categoryId, data) {
        const { category, icon_url } = data;
        const statement = `
            UPDATE tool_categories 
            SET category = ?, icon_url = ?
            WHERE id = ?
        `;
        const [result] = await connection.execute(statement, [
            category,
            icon_url,
            categoryId,
        ]);
        return result;
    }

    // 删除工具分类
    async deleteCategory(categoryId) {
        // 检查分类下是否有工具
        const checkStatement = `SELECT COUNT(*) as count FROM tools WHERE category_id = ?`;
        const [checkResult] = await connection.execute(checkStatement, [
            categoryId,
        ]);

        if (checkResult[0].count > 0) {
            throw new Error('该分类下还有工具，无法删除');
        }

        const statement = `DELETE FROM tool_categories WHERE id = ?`;
        const [result] = await connection.execute(statement, [categoryId]);
        return result;
    }

    // 创建工具
    async createTool(data) {
        const id = generateEntityId();

        const { category_id, name, description, icon_url, website } = data;
        const statement = `
            INSERT INTO tools (id, category_id, name, description, icon_url, website)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(statement, [
            id,
            category_id,
            name,
            description,
            icon_url,
            website,
        ]);
        return result;
    }

    // 更新工具
    async updateTool(toolId, data) {
        const { name, description, icon_url, website, category_id } = data;
        const statement = `
            UPDATE tools 
            SET name = ?, description = ?, icon_url = ?, website = ?, category_id = ?
            WHERE id = ?
        `;
        const [result] = await connection.execute(statement, [
            name,
            description,
            icon_url,
            website,
            category_id,
            toolId,
        ]);
        return result;
    }

    // 删除工具
    async deleteTool(toolId) {
        const statement = `DELETE FROM tools WHERE id = ?`;
        const [result] = await connection.execute(statement, [toolId]);
        return result;
    }
}

module.exports = new ToolService();
