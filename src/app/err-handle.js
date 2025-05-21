const errType = require('./err.message');

let returnDataChange = (ctx, status, message) => {
    ctx.body = {
        code: status,
        message,
        success: false,
    };
};

const errHandle = (err, ctx) => {
    let status, message;
    console.log(err);
    switch (err.message) {
        case errType.NAME_OR_PASSWORD_IS_NULL:
            returnDataChange(ctx, '404', '用户名或密码不能为空');
            break;
        case errType.USER_ALREADY_EXISTS:
            returnDataChange(ctx, '400', '用户名已经存在');
            break;
        case errType.USER_DOES_NOT_EXISTS:
            returnDataChange(ctx, '400', '用户不存在');
            break;
        case errType.PASSWORD_IS_INCORRENT:
            returnDataChange(ctx, '400', '密码错误');
            break;
        case errType.UNAUTHORIZATION:
            returnDataChange(ctx, '400', '无效的token');
            break;
        case errType.MANAGER_NOT_AUTH:
            returnDataChange(ctx, '400', '管理员的权限不够');
            break;
        default:
            returnDataChange(ctx, '400', 'NOT FOUND');
    }
};

module.exports = errHandle;
