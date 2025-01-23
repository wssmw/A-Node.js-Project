const Router = require('koa-router')
const { verifyAuth } = require('../middleware/login.middleware')
const { create, updateInfo } = require('../controller/user.controller')
const { verifyUser, handlePassword } = require('../middleware/user.middleware')
const handleFile = require('../middleware/file.middleware')

const userRouter = new Router({ prefix: '/users' })

userRouter.post('/register', verifyUser, handlePassword, create)

// 更新用户信息（需要登录），使用默认的 'avatar' 字段名
userRouter.post('/updateInfo', verifyAuth, handleFile(), updateInfo)

module.exports = userRouter