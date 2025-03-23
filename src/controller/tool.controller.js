const toolService = require('../service/tool.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class ToolController {
    // 获取所有工具
    async getAllTools(ctx) {
        try {
            const tools = await toolService.getAllTools();
            handeleSuccessReturnMessage(ctx, '获取成功', { tools });
        } catch (error) {
            handeleErrorReturnMessage(
                ctx,
                '获取工具箱数据失败: ' + error.message
            );
        }
    }

    // 根据分类获取工具
    async getToolsByCategory(ctx) {
        try {
            const { categoryKey } = ctx.params;
            const tools = await toolService.getToolsByCategory(categoryKey);
            handeleSuccessReturnMessage(ctx, '获取成功', { tools });
        } catch (error) {
            handeleErrorReturnMessage(
                ctx,
                '获取工具数据失败: ' + error.message
            );
        }
    }

    // 创建工具分类
    async createCategory(ctx) {
        try {
            const { category, icon_url } = ctx.request.body;
            console.log(category, icon_url, 'category, icon_url');
            // 验证必填字段
            if (!category || !icon_url) {
                handeleErrorReturnMessage(ctx, '分类名称和图标不能为空');
                return;
            }

            const result = await toolService.createCategory({
                category,
                icon_url,
            });
            handeleSuccessReturnMessage(ctx, '创建成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '创建分类失败: ' + error.message);
        }
    }

    // 更新工具分类
    async updateCategory(ctx) {
        try {
            const { category, icon_url, categoryId } = ctx.request.body;

            if (!category || !icon_url) {
                handeleErrorReturnMessage(ctx, '分类名称和图标不能为空');
                return;
            }

            const result = await toolService.updateCategory(categoryId, {
                category,
                icon_url,
            });
            handeleSuccessReturnMessage(ctx, '更新成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '更新分类失败: ' + error.message);
        }
    }

    // 删除工具分类
    async deleteCategory(ctx) {
        try {
            const { categoryId } = ctx.params;
            await toolService.deleteCategory(categoryId);
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '删除分类失败: ' + error.message);
        }
    }

    // 创建工具
    async createTool(ctx) {
        try {
            const { category_id, name, description, icon_url, website } =
                ctx.request.body;

            // 验证必填字段
            if (
                !category_id ||
                !name ||
                !description ||
                !icon_url ||
                !website
            ) {
                handeleErrorReturnMessage(ctx, '所有字段都是必填的');
                return;
            }

            const result = await toolService.createTool({
                category_id,
                name,
                description,
                icon_url,
                website,
            });
            handeleSuccessReturnMessage(ctx, '创建成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '创建工具失败: ' + error.message);
        }
    }

    // 更新工具
    async updateTool(ctx) {
        try {
            const { toolId } = ctx.params;
            const { name, description, icon_url, website, category_id } =
                ctx.request.body;

            if (
                !name ||
                !description ||
                !icon_url ||
                !website ||
                !category_id
            ) {
                handeleErrorReturnMessage(ctx, '所有字段都是必填的');
                return;
            }

            const result = await toolService.updateTool(toolId, {
                name,
                description,
                icon_url,
                website,
                category_id,
            });
            handeleSuccessReturnMessage(ctx, '更新成功', result);
        } catch (error) {
            handeleErrorReturnMessage(ctx, '更新工具失败: ' + error.message);
        }
    }

    // 删除工具
    async deleteTool(ctx) {
        try {
            const { toolId } = ctx.params;
            await toolService.deleteTool(toolId);
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '删除工具失败: ' + error.message);
        }
    }
}

module.exports = new ToolController();
