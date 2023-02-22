const Koa=require('koa')

const userRouter=require('../router/user.router')

const bodyParser = require('koa-bodyparser')

const errHandle = require('./err-handle')

const app=new Koa()

app.use(bodyParser()) //把传入的json数据解析

app.use(userRouter.routes())

app.use(userRouter.allowedMethods())

app.on('err',errHandle)

module.exports=app