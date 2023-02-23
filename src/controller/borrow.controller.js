const service=require('../service/borrow.service')

class BorrowController {
    async search(ctx,next) {
        // 获取用户请求的参数
        const {bookname}=ctx.request.body

        // 查询数据
        const res = await service.search(bookname)

        // 返回数据
        ctx.body=res[0]
    }
    async borrow (ctx,next){
        const {nums,bookname} = ctx.request.body
        const {username } = ctx.userinfo
        console.log(username,nums);
        const res = await service.update(username,bookname,nums)

        ctx.body=res
    }
    async returnbook (ctx,next) {
        const {username} = ctx.userinfo
        const {bookname,nums} = ctx.request.body
        console.log(username,bookname,nums);
        const res = await service.update(username,bookname,nums,false)

        ctx.body = res
    }
}

module.exports = new BorrowController()