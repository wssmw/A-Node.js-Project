const service=require('../service/user.service')

class UserController {
    async create(ctx,next) {
        // 获取用户请求的参数
        const user=ctx.request.body

        console.log(user);

        // 查询数据
        const res = await service.create(user)

        // 返回数据
        ctx.body=res
    }
}

module.exports = new UserController()