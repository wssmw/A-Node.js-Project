const errType = require('./err.message');

const errHandle = (err, ctx) => {
    let status, message;
    console.log(err);
    switch (err.message) {
        case errType.NAME_OR_PASSWORD_IS_NULL:
            (status = 404), (message = '用户名或密码不能为空');
            break;
        case errType.USER_ALREADY_EXISTS:
            (status = 409), (message = '用户名已经存在');
            break;
        case errType.USER_DOES_NOT_EXISTS:
            (status = 400), (message = '用户不存在');
            break;
        case errType.PASSWORD_IS_INCORRENT:
            (status = 400), (message = '密码错误');
            break;
        case errType.UNAUTHORIZATION:
            (status = 400), (message = '无效的token');
            break;
        case errType.MANAGER_NOT_AUTH:
            (status = 400), (message = '管理员的权限不够');
            break;
        default:
            (status = 404), (message = 'NOT FOUND');
    }
    (ctx.body = message), (ctx.status = status);
};

module.exports = errHandle;
