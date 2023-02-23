const jwt = require('jsonwebtoken')

const {PRIVATE_KEY} = require('../app/config')

class LoginController {
    async login (ctx,next) {
        console.log(ctx.userinfo);
        const { id, username } = ctx.userinfo
        console.log(id,username);
        const token = jwt.sign({id, username}, PRIVATE_KEY , {
            expiresIn:60*60*24,
            algorithm:'RS256'
        })
        console.log(token);
        ctx.body = {
            id,
            username,
            token
        }
    }
    async seccess (ctx,next) {
        ctx.body = "授权成功"
    }
}

module.exports = new LoginController() 