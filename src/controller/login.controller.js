class LoginController {
    async login (ctx,next) {
        console.log(1);
        const { username } = ctx.request.body;
        console.log(username);
        ctx.body = `登陆成功，欢迎回来`
    }
}

module.exports = new LoginController()