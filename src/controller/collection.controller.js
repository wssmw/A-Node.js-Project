const collectionService = require('../service/collection.service');
const { handeleSuccessReturnMessage, handeleErrorReturnMessage } = require('../utils');

class CollectionController {
    // 创建收藏夹
    async createCollection(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { name, description, isPublic } = ctx.request.body;

            if (!name || name.trim().length === 0) {
                handeleErrorReturnMessage(ctx, '收藏夹名称不能为空');
                return;
            }

            const result = await collectionService.createCollection(
                userId,
                name,
                description,
                isPublic
            );

            handeleSuccessReturnMessage(ctx, '创建成功', { id: result.insertId });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '创建失败: ' + error.message);
        }
    }

    // 更新收藏夹
    async updateCollection(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { collectionId, ...updates } = ctx.request.body;

            if (!collectionId) {
                handeleErrorReturnMessage(ctx, '收藏夹ID不能为空');
                return;
            }

            const result = await collectionService.updateCollection(collectionId, userId, updates);
            if (!result || result.affectedRows === 0) {
                handeleErrorReturnMessage(ctx, '更新失败，可能没有权限或收藏夹不存在');
                return;
            }

            handeleSuccessReturnMessage(ctx, '更新成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '更新失败: ' + error.message);
        }
    }

    // 删除收藏夹
    async deleteCollection(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { collectionId } = ctx.request.body;

            if (!collectionId) {
                handeleErrorReturnMessage(ctx, '收藏夹ID不能为空');
                return;
            }

            const result = await collectionService.deleteCollection(collectionId, userId);
            if (result.affectedRows === 0) {
                handeleErrorReturnMessage(ctx, '删除失败，可能没有权限或收藏夹不存在');
                return;
            }

            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '删除失败: ' + error.message);
        }
    }

    // 获取用户的收藏夹列表
    async getUserCollections(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const collections = await collectionService.getUserCollections(userId);
            
            handeleSuccessReturnMessage(ctx, '获取成功', { collections });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 添加文章到收藏夹
    async addArticleToCollection(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { collectionId, articleId } = ctx.request.body;

            if (!collectionId || !articleId) {
                handeleErrorReturnMessage(ctx, '收藏夹ID和文章ID不能为空');
                return;
            }

            await collectionService.addArticleToCollection(collectionId, articleId, userId);
            handeleSuccessReturnMessage(ctx, '收藏成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '收藏失败: ' + error.message);
        }
    }

    // 从收藏夹移除文章
    async removeArticleFromCollection(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { collectionId, articleId } = ctx.request.body;

            if (!collectionId || !articleId) {
                handeleErrorReturnMessage(ctx, '收藏夹ID和文章ID不能为空');
                return;
            }

            await collectionService.removeArticleFromCollection(collectionId, articleId, userId);
            handeleSuccessReturnMessage(ctx, '移除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '移除失败: ' + error.message);
        }
    }

    // 获取收藏夹中的文章列表
    async getCollectionArticles(ctx) {
        try {
            const userId = ctx.userinfo ? ctx.userinfo.id : null;
            const { collectionId, page = 1, pageSize = 10 } = ctx.request.body;

            if (!collectionId) {
                handeleErrorReturnMessage(ctx, '收藏夹ID不能为空');
                return;
            }

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const result = await collectionService.getCollectionArticles(
                collectionId,
                userId,
                offset,
                parseInt(pageSize)
            );

            handeleSuccessReturnMessage(ctx, '获取成功', {
                articles: result.articles,
                total: result.total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 获取当前用户的收藏夹列表
    async getCurrentUserCollections(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const collections = await collectionService.getCurrentUserCollections(userId);
            
            handeleSuccessReturnMessage(ctx, '获取成功', { collections });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }

    // 获取其他用户的收藏夹列表
    async getOtherUserCollections(ctx) {
        try {
            const { userId } = ctx.request.body;

            if (!userId) {
                handeleErrorReturnMessage(ctx, '用户ID不能为空');
                return;
            }

            const collections = await collectionService.getOtherUserCollections(userId);
            handeleSuccessReturnMessage(ctx, '获取成功', { collections });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '获取失败: ' + error.message);
        }
    }
}

module.exports = new CollectionController(); 