const Router = require('koa-router')

const { create,addBook } = require('../controller/manager.controller')

const { verifyManager,verifyUserIsHas } = require('../middleware/manager.middleware')

const { verifyAuth } = require('../middleware/login.middleware')

const { handlePassword } = require('../middleware/user.middleware')

const managerRouter = new Router()
                            //   验证是否登录  验证权限是否够 验证添加用户名是否存在  添加管理员
managerRouter.post('/addmanager', verifyAuth,verifyManager,verifyUserIsHas, handlePassword, create)

managerRouter.post('/addbook',verifyAuth,verifyManager,addBook)

module.exports = managerRouter