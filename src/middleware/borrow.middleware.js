const service = require('../service/borrow.service')
const errType = require("../app/err.message")
const verifyBook = async (ctx,next) =>{
    // 1.查看数据库中是否还有这本书
    const {bookname} = ctx.request.body
    const result = await service.search(bookname)
    console.log(result);
    // 判断是都有这本书
    if(result.length>0){
        const {nums} = result[0]
        // 判断这本书可有
        if(nums>0){
            await next()
        }else {
            ctx.body="这本书已经被借完啦~"
        }
    }else {
        ctx.body = "图书馆里没有这本书"
    }
}

module.exports = {
    verifyBook
}