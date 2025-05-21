const categoryService = require('../service/category.service');
const {
    handeleErrorReturnMessage,
    handeleSuccessReturnMessage,
} = require('../utils');

class CategoryController {
    // 创建分类
    async create(ctx) {
        const { name, svg_icon } = ctx.request.body;

        // 验证分类名
        if (!name || name.trim().length === 0) {
            handeleErrorReturnMessage(ctx, '分类名不能为空');
            return;
        }

        // 检查分类名是否已存在
        const exists = await categoryService.isNameExist(name);
        if (exists) {
            handeleErrorReturnMessage(ctx, '分类名已存在', 409);
            return;
        }
        console.log('name', name, 'svg_icon', svg_icon);
        // 创建分类
        const result = await categoryService.create(name, svg_icon);
        handeleSuccessReturnMessage(ctx, '创建成功', result);
    }

    // 删除分类
    async remove(ctx) {
        const { categoryId } = ctx.request.body;
        try {
            await categoryService.remove(categoryId);
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    // 更新分类
    async update(ctx) {
        const { categoryId, name, svg_icon } = ctx.request.body;

        // 验证分类名
        if (!name || name.trim().length === 0) {
            handeleErrorReturnMessage(ctx, '分类名不能为空');
            return;
        }

        // 检查分类名是否已存在（排除当前分类）
        const exists = await categoryService.isNameExist(name, categoryId);
        if (exists) {
            handeleErrorReturnMessage(ctx, '分类名已存在', 409);
            return;
        }

        console.log(
            'categoryId',
            categoryId,
            'name',
            name,
            'svg_icon',
            svg_icon
        );
        const result = await categoryService.update(categoryId, name, svg_icon);
        handeleSuccessReturnMessage(ctx, '更新成功', result);
    }

    // 获取分类列表
    async getCategoryList(ctx) {
        const result = await categoryService.getList();
        handeleSuccessReturnMessage(ctx, '获取成功', {
            categories: result.categories,
            total: result.total,
        });
    }

    // 获取单个分类
    async getCategoryById(ctx) {
        const { categoryId } = ctx.request.body;
        const category = await categoryService.getById(categoryId);

        if (!category) {
            handeleErrorReturnMessage(ctx, '分类不存在', 404);
            return;
        }

        handeleSuccessReturnMessage(ctx, '获取成功', {
            category,
        });
    }
}

module.exports = new CategoryController();
