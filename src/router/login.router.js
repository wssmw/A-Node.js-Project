const Router = require('koa-router')

const { login } = require('../controller/login.controller')

const verifyLogin = require('../middleware/login.middleware')

const loginRouter = new Router()

loginRouter.post('/login', verifyLogin, login)

module.exports = loginRouter