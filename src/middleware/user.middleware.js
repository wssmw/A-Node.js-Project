const errType = require('../app/err.message');

const service = require('../service/user.service');

const md5password = require('../utils/passwordhandle');

const verifyUser = async (ctx, next) => {
    // 1.获取用户名和密码
    const { username, password } = ctx.request.body;

    // 2.判断用户名和密码是否为空
    if (username === '' || password === '' || !username || !password) {
        const err = new Error(errType.NAME_OR_PASSWORD_IS_NULL);
        return ctx.app.emit('err', err, ctx);
    }
    // 3.判断该用户名是否已经被注册过

    const result = await service.getUsernameByusername(username);
    console.log(username, result.length);
    if (result.length) {
        const err = new Error(errType.USER_ALREADY_EXISTS);
        return ctx.app.emit('err', err, ctx);
    }

    await next();
};

const handlePassword = async (ctx, next) => {
    let { password } = ctx.request.body;
    console.log(password);
    ctx.request.body.password = md5password(password + '');

    await next();
};

module.exports = {
    verifyUser,
    handlePassword,
};
