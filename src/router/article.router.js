const Router = require('koa-router')
const { verifyAuth } = require('../middleware/login.middleware')
const { create, findById, find } = require('../controller/article.controller')

const articleRouter = new Router({ prefix: '/article' })

// 创建文章（需要登录）
articleRouter.post('/', verifyAuth, create)

// 获取文章列表（不需要登录）
articleRouter.post('/getArticle', find)

// 获取文章详情（不需要登录）
articleRouter.post('/getArticle/:id', findById)

module.exports = articleRouter 