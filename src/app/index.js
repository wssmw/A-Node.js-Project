const Koa=require('koa')

const userRouter=require('../router/user.router')
const loginRouter = require('../router/login.router')

const bodyParser = require('koa-bodyparser')

const errHandle = require('./err-handle')

const useRouters = require('../router/index')

const app=new Koa()

app.use(bodyParser()) //把传入的json数据解析

useRouters(app)

app.on('err',errHandle)

module.exports=app