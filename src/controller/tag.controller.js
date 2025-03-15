const tagService = require('../service/tag.service');
const { handeleSuccessReturnMessage } = require('../utils');

class TagController {
    // 创建标签
    async create(ctx) {
        const { name, svg_icon } = ctx.request.body;
        console.log('name', name, 'svg_icon', svg_icon);
        // 验证标签名
        if (!name || name.trim().length === 0) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: '标签名不能为空',
            };
            return;
        }

        // 检查标签名是否已存在
        const exists = await tagService.isNameExist(name);
        if (exists) {
            ctx.status = 409;
            ctx.body = {
                code: 409,
                message: '标签名已存在',
            };
            return;
        }

        // 创建标签
        const result = await tagService.create(name, svg_icon);
        ctx.body = {
            code: 200,
            message: '创建成功',
            data: result,
        };
    }

    // 删除标签
    async remove(ctx) {
        const { tagId } = ctx.request.body;
        try {
            await tagService.remove(tagId);
            ctx.body = {
                code: 200,
                message: '删除成功',
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: error.message,
            };
        }
    }

    // 更新标签
    async update(ctx) {
        const { name, tagId, svg_icon } = ctx.request.body;
        console.log('name', name, 'tagId', tagId);
        console.log('svg_icon', svg_icon);
        // 验证标签名
        if (!name || name.trim().length === 0) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: '标签名不能为空',
            };
            return;
        }

        // 检查标签名是否已存在（排除当前标签）
        const exists = await tagService.isNameExist(name, tagId);
        if (exists) {
            ctx.status = 409;
            ctx.body = {
                code: 409,
                message: '标签名已存在',
            };
            return;
        }

        const result = await tagService.update(tagId, name, svg_icon);
        console.log('result', result);
        ctx.body = {
            code: 200,
            message: '更新成功',
            data: result,
        };
    }

    // 获取标签列表
    async getTagList(ctx) {
        const currentUserId = ctx.userinfo ? ctx.userinfo.id : null;
        const result = await tagService.getList(currentUserId);
        handeleSuccessReturnMessage(ctx, '获取成功', {
            tags: result.tags,
            total: result.total,
        });
    }

    // 获取单个标签
    async getTagById(ctx) {
        const { tagId } = ctx.request.body;
        const currentUserId = ctx.userinfo ? ctx.userinfo.id : null;
        const tag = await tagService.getById(tagId, currentUserId);

        if (!tag) {
            ctx.status = 404;
            ctx.body = {
                code: 404,
                message: '标签不存在',
            };
            return;
        }

        ctx.body = {
            code: 200,
            data: tag,
        };
    }
}

module.exports = new TagController();
