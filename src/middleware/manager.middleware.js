const service = require('../service/manager.service');
const errType = require('../app/err.message');
const verifyManager = async (ctx, next) => {
    console.log('验证权限是否够');
    // 1.获取用户基本信息
    const { id } = ctx.userinfo;
    const result = await service.SelectAuth(id);
    // 2.判断权限是否够
    const auth = result[0].auth;
    console.log(auth);
    if (auth >= 2) {
        await next();
    } else {
        const err = new Error(errType.MANAGER_NOT_AUTH);
        return ctx.app.emit('err', err, ctx);
    }
};
const verifyUserIsHas = async (ctx, next) => {
    const { username } = ctx.request.body;
    const IsHaveUsername = await service.getUsernameByUsername(username);
    if (IsHaveUsername.length >= 1) {
        const err = new Error(errType.USER_ALREADY_EXISTS);
        return ctx.app.emit('err', err, ctx);
    }
    await next();
};
module.exports = {
    verifyManager,
    verifyUserIsHas,
};
