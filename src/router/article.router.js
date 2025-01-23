const Router = require('koa-router')
const { verifyAuth } = require('../middleware/login.middleware')
const { create } = require('../controller/article.controller')

const router = new Router({ prefix: '/articles' })

// 创建文章接口（使用已有的verifyAuth进行登录验证）
router.post('/create', verifyAuth, create)

module.exports = router 