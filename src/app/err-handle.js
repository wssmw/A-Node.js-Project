const errType = require('./err.message')

const errHandle = (err,ctx)=>{
    let status,message
    console.log(err);
    switch (err.message){
        case errType.NAME_OR_PASSWORD_IS_NULL:
            status=404,
            message="用户名或密码不能为空"
            break;
        case errType.USER_ALREADY_EXISTS:
            status=409,
            message = '用户名已经存在'
            break
        default:
            status=404,
            message = "NOT FOUND"
    }
    ctx.body=message,
    ctx.status=status
}

module.exports = errHandle 
