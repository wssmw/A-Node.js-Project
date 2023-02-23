const Router = require('koa-router')

const { login,seccess } = require('../controller/login.controller')

const {verifyLogin,verifyAuth} = require('../middleware/login.middleware')

const loginRouter = new Router()
                        // 验证登录的中间件
loginRouter.post('/login', verifyLogin, login)

// 验证登录是否成功
loginRouter.get('/test', verifyAuth, seccess)

module.exports = loginRouter