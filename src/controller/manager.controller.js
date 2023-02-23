const service=require('../service/manager.service')

class ManagerController {
    async create(ctx,next) {
        // 获取用户请求的参数
        const user=ctx.request.body

        // 查询数据
        const res = await service.create(user)

        // // 返回数据
        ctx.body=res
    }
    async addBook (ctx,next) {
        console.log(1);
        const {bookname,nums,price} = ctx.request.body
        console.log(bookname);
        // 1.判断数据库中是否已经有这本书
        const res = await service.SelectBook(bookname)
        console.log(res.length);
        if(res.length==0){
            // 数据库中没有这本书
            const result = await service.CreateBook(bookname,nums,price)
            ctx.body=result
        }else {
            const result = await service.addBook(bookname,nums)
            ctx.body=result
        }
    }
}

module.exports = new ManagerController()