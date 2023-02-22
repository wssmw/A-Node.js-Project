const errType = require('../app/err.message')

const service = require('../service/user.service')

const  md5password = require('../utils/passwordhandle')

const verifyLogin = async (ctx,next)=>{
    // 1.拿到用户名和密码
    const {username,password} = ctx.request.body
    // 2.判断账号密码是否为空
    if (username === '' || password === '' || !username || !password) {
        const err = new Error(errType.NAME_OR_PASSWORD_IS_NULL)
        return ctx.app.emit('err', err, ctx)
    }
    // 3.判断用户名是否存在
    const result = await service.getUsernameByusername(username)
    const userinfo = result[0]
    console.log(userinfo,password);
    if (!userinfo) {
        const err = new Error(errType.USER_DOES_NOT_EXISTS)
        return ctx.app.emit('err', err, ctx)
    }
    // 4.判断账号密码和数据库中的是否相同
    if(userinfo.password!=md5password(password)){
        const err = new Error(errType.PASSWORD_IS_INCORRENT)
        return ctx.app.emit('err', err, ctx)
    }

    await next()
}

module.exports = verifyLogin