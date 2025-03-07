const Router = require('koa-router');
const { verifyAuth, verifyAuthOptional } = require('../middleware/login.middleware');
const {
    createCollection,
    updateCollection,
    deleteCollection,
    getUserCollections,
    addArticleToCollection,
    removeArticleFromCollection,
    getCollectionArticles
} = require('../controller/collection.controller');

const collectionRouter = new Router({ prefix: '/collection' });

// 创建收藏夹
collectionRouter.post('/create', verifyAuth, createCollection);

// 更新收藏夹
collectionRouter.post('/update', verifyAuth, updateCollection);

// 删除收藏夹
collectionRouter.post('/delete', verifyAuth, deleteCollection);

// 获取当前用户的收藏夹列表（需要登录）
// collectionRouter.get('/getCurrentUserCollections', verifyAuth, getCurrentUserCollections);

// 获取其他用户的收藏夹列表（不需要登录）
collectionRouter.post('/getUserCollections', verifyAuthOptional,getUserCollections);

// 添加文章到收藏夹
collectionRouter.post('/addArticle', verifyAuth, addArticleToCollection);

// 从收藏夹移除文章
collectionRouter.post('/removeArticle', verifyAuth, removeArticleFromCollection);

// 获取收藏夹中的文章列表（支持可选登录）
collectionRouter.post('/getCollectionArticles', verifyAuthOptional, getCollectionArticles);

module.exports = collectionRouter; 