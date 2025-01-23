const Koa=require('koa')

const userRouter=require('../router/user.router')
const loginRouter = require('../router/login.router')

const { initDatabase } = require('../schema/init')

const bodyParser = require('koa-bodyparser')

const errHandle = require('./err-handle')

const useRouters = require('../router/index')

const app=new Koa()

app.use(bodyParser()) //把传入的json数据解析

// 初始化数据库（包括检查更新）
initDatabase().catch(err => {
  console.error('数据库初始化/更新失败:', err)
  process.exit(1)
})

useRouters(app)

app.on('err',errHandle)

module.exports=app