const Router = require('koa-router');

const {
    login,
    seccess,
    loginWithGitee,
    refreshToken,
    logout,
} = require('../controller/login.controller');

const {
    verifyLogin,
    verifyAuth,
    getAccessToken,
    redirectLogin,
} = require('../middleware/login.middleware');

const loginRouter = new Router();
// 验证登录的中间件
// 登录
loginRouter.post('/login', verifyLogin, login);
// 刷新令牌
loginRouter.post('/refresh-token', refreshToken);
// 登出
loginRouter.post('/logout', logout);

// gitee登录
// loginRouter.post("/login/gitee", getAccessToken, loginWithGitee);
loginRouter.get('/login/gitee', redirectLogin);
loginRouter.get('/login/gitee/callback', getAccessToken, loginWithGitee);

// 验证登录是否成功
loginRouter.get('/test', verifyAuth, seccess);

module.exports = loginRouter;
