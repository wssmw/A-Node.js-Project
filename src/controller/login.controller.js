const jwt = require("jsonwebtoken");

const { PRIVATE_KEY } = require("../app/config");
const service = require("../service/user.service");

class LoginController {
    async login(ctx, next) {
        console.log(ctx.userinfo);
        const { id, username } = ctx.userinfo;
        console.log(id, username);
        const token = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24,
            algorithm: "RS256",
        });
        console.log(token);
        ctx.body = {
            token,
            ...ctx.userinfo,
        };
    }
    async loginWithGitee(ctx, next) {
        let userInfo = ctx.userInfo;
        let { username } = userInfo;
        // 1.判断用户名是否存在
        let result = await service.getUsernameByusername(username);
        const userinfo = result[0];

        if (!userinfo) {
            const res = await service.create(userInfo);
        } else {
            const res = await service.update(userInfo)
        }
        result = await service.getUsernameByusername(username);
        let { id } = result
        const token = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24,
            algorithm: "RS256",
        });
        ctx.redirect('http://localhost:8000')
        ctx.body = {
            token,
            userInfo: {
                ...result[0]
            }
        };
    }
    async seccess(ctx, next) {
        ctx.body = "授权成功";
    }
}

module.exports = new LoginController();
